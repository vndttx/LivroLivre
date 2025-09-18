document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#livros-recentes-tabela tbody');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const usuarioId = localStorage.getItem('usuarioId');


    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
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

        return fetch(url, { ...options, headers });
    }

    function atualizarContadorCarrinho() {
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(response => response.ok ? response.json() : Promise.reject('Erro'))
            .then(carrinho => {
                contadorCarrinhoSpan.textContent = carrinho.length;
            })
            .catch(() => {
                contadorCarrinhoSpan.textContent = 0;
            });
    }

    async function carregarLivrosRecentes() {
        try {
            const response = await fetchWithAuth('/api/livros');
            if (!response.ok) {
                throw new Error('Erro ao buscar os livros.');
            }
            const livros = await response.json();
            tbody.innerHTML = '';

            if (livros.length === 0) {
                 tbody.innerHTML = '<tr><td colspan="5">Nenhum livro encontrado.</td></tr>';
                 return;
            }

            livros.forEach(livro => {
                if (livro.proprietario && livro.proprietario.id != usuarioId) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td>${livro.genero || '-'}</td>
                        <td>${livro.status || 'Disponivel'}</td>
                        <td>
                            <a href="#" class="adicionar-carrinho" data-id="${livro.id}">Adicionar ao carrinho</a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                }
            });
        } catch (error) {
            console.error('Erro:', error);
            tbody.innerHTML = '<tr><td colspan="5">Nao foi possivel carregar os livros.</td></tr>';
        }
    }

    function adicionarLivroAoCarrinho(livroId) {
        fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) throw new Error('Falha ao adicionar.');
            return response.json();
        })
        .then(data => {
            alert(`"${data.titulo}" foi adicionado ao carrinho!`);
            carregarLivrosRecentes();
            atualizarContadorCarrinho();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Nao foi possivel adicionar o livro.');
        });
    }

    tbody.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-carrinho')) {
            event.preventDefault();
            const livroId = event.target.getAttribute('data-id');
            adicionarLivroAoCarrinho(livroId);
        }
    });

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('usuarioId');
            window.location.href = 'login.html';
        });
    }

    carregarLivrosRecentes();
    atualizarContadorCarrinho();
});