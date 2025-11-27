document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');

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
            alert('Sua sessao expirou. Faca login novamente.');
            window.location.href = 'login.html';
            return Promise.reject(new Error('Sessão expirada'));
        }

        return response;
    }

    async function atualizarContadorCarrinho() {
        if (!usuarioId) {
            if (contadorCarrinhoSpan) contadorCarrinhoSpan.textContent = 0;
            return;
        }
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (response.ok) {
                const carrinho = await response.json();
                if (contadorCarrinhoSpan) contadorCarrinhoSpan.textContent = carrinho.length;
            }
        } catch (error) {
            if (contadorCarrinhoSpan) contadorCarrinhoSpan.textContent = 0;
        }
    }

    async function carregarLivros() {
        tbody.innerHTML = '<tr><td colspan="5">Carregando livros...</td></tr>';
        try {
            const responseLivros = await fetch('/api/livros');
            if (!responseLivros.ok) throw new Error('Erro ao buscar os livros.');
            let livros = await responseLivros.json();

            let livrosNoCarrinhoIds = new Set();
            if (usuarioId && localStorage.getItem('jwtToken')) {
                try {
                    const responseCarrinho = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
                    if (responseCarrinho.ok) {
                        const carrinho = await responseCarrinho.json();
                        livrosNoCarrinhoIds = new Set(carrinho.map(item => item.livro.id));
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            tbody.innerHTML = '';

            const livrosFiltrados = livros.filter(livro =>
                !livrosNoCarrinhoIds.has(livro.id) &&
                (!livro.proprietario || livro.proprietario.id != usuarioId)
            );

            if (livrosFiltrados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Nenhum livro disponível no momento.</td></tr>';
                return;
            }

            livrosFiltrados.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero || '-'}</td>
                    <td>${livro.estoque || '-'}</td>
                    <td>
                        <a href="#" class="adicionar-carrinho" data-id="${livro.id}">Adicionar ao carrinho</a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5">Nao foi possivel carregar o catalogo de livros.</td></tr>';
        }
    }

    async function adicionarLivroAoCarrinho(livroId) {
        if (!usuarioId || !localStorage.getItem('jwtToken')) {
            alert('Você precisa estar logado para adicionar livros ao carrinho.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Livro adicionado ao carrinho!');
                atualizarContadorCarrinho();
                carregarLivros();
            } else {
                throw new Error('Erro ao adicionar livro ao carrinho.');
            }
        } catch (error) {
            alert('Nao foi possivel adicionar o livro ao carrinho.');
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

    tbody.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-carrinho')) {
            event.preventDefault();
            const livroId = event.target.getAttribute('data-id');
            adicionarLivroAoCarrinho(livroId);
        }
    });

    atualizarContadorCarrinho();
    carregarLivros();
});