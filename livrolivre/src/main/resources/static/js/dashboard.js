document.addEventListener('DOMContentLoaded', () => {
    // PADRONIZAÇÃO: Usar apenas 'token' e 'usuarioId'
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const ofertasBody = document.querySelector('#ofertas-tabela tbody');
    const meusLivrosBody = document.querySelector('#tabela-meus-livros tbody');
    const historicoBody = document.querySelector('#historico-tabela tbody');
    const btnSair = document.getElementById('btn-sair');
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
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject('Sessão expirada');
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
                    <td><button onclick="removerLivro(${livro.id})" style="color: red;">Remover</button></td>
                `;
                meusLivrosBody.appendChild(tr);
            });
        } catch (error) {
            meusLivrosBody.innerHTML = '<td>Erro ao carregar livros.</td>';
        }
    }

    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    atualizarContador();
    carregarOfertas();
    carregarMeusLivros();
    carregarHistorico();
});