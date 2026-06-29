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

    function atualizarBotaoPainel(quantidadeOfertas) {
        const linkPainel = document.getElementById('link-painel');
        if (linkPainel) {
            if (quantidadeOfertas > 0) {
                linkPainel.innerHTML = `Meu Painel (<span id="contador-painel">${quantidadeOfertas}</span>)`;
            } else {
                linkPainel.innerHTML = 'Meu Painel';
            }
        }
    }

    async function carregarOfertas() {
        if (!ofertasBody) return;
        ofertasBody.innerHTML = '<tr><td colspan="4">Carregando ofertas...</td></tr>';

        try {
            const response = await fetchWithAuth(`/api/transacoes/usuario/${usuarioId}`);
            const ofertas = await response.json();
            ofertasBody.innerHTML = '';

            const ofertasPendentes = ofertas.filter(o => o.status === 'PENDENTE');
            atualizarBotaoPainel(ofertasPendentes.length);

            if (ofertasPendentes.length === 0) {
                ofertasBody.innerHTML = '<tr><td colspan="4">Nenhuma oferta recebida.</td></tr>';
                return;
            }

            ofertasPendentes.forEach(oferta => {
                const tr = document.createElement('tr');

                const solicitanteNome = oferta.solicitante ? (oferta.solicitante.nome || oferta.solicitante.nomeUsuario || 'Anônimo') : 'Anônimo';
                const livroSolicitadoTitulo = oferta.livroSolicitado ? oferta.livroSolicitado.titulo : '-';

                let livroOferecidoTexto = '-';
                if (oferta.tipo === 'DOACAO') {
                    livroOferecidoTexto = '<em>Nenhum (Doação)</em>';
                } else if (oferta.livroOfertado) {
                    livroOferecidoTexto = oferta.livroOfertado.titulo;
                }

                tr.innerHTML = `
                    <td>${solicitanteNome}</td>
                    <td>${livroSolicitadoTitulo}</td>
                    <td>${livroOferecidoTexto}</td>
                    <td>
                        <button class="btn-cadastro" data-id="${oferta.id}">Aceitar</button>
                        <button class="btn-sair" data-id="${oferta.id}">Recusar</button>
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
                    <td><button onclick="removerLivro('${livro.id}')" class="btn-sair">Remover</button></td>
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
            const response = await fetchWithAuth(`/api/transacoes/usuario/${usuarioId}/historico`);
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
                const livreSolicitadoTitulo = transacao.livroSolicitado ? transacao.livroSolicitado.titulo : '-';

                let livroOferecidoTexto = '-';
                if (transacao.tipo === 'DOACAO') {
                    livroOferecidoTexto = '<em>Nenhum (Doação)</em>';
                } else if (transacao.livroOfertado) {
                    livroOferecidoTexto = transacao.livroOfertado.titulo;
                }

                const donoOriginalNome = transacao.destinatario ? (transacao.destinatario.nome || transacao.destinatario.nomeUsuario || 'Desconhecido') : 'Desconhecido';
                const statusTexto = transacao.status === 'CONCLUIDA' ? '<span style="color: green; font-weight: bold;">Concluída</span>' : '<span style="color: red; font-weight: bold;">Cancelada</span>';

                tr.innerHTML = `
                    <td>${tipoTexto}</td>
                    <td>${livreSolicitadoTitulo}</td>
                    <td>${livroOferecidoTexto}</td>
                    <td>${donoOriginalNome}</td>
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
            alert("Você saiu com sucesso.");
            window.location.href = 'login.html';
        });
    }

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-cadastro')) {
            const id = e.target.getAttribute('data-id');
            if (!id) return;
            try {
                const res = await fetchWithAuth(`/api/transacoes/${id}/aceitar`, { method: 'PUT' });
                if (res.ok) {
                    alert('Proposta aceita!');
                    carregarOfertas();
                    carregarHistorico();
                }
            } catch (err) { alert('Erro ao processar aceite.'); }
        }

        if (e.target.classList.contains('btn-sair') && e.target.hasAttribute('data-id')) {
            const id = e.target.getAttribute('data-id');
            if (!id) return;
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