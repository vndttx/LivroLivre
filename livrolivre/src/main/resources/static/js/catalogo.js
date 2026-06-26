document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const tbody = document.querySelector('#livros-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const token = localStorage.getItem('token');
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

            const livrosExibicao = livros.filter(l => !usuarioId || (l.proprietario && l.proprietario.id !== usuarioId));

            if (livrosExibicao.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Nenhum livro disponível encontrado.</td></tr>';
                return;
            }

            livrosExibicao.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.genero || '-'}</td>
                    <td>${livro.estoque}</td>
                    <td>
                        <button onclick="adicionarAoCarrinho('${livro.id}')" class="btn-adicionar">Adicionar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar livros do catálogo.</td></tr>';
        }
    }

    window.adicionarAoCarrinho = async (livroId) => {
        if (!usuarioId || usuarioId === 'null') {
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
            } else {
                alert('Erro ao adicionar livro ao carrinho.');
            }
        } catch (error) {
            alert('Erro ao adicionar livro.');
        }
    };

    async function atualizarContador() {
        if (!usuarioId || usuarioId === 'null' || !contadorCarrinhoSpan) return;
        const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
        if (response.ok) {
            const carrinho = await response.json();
            const lista = carrinho.livros || [];
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