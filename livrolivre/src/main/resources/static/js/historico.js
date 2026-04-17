document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#historico-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');

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
            return Promise.reject(new Error('Sessão expirada'));
        }

        return response;
    }

    async function atualizarContador() {
        if (!contadorCarrinhoSpan) return;
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            if (response.ok) {
                const lista = await response.json();
                contadorCarrinhoSpan.textContent = lista.length || 0;
            }
        } catch (error) {
            contadorCarrinhoSpan.textContent = 0;
        }
    }

    async function carregarHistorico() {
        try {
            const response = await fetchWithAuth('/api/transacoes/historico');
            if (!response.ok) {
                throw new Error('Nao foi possivel carregar o historico.');
            }
            const transacoes = await response.json();

            tbody.innerHTML = '';

            if (transacoes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Voce ainda nao realizou nenhuma transacao.</td></tr>';
                return;
            }

            transacoes.forEach(t => {
                const tr = document.createElement('tr');

                const tituloLivro = t.livroSolicitado ? t.livroSolicitado.titulo : (t.livroOfertado ? t.livroOfertado.titulo : 'Livro removido');
                const nomeDono = t.proprietario ? t.proprietario.emailUsuario : 'Desconhecido';
                const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');

                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${t.tipo}</td>
                    <td>${tituloLivro}</td>
                    <td>${nomeDono}</td>
                    <td>${t.status}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5">Ocorreu um erro ao carregar seu historico.</td></tr>';
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

    atualizarContador();
    carregarHistorico();
});