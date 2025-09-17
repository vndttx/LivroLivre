document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#carrinho-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');

     if (!usuarioId) {
            alert("Você não esta logado!");
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
            .then(itens => {
                tbody.innerHTML = '';
                if (itens.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">Seu carrinho esta vazio.</td></tr>';
                    return;
                }

                itens.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${item.livro.titulo}</td>
                        <td>${item.livro.autor}</td>
                        <td>1</td>
                        <td>
                            <a href="#" class="remover-item" data-livro-id="${item.livro.id}">Remover</a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(error => {
                console.error('Erro:', error);
                tbody.innerHTML = '<tr><td colspan="4">Nao foi possivel carregar o carrinho.</td></tr>';
            });
    }

    function removerItemDoCarrinho(livroId) {
        if (!confirm('Tem certeza que deseja remover este livro do carrinho?')) {
            return;
        }

        fetchWithAuth(`/api/carrinho/${usuarioId}/remover/${livroId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert('Livro removido com sucesso!');
                carregarCarrinho();
            } else {
                throw new Error('Falha ao remover o livro do carrinho.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert(error.message);
        });
    }

    tbody.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-item')) {
            event.preventDefault();
            const livroId = event.target.getAttribute('data-livro-id');
            removerItemDoCarrinho(livroId);
        }
    });

    carregarCarrinho();
});