document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const ofertasBody = document.querySelector('#ofertas-tabela tbody');
    const meusLivrosBody = document.querySelector('#tabela-meus-livros tbody');
    const historicoBody = document.querySelector('#historico-tabela tbody');
    const tituloPainel = document.getElementById('titulo-painel');

    if (!token || !usuarioId) {
        window.location.href = 'login.html';
        return;
    }

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

    window.removerLivro = async (id) => {
        if (!confirm('Deseja remover este livro?')) return;
        try {
            const res = await fetchWithAuth(`/api/livros/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Livro removido!');
                carregarMeusLivros();
            }
        } catch (err) { alert('Erro ao remover.'); }
    };

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
            const ofertas = await response.json();
            ofertasBody.innerHTML = '';

            if (ofertas.length === 0) {
                ofertasBody.innerHTML = '<tr><td colspan="4">Nenhuma oferta recebida.</td></tr>';
                return;
            }

            ofertas.forEach(oferta => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${oferta.solicitante ? oferta.solicitante.email : 'Anônimo'}</td>
                    <td>${oferta.livroOfertado ? oferta.livroOfertado.titulo : '-'}</td>
                    <td>${oferta.livroSolicitado ? oferta.livroSolicitado.titulo : '-'}</td>
                    <td>
                        <button class="btn-aceitar" data-id="${oferta.id}" style="color: green; cursor: pointer;">Aceitar</button>
                        <button class="btn-recusar" data-id="${oferta.id}" style="color: red; cursor: pointer;">Recusar</button>
                    </td>
                `;
                ofertasBody.appendChild(tr);
            });

            configurarBotoesTroca();
        } catch (error) {
            ofertasBody.innerHTML = '<tr><td colspan="4">Erro ao carregar ofertas.</td></tr>';
        }
    }

    async function carregarMeusLivros() {
        if (!meusLivrosBody) return;
        try {
            const response = await fetchWithAuth('/api/livros/meus-livros');
            const livros = await response.json();
            meusLivrosBody.innerHTML = '';
            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.status}</td>
                    <td><button onclick="removerLivro(${livro.id})" style="color: red; cursor: pointer;">Remover</button></td>
                `;
                meusLivrosBody.appendChild(tr);
            });
        } catch (err) {
            meusLivrosBody.innerHTML = '<tr><td colspan="4">Erro ao carregar livros.</td></tr>';
        }
    }

    async function carregarHistorico() {
        const historicoBody = document.querySelector('#historico-tabela tbody');
        if (!historicoBody) return;
        historicoBody.innerHTML = '<tr><td colspan="5">Funcionalidade de historico em breve.</td></tr>';
    }

    atualizarContador();
    carregarOfertas();
    carregarMeusLivros();
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
});