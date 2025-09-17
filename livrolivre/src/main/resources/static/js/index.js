document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#livros-recentes-tabela tbody');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const btnSair = document.getElementById('btn-sair');
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
        return fetch(url, { ...options, headers: headers });
    }

    function carregarLivrosRecentes() {
        fetchWithAuth('/api/livros')
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar os livros.');
                return response.json();
            })
            .then(livros => {
                tbody.innerHTML = '';
                const livrosRecentes = livros.slice(-5).reverse(); // Pega os últimos 5 livros

                if (livrosRecentes.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">Nenhum livro cadastrado.</td></tr>';
                    return;
                }

                livrosRecentes.forEach(livro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td>${livro.genero || '-'}</td>
                        <td>${livro.estoque > 0 ? 'Disponível' : 'Indisponível'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error("Erro:", error);
                tbody.innerHTML = '<tr><td colspan="4">Não foi possível carregar os livros.</td></tr>';
            });
    }

    function atualizarContadorCarrinho() {
        if (!contadorCarrinhoSpan) return;
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(response => response.ok ? response.json() : [])
            .then(carrinho => {
                contadorCarrinhoSpan.textContent = carrinho.length;
            })
            .catch(error => {
                console.error('Erro ao buscar carrinho:', error);
                contadorCarrinhoSpan.textContent = 0;
            });
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

    // Chamadas iniciais ao carregar a página
    carregarLivrosRecentes();
    atualizarContadorCarrinho();
});