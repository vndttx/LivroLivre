document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-tabela tbody');
    const usuarioId = 1; // Substitua pelo ID do usuário logado

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetchWithAuth(url, {
            ...options,
            headers: headers
        });
    }

    function atualizarContadorCarrinho() {
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar o carrinho.');
                }
                return response.json();
            })
            .then(carrinho => {
                let totalItens = 0;
                carrinho.forEach(item => {
                    totalItens += item.quantidade;
                });
                contadorCarrinhoSpan.textContent = totalItens;
            })
            .catch(error => {
                console.error('Erro:', error);
                contadorCarrinhoSpan.textContent = 0;
            });
    }

    async function carregarLivros() {
        try {
            // Primeiro, busca os itens do carrinho
            const responseCarrinho = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (!responseCarrinho.ok) {
                throw new Error('Erro ao buscar o carrinho para filtrar livros.');
            }
            const carrinho = await responseCarrinho.json();
            const livrosNoCarrinhoIds = new Set(carrinho.map(item => item.livro.id));

            // Segundo, busca todos os livros
            const responseLivros = await fetchWithAuth('/api/livros');
            if (!responseLivros.ok) {
                throw new Error('Erro ao buscar os livros.');
            }
            const livros = await responseLivros.json();

            tbody.innerHTML = '';
            livros.forEach(livro => {
                // Filtra e exibe apenas os livros que não estão no carrinho
                if (!livrosNoCarrinhoIds.has(livro.id)) {
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
            console.error('Erro:', error);
            alert('Não foi possível carregar o catálogo de livros.');
        }
    }

    function adicionarLivroAoCarrinho(livroId) {
        fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(livroAtualizado => {
            alert(`"${livroAtualizado.titulo}" adicionado ao carrinho!`);
            carregarLivros(); // Recarrega a tabela para esconder o livro adicionado
            atualizarContadorCarrinho();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Falha ao adicionar o livro. ' + error.message);
        });
    }

    tbody.addEventListener('click', (event) => {
        if (event.target.classList.contains('adicionar-carrinho')) {
            event.preventDefault();
            const livroId = event.target.getAttribute('data-id');
            adicionarLivroAoCarrinho(livroId);
        }
    });

    // Chamadas iniciais
    carregarLivros();
    atualizarContadorCarrinho();
});