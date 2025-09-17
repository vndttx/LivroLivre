document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const catalogoGrid = document.querySelector('.catalogo-grid');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    if (btnSair) {
        btnSair.addEventListener('click', (event) => {
            event.preventDefault();

            localStorage.removeItem('jwtToken');
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('usuarioLogado');

            alert("Você saiu com sucesso.");
            window.location.href = 'login.html';
        });
    }

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers: headers
        }).then(response => {
            if (response.status === 401) {
                alert('Sua sessão expirou. Faça login novamente.');
                window.location.href = 'login.html';
            }
            return response;
        });
    }

    function atualizarContadorCarrinho() {
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(response => response.json())
            .then(carrinho => {
                contadorCarrinhoSpan.textContent = carrinho.length;
            })
            .catch(error => {
                console.error('Erro ao atualizar contador:', error);
                contadorCarrinhoSpan.textContent = 0;
            });
    }

    async function carregarLivros() {
        try {
            const responseLivros = await fetchWithAuth('/api/livros');
            if (!responseLivros.ok) {
                throw new Error('Erro ao buscar os livros.');
            }
            const livros = await responseLivros.json();

            catalogoGrid.innerHTML = '';
            livros.forEach(livro => {
                const card = document.createElement('div');
                card.classList.add('card-livro');
                card.innerHTML = `
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Gênero:</strong> ${livro.genero || '-'}</p>
                    <p><strong>Estoque:</strong> ${livro.estoque || '-'}</p>
                    <button class="adicionar-carrinho" data-id="${livro.id}">Adicionar ao carrinho</button>
                `;
                catalogoGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            alert('Não foi possível carregar o catálogo de livros.');
        }
    }

    function adicionarLivroAoCarrinho(livroId) {
        fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao adicionar livro ao carrinho.');
            }
            return response.json();
        })
        .then(() => {
            alert('Livro adicionado ao carrinho!');
            atualizarContadorCarrinho();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Não foi possível adicionar o livro ao carrinho.');
        });
    }

    catalogoGrid.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-carrinho')) {
            const livroId = event.target.dataset.id;
            adicionarLivroAoCarrinho(livroId);
        }
    });

    atualizarContadorCarrinho();
    carregarLivros();
});