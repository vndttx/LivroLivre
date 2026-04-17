document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');

    async function fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            if (url.includes('/api/carrinho')) {
                localStorage.clear();
                window.location.href = 'login.html';
            }
        }
        return response;
    }

    async function carregarLivros() {
        try {
            const response = await fetch('/api/livros');
            const livros = await response.json();
            tbody.innerHTML = '';

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero}</td>
                    <td>${livro.estoque}</td>
                    <td>
                        <button onclick="adicionarAoCarrinho(${livro.id})" class="btn-adicionar">Adicionar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
        }
    }

    window.adicionarAoCarrinho = async (livroId) => {
        if (!usuarioId) {
            alert('Faca login para adicionar ao carrinho.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}/adicionar/${livroId}`, {
                method: 'POST'
            });
            if (response.ok) {
                alert('Livro adicionado!');
                atualizarContador();
            }
        } catch (error) {
            alert('Erro ao adicionar livro.');
        }
    };

    async function atualizarContador() {
        if (!usuarioId || !contadorCarrinhoSpan) return;
        const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
        if (response.ok) {
            const lista = await response.json();
            contadorCarrinhoSpan.textContent = lista.length;
        }
    }

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        };
    }

    carregarLivros();
    atualizarContador();
});