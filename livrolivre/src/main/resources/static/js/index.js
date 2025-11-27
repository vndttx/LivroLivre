document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const btnSair = document.getElementById("btn-sair");
    const tbody = document.querySelector('#livros-recentes-tabela tbody');

    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
            window.location.href = 'login.html';
        });
    }

    if (!usuarioId) {
        window.location.href = 'login.html';
    }

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
    }

    function atualizarContadorCarrinho() {
        if (!usuarioId || !contadorCarrinhoSpan) return;

        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(res => res.ok ? res.json() : [])
            .then(lista => contadorCarrinhoSpan.textContent = lista.length)
            .catch(() => contadorCarrinhoSpan.textContent = 0);
    }

    async function carregarLivrosRecentes() {
        if (!tbody) return;

        try {
            const response = await fetch('/api/livros');
            if (!response.ok) throw new Error('Erro ao buscar livros');

            const livros = await response.json();
            tbody.innerHTML = '';

            const livrosFiltrados = livros.filter(l => {
                if (!usuarioId) return true;
                return l.proprietario && l.proprietario.id != usuarioId;
            });

            if (livrosFiltrados.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Nenhum livro recente disponivel.</td></tr>';
                return;
            }

            livrosFiltrados.slice(0, 5).forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero || '-'}</td>
                    <td>${livro.status}</td>
                    <td>
                         <a href="#" class="adicionar-carrinho" data-id="${livro.id}">Adicionar</a>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    }

    function adicionarAoCarrinho(livroId) {
        if (!usuarioId) {
            window.location.href = 'login.html';
            return;
        }
        fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, { method: 'POST' })
            .then(res => {
                if(res.ok) {
                    alert("Adicionado ao carrinho!");
                    atualizarContadorCarrinho();
                    carregarLivrosRecentes();
                } else {
                    alert("Erro ao adicionar.");
                }
            });
    }

    if (tbody) {
        tbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('adicionar-carrinho')) {
                e.preventDefault();
                adicionarAoCarrinho(e.target.getAttribute('data-id'));
            }
        });
        carregarLivrosRecentes();
    }

    atualizarContadorCarrinho();
});