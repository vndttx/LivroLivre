document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const btnSair = document.getElementById("btn-sair");
    const tbody = document.querySelector('#livros-recentes-tabela tbody');

    if (btnSair) {
        btnSair.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
            window.location.href = 'login.html';
        });
    }

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

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
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject(new Error('Sessao expirada'));
        }
        return response;
    }

    async function atualizarContadorCarrinho() {
        if (!usuarioId || !contadorCarrinhoSpan) return;

        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (response.ok) {
                const lista = await response.json();
                contadorCarrinhoSpan.textContent = lista.length;
            }
        } catch (error) {
            contadorCarrinhoSpan.textContent = 0;
        }
    }

    async function carregarLivrosRecentes() {
        if (!tbody) return;

        try {
            const response = await fetch('/api/livros');
            if (!response.ok) throw new Error('Erro ao buscar livros');

            const livros = await response.json();
            tbody.innerHTML = '';

            const livrosFiltrados = livros.filter(l => {
                const naoEhMeu = !l.proprietario || l.proprietario.id != usuarioId;
                const estaDisponivel = l.status === 'DISPONIVEL';
                return naoEhMeu && estaDisponivel;
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
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar livros.</td></tr>';
        }
    }

    async function adicionarAoCarrinho(livroId) {
        if (!usuarioId) {
            window.location.href = 'login.html';
            return;
        }
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, { method: 'POST' });

            if(response.ok) {
                alert("Adicionado ao carrinho!");
                atualizarContadorCarrinho();
                carregarLivrosRecentes();
            } else {
                throw new Error("Erro ao adicionar.");
            }
        } catch (error) {
            alert("Nao foi possivel adicionar ao carrinho.");
        }
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