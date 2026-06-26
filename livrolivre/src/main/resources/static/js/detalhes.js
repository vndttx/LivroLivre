document.addEventListener('DOMContentLoaded', () => {
    const detalhesContainer = document.getElementById('detalhes-livro-container');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const livroId = urlParams.get('id');

    if (!livroId) {
        detalhesContainer.innerHTML = '<p>Livro nao encontrado. Volte para o catalogo.</p>';
        return;
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject(new Error('Sessao expirada'));
        }
        return response;
    }

    async function adicionarAoCarrinho(id) {
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${id}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Livro adicionado ao carrinho!');
            } else {
                throw new Error('Erro ao adicionar.');
            }
        } catch (error) {
            alert('Nao foi possivel adicionar ao carrinho.');
        }
    }

    function renderizarAcoes(livro) {
        const acoesContainer = document.getElementById('acoes-container');
        if (livro.proprietario.id != usuarioId && livro.status === 'DISPONIVEL') {
            acoesContainer.innerHTML = `
                <button class="btn" id="btn-add-carrinho">Adicionar ao Carrinho</button>
            `;
            const btnAdd = document.getElementById('btn-add-carrinho');
            if (btnAdd) {
                btnAdd.addEventListener('click', () => adicionarAoCarrinho(livro.id));
            }
        } else if (livro.proprietario.id == usuarioId) {
             acoesContainer.innerHTML = `<p>Este livro pertence a voce.</p>`;
        } else {
             acoesContainer.innerHTML = `<p>Este livro nao esta disponivel no momento.</p>`;
        }
    }

    async function carregarDetalhes() {
        try {
            const response = await fetchWithAuth(`/api/livros/${livroId}`);
            if (!response.ok) {
                throw new Error('Livro nao encontrado.');
            }
            const livro = await response.json();

            detalhesContainer.innerHTML = `
                <h1>${livro.titulo}</h1>
                <h3>por ${livro.autor}</h3>
                <p><strong>Dono:</strong> ${livro.proprietario.emailUsuario}</p>
                <p><strong>Genero:</strong> ${livro.genero || 'Nao informado'}</p>
                <p><strong>Status:</strong> ${livro.status}</p>
                <hr>
                <hr>
                <div id="acoes-container"></div>
            `;

            renderizarAcoes(livro);

        } catch (error) {
            detalhesContainer.innerHTML = `<p>${error.message}</p>`;
        }
    }

    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            alert('Voce saiu com sucesso.');
            window.location.href = 'login.html';
            return;
        });
    }

    carregarDetalhes();
});