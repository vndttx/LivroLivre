document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-recentes-tabela tbody');

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

    if (tbody) {
        tbody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('adicionar-carrinho')) {
                e.preventDefault();
                if (!usuarioId) { window.location.href = 'login.html'; return; }

                const livroId = e.target.getAttribute('data-id');
                const res = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, { method: 'POST' });
                if (res.ok) alert('Adicionado ao carrinho!');
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
});