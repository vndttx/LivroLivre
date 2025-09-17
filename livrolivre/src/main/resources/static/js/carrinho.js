document.addEventListener('DOMContentLoaded', () => {
    const carrinhoTabelaBody = document.querySelector('#carrinho-tabela tbody');
    const usuarioId = 1;

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
        });
    }

    function carregarCarrinho() {
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar o carrinho.');
                }
                return response.json();
            })
            .then(carrinho => {
                carrinhoTabelaBody.innerHTML = '';
                if (carrinho.length === 0) {
                    carrinhoTabelaBody.innerHTML = '<tr><td colspan="3">Seu carrinho está vazio.</td></tr>';
                    return;
                }

                carrinho.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${item.livro.titulo}</td>
                        <td>${item.quantidade}</td>
                        <td>
                            <a href="#" class="remover-carrinho" data-livro-id="${item.livro.id}">Remover</a>
                        </td>
                    `;
                    carrinhoTabelaBody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Não foi possível carregar o carrinho de compras.');
            });
    }

    carrinhoTabelaBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-carrinho')) {
            event.preventDefault();
            const livroId = event.target.getAttribute('data-livro-id');
            alert(`Livro com ID ${livroId} seria removido.`);
        }
    });

    carregarCarrinho();
});