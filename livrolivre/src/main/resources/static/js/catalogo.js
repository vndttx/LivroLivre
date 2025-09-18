document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    if (btnSair) {
        btnSair.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
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
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                alert('Sua sessao expirou. Faca login novamente.');
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
            const responseCarrinho = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (!responseCarrinho.ok) throw new Error('Erro ao buscar o carrinho.');
            const carrinho = await responseCarrinho.json();
            const livrosNoCarrinhoIds = new Set(carrinho.map(item => item.livro.id));

            const responseLivros = await fetchWithAuth('/api/livros');
            if (!responseLivros.ok) throw new Error('Erro ao buscar os livros.');
            const livros = await responseLivros.json();

            tbody.innerHTML = '';

            livros.forEach(livro => {
                if (!livrosNoCarrinhoIds.has(livro.id) && (livro.proprietario && livro.proprietario.id != usuarioId)) {
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
                }
            });
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            tbody.innerHTML = '<tr><td colspan="5">Nao foi possivel carregar o catalogo de livros.</td></tr>';
        }
    }

    function adicionarLivroAoCarrinho(livroId) {
        fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao adicionar livro ao carrinho.');
            return response.json();
        })
        .then(() => {
            alert('Livro adicionado ao carrinho!');
            atualizarContadorCarrinho();
            carregarLivros();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Nao foi possivel adicionar o livro ao carrinho.');
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