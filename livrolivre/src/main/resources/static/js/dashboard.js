document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');
    const emailUsuario = localStorage.getItem('emailUsuario') || localStorage.getItem('usuarioEmail');

    if (!usuarioId || usuarioId === 'null' || !token || token === 'null') {
        console.warn('Credenciais ausentes ou inválidas. Redirecionando...');
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    if (emailUsuario) {
        const menuPrincipal = document.querySelector('.menu-principal');
        if (menuPrincipal) {
            const spanUser = document.createElement('span');
            spanUser.style.float = 'right';
            spanUser.style.color = '#fff';
            spanUser.style.padding = '10px';
            spanUser.style.fontWeight = 'bold';
            spanUser.textContent = emailUsuario;
            menuPrincipal.appendChild(spanUser);
        }
    }

    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const ofertasBody = document.querySelector('#ofertas-tabela tbody');
    const meusLivrosBody = document.querySelector('#tabela-meus-livros tbody');
    const historicoBody = document.querySelector('#historico-tabela tbody');
    const tituloPainel = document.getElementById('titulo-painel');

    if (tituloPainel) {
        tituloPainel.textContent = `Meu Painel`;
    }

    async function fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'login.html';
            return Promise.reject('Sessao expirada');
        }
        return response;
    }

    async function carregarOfertas() {
        if (!ofertasBody) return;
        ofertasBody.innerHTML = '<tr><td colspan="4">Carregando ofertas...</td></tr>';

        try {
            const response = await fetchWithAuth(`/api/transacoes/usuario/${usuarioId}`);
            const ofertas = await response.json();
            ofertasBody.innerHTML = '';

            const ofertasPendentes = ofertas.filter(o => o.status === 'PENDENTE');

            if (ofertasPendentes.length === 0) {
                ofertasBody.innerHTML = '<tr><td colspan="4">Nenhuma oferta recebida.</td></tr>';
                return;
            }

            ofertasPendentes.forEach(oferta => {
                const tr = document.createElement('tr');

                const solicitanteEmail = oferta.solicitante ? oferta.solicitante.email : 'Anônimo';
                const livroSolicitadoTitulo = oferta.livroSolicitado ? oferta.livroSolicitado.titulo : '-';
                const livroOferecidoTitulo = (oferta.tipo === 'TROCA' && oferta.livroOfertado) ? oferta.livroOfertado.titulo : '';

                tr.innerHTML = `
                    <td>${solicitanteEmail}</td>
                    <td>${livroSolicitadoTitulo}</td>
                    <td>${livroOferecidoTitulo}</td>
                    <td style="display: flex; gap: 8px;">
                        <button class="btn-aceitar" data-id="${oferta.id}" style="color: green; cursor: pointer; background: none; border: none; font-weight: bold;">Aceitar</button>
                        <button class="btn-recusar" data-id="${oferta.id}" style="color: red; cursor: pointer; background: none; border: none; font-weight: bold;">Recusar</button>
                    </td>
                `;
                ofertasBody.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            ofertasBody.innerHTML = '<tr><td colspan="4">Erro ao carregar ofertas.</td></tr>';
        }
    }

    async function carregarMeusLivros() {
        if (!meusLivrosBody) return;
        meusLivrosBody.innerHTML = '<tr><td colspan="5">Carregando seus livros...</td></tr>';

        try {
            const response = await fetchWithAuth(`/api/livros/usuario/${usuarioId}`);
            if (!response.ok) {
                meusLivrosBody.innerHTML = '<tr><td colspan="5">Nenhum livro cadastrado.</td></tr>';
                return;
            }

            const livros = await response.json();
            meusLivrosBody.innerHTML = '';

            if (livros.length === 0) {
                meusLivrosBody.innerHTML = '<tr><td colspan="5">Nenhum livro cadastrado.</td></tr>';
                return;
            }

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero || '-'}</td>
                    <td>${livro.estoque}</td>
                    <td><button onclick="removerLivro('${livro.id}')" style="color: #db3939; cursor: pointer; background: #020D19; border: none; font-weight: bold;">Remover</button></td>
                `;
                meusLivrosBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            meusLivrosBody.innerHTML = '<tr><td colspan="5">Nenhum livro cadastrado.</td></tr>';
        }
    }

    window.removerLivro = async (id) => {
        if (!confirm('Deseja mesmo remover este livro?')) return;
        try {
            const response = await fetchWithAuth(`/api/livros/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Livro removido com sucesso!');
                carregarMeusLivros();
            } else {
                alert('Erro ao remover livro.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    async function atualizarContador() {
        if (!usuarioId || usuarioId === 'null' || !contadorCarrinhoSpan) return;
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (response.ok) {
                const carrinho = await response.json();
                const lista = carrinho.livros || [];
                contadorCarrinhoSpan.textContent = lista.length;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function carregarHistorico() {
        if (!historicoBody) return;
        historicoBody.innerHTML = '<tr><td colspan="5">Carregando histórico...</td></tr>';

        try {
            const response = await fetchWithAuth(`/api/transacoes/usuario/${usuarioId}`);
            const transacoes = await response.json();
            historicoBody.innerHTML = '';

            const transacoesFinalizadas = transacoes.filter(t =>
                t.status === 'CONCLUIDA' || t.status === 'CANCELADA'
            );

            if (transacoesFinalizadas.length === 0) {
                historicoBody.innerHTML = '<tr><td colspan="5">Nenhuma transação finalizada encontrada.</td></tr>';
                return;
            }

            transacoesFinalizadas.forEach(transacao => {
                const tr = document.createElement('tr');

                const tipoTexto = transacao.tipo === 'TROCA' ? 'Troca' : 'Doação';
                const livroSolicitadoTitulo = transacao.livroSolicitado ? transacao.livroSolicitado.titulo : '-';

                let livroOferecidoTexto = '-';
                if (transacao.tipo === 'DOACAO') {
                    livroOferecidoTexto = '<em>Nenhum (Doação)</em>';
                } else if (transacao.livroOfertado) {
                    livroOferecidoTexto = transacao.livroOfertado.titulo;
                }

                const donoOriginalEmail = transacao.destinatario ? transacao.destinatario.email : 'Desconhecido';
                const statusTexto = transacao.status === 'CONCLUIDA' ? '<span style="color: green; font-weight: bold;">Concluída</span>' : '<span style="color: red; font-weight: bold;">Cancelada</span>';

                tr.innerHTML = `
                    <td>${tipoTexto}</td>
                    <td>${livroSolicitadoTitulo}</td>
                    <td>${livroOferecidoTexto}</td>
                    <td>${donoOriginalEmail}</td>
                    <td>${statusTexto}</td>
                `;
                historicoBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            historicoBody.innerHTML = '<tr><td colspan="5">Erro ao carregar o histórico.</td></tr>';
        }
    }

    carregarOfertas();
    carregarMeusLivros();
    atualizarContador();
    carregarHistorico();

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
            window.location.href = 'login.html';
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-aceitar')) {
            const id = e.target.getAttribute('data-id');
            try {
                const res = await fetchWithAuth(`/api/transacoes/${id}/aceitar`, { method: 'PUT' });
                if (res.ok) {
                    alert('Proposta aceita!');
                    carregarOfertas();
                    carregarHistorico();
                }
            } catch (err) { alert('Erro ao processar aceite.'); }
        }

        if (e.target.classList.contains('btn-recusar')) {
            const id = e.target.getAttribute('data-id');
            try {
                const res = await fetchWithAuth(`/api/transacoes/${id}/recusar`, { method: 'PUT' });
                if (res.ok) {
                    alert('Proposta recusada.');
                    carregarOfertas();
                    carregarHistorico();
                }
            } catch (err) { alert('Erro ao processar recusa.'); }
        }
    });
});