document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const ofertasBody = document.querySelector('#ofertas-tabela tbody');
    const meusLivrosBody = document.querySelector('#tabela-meus-livros tbody');
    const historicoBody = document.querySelector('#historico-tabela tbody');
    const btnSair = document.getElementById('btn-sair');
    const tituloPainel = document.getElementById('titulo-painel');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    if (tituloPainel) {
        tituloPainel.textContent = `Meu Painel`;
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject(new Error('Sessão expirada'));
        }

        return response;
    }

    async function atualizarContador() {
        if (!contadorCarrinhoSpan) return;
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (response.ok) {
                const lista = await response.json();
                contadorCarrinhoSpan.textContent = lista.length || 0;
            }
        } catch (error) {
            contadorCarrinhoSpan.textContent = 0;
        }
    }

    async function carregarOfertas() {
        if (!ofertasBody) return;
        ofertasBody.innerHTML = '<tr><td colspan="4">Carregando ofertas...</td></tr>';

        try {
            const response = await fetchWithAuth('/api/transacoes/ofertas-recebidas');
            if (!response.ok) throw new Error('Erro ao buscar ofertas.');

            const ofertas = await response.json();
            ofertasBody.innerHTML = '';

            if (ofertas.length === 0) {
                ofertasBody.innerHTML = '<tr><td colspan="4">Nenhuma oferta recebida.</td></tr>';
                return;
            }

            ofertas.forEach(oferta => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${oferta.solicitante ? oferta.solicitante.nomeUsuario : 'Usuario desconhecido'}</td>
                    <td>${oferta.livroOfertado ? oferta.livroOfertado.titulo : '-'}</td>
                    <td>${oferta.livroSolicitado ? oferta.livroSolicitado.titulo : '-'}</td>
                    <td>
                        <button class="btn-aceitar" data-id="${oferta.id}" style="color: green; cursor: pointer; margin-right: 10px;">Aceitar</button>
                        <button class="btn-recusar" data-id="${oferta.id}" style="color: red; cursor: pointer;">Recusar</button>
                    </td>
                `;
                ofertasBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-aceitar').forEach(btn => {
                btn.addEventListener('click', (e) => processarTroca(e.target.dataset.id, 'aceitar'));
            });
            document.querySelectorAll('.btn-recusar').forEach(btn => {
                btn.addEventListener('click', (e) => processarTroca(e.target.dataset.id, 'recusar'));
            });

        } catch (error) {
            ofertasBody.innerHTML = '<tr><td colspan="4">Erro ao carregar ofertas.</td></tr>';
        }
    }

    async function processarTroca(id, acao) {
        if (!confirm(`Deseja realmente ${acao} esta troca?`)) return;

        try {
            const response = await fetchWithAuth(`/api/transacoes/${id}/${acao}`, { method: 'POST' });
            if (response.ok) {
                alert(`Troca ${acao === 'aceitar' ? 'aceita' : 'recusada'} com sucesso!`);
                carregarOfertas();
                carregarHistorico();
            } else {
                const erro = await response.text();
                alert(`Erro ao ${acao}: ${erro}`);
            }
        } catch (error) {
            alert(`Erro de conexão ao ${acao} troca.`);
        }
    }

    async function carregarMeusLivros() {
        if (!meusLivrosBody) return;
        meusLivrosBody.innerHTML = '<tr><td colspan="4">Carregando livros...</td></tr>';

        try {
            const response = await fetchWithAuth('/api/livros/meus-livros');
            if (!response.ok) throw new Error('Erro ao buscar livros.');

            const livros = await response.json();
            meusLivrosBody.innerHTML = '';

            if (livros.length === 0) {
                meusLivrosBody.innerHTML = '<tr><td colspan="4">Voce nao cadastrou nenhum livro.</td></tr>';
                return;
            }

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.status}</td>
                    <td>
                        <button class="btn-remover-livro" data-id="${livro.id}" style="color: red; cursor: pointer;">Remover</button>
                    </td>
                `;
                meusLivrosBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-remover-livro').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('Tem certeza que deseja remover este livro?')) {
                        await removerLivro(e.target.dataset.id);
                    }
                });
            });

        } catch (error) {
            meusLivrosBody.innerHTML = '<tr><td colspan="4">Erro ao carregar livros.</td></tr>';
        }
    }

    async function removerLivro(id) {
        try {
            const response = await fetchWithAuth(`/api/livros/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Livro removido com sucesso!');
                carregarMeusLivros();
            } else {
                alert('Erro ao remover livro.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    }

    async function carregarHistorico() {
        if (!historicoBody) return;
        historicoBody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';

        try {
            const response = await fetchWithAuth(`/api/transacoes/historico`);
            if (!response.ok) throw new Error("Erro ao buscar historico");

            const transacoes = await response.json();
            historicoBody.innerHTML = '';

            if (transacoes.length === 0) {
                historicoBody.innerHTML = '<tr><td colspan="5">Nenhuma transacao encontrada.</td></tr>';
                return;
            }

            transacoes.forEach(t => {
                const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');

                let descricaoLivros = '';
                if (t.tipo === 'TROCA') {
                    const solicitado = t.livroSolicitado ? t.livroSolicitado.titulo : '?';
                    const ofertado = t.livroOfertado ? t.livroOfertado.titulo : '?';
                    descricaoLivros = `Troca: ${ofertado} por ${solicitado}`;
                } else {
                    descricaoLivros = t.livroSolicitado ? t.livroSolicitado.titulo : 'Livro desconhecido';
                }

                const donoOriginal = t.proprietario ? t.proprietario.nomeUsuario : '-';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${t.tipo}</td>
                    <td>${descricaoLivros}</td>
                    <td>${donoOriginal}</td>
                    <td>${t.status}</td>
                `;
                historicoBody.appendChild(tr);
            });

        } catch (error) {
            historicoBody.innerHTML = '<tr><td colspan="5">Erro ao carregar historico.</td></tr>';
        }
    }

    if (btnSair) {
        btnSair.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
            window.location.href = 'login.html';
            return;
        });
    }

    atualizarContador();
    carregarOfertas();
    carregarMeusLivros();
    carregarHistorico();
});