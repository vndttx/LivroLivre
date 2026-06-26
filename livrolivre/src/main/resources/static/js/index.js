document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-recentes-tabela tbody');
    const emailUsuario = localStorage.getItem('emailUsuario') || localStorage.getItem('usuarioEmail');

    if (emailUsuario) {
        const menuPrincipal = document.querySelector('.menu-principal');
        if (menuPrincipal) {
            const spanUser = document.createElement('span');
            spanUser.style.float = 'right';
            spanUser.style.color = '#fff';
            spanUser.style.padding = '10px';
            spanUser.style.fontWeight = 'bold';
            spanUser.textContent = emailUsuario;
            menuPrincipal.appendChild(spanUser);
        }
    }

    async function fetchWithAuth(url, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { ...options, headers });

        if ((response.status === 401 || response.status === 403) && usuarioId) {
            localStorage.clear();
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject('Sessao expirada');
        }
        return response;
    }

    async function carregarLivrosRecentes() {
        if (!tbody) return;
        try {
            const response = await fetch('/api/livros');
            const livros = await response.json();
            tbody.innerHTML = '';

            const livrosExibicao = livros.filter(l => !usuarioId || (l.proprietario && l.proprietario.id != usuarioId));

            livrosExibicao.slice(0, 5).forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero || '-'}</td>
                    <td>${livro.status}</td>
                    <td><a href="#" class="adicionar-carrinho" data-id="${livro.id}">Adicionar</a></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) { console.error(error); }
    }

    async function atualizarContador() {
        if (!usuarioId || usuarioId === 'null' || !contadorCarrinhoSpan) return;
        const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
        if (response.ok) {
            const carrinho = await response.json();
            const lista = carrinho.livros || [];
            contadorCarrinhoSpan.textContent = lista.length;
        }
    }

    if (tbody) {
        tbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('adicionar-carrinho')) {
                e.preventDefault();
                if (!usuarioId) { window.location.href = 'login.html'; return; }

                const libroId = e.target.getAttribute('data-id');
                const res = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${libroId}`, { method: 'POST' });
                if (res.ok) {
                    alert('Adicionado ao carrinho!');
                    atualizarContador();
                }
            }
        });
    }

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        };
    }

    carregarLivrosRecentes();
    atualizarContador();
});