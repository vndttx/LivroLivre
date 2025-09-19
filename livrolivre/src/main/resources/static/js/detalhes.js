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

    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
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
                <p><strong>Dono:</strong> ${livro.proprietario.nomeUsuario}</p>
                <p><strong>Genero:</strong> ${livro.genero || 'Nao informado'}</p>
                <p><strong>Status:</strong> ${livro.status}</p>
                <hr>
                <h4>Sinopse</h4>
                <p>${livro.sinopse || 'Nenhuma sinopse disponivel.'}</p>
                <hr>
                <div id="acoes-container"></div>
            `;

            renderizarAcoes(livro);

        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            detalhesContainer.innerHTML = `<p>${error.message}</p>`;
        }
    }

    function renderizarAcoes(livro) {
        const acoesContainer = document.getElementById('acoes-container');
        if (livro.proprietario.id != usuarioId && livro.status === 'DISPONIVEL') {
            acoesContainer.innerHTML = `
                <button class="btn" id="btn-add-carrinho" data-id="${livro.id}">Adicionar ao Carrinho</button>
            `;
        } else if (livro.proprietario.id == usuarioId) {
             acoesContainer.innerHTML = `<p>Este livro pertence a voce.</p>`;
        } else {
             acoesContainer.innerHTML = `<p>Este livro nao esta disponivel no momento.</p>`;
        }
    }

    carregarDetalhes();
});