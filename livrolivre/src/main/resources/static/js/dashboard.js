document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorCarrinhoSpan = document.getElementById('contador-carrinho');
    const btnSair = document.getElementById("btn-sair");

    const tabelaHistorico = document.querySelector('#tabela-historico tbody'); // Verifique se o ID no HTML é este
    const tabelaMeusLivros = document.querySelector('#tabela-meus-livros tbody'); // Verifique se o ID no HTML é este

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
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

    function atualizarContador() {
        if (!contadorCarrinhoSpan) return;
        fetchWithAuth(`/api/carrinho/${usuarioId}`)
            .then(res => res.ok ? res.json() : [])
            .then(lista => {
                contadorCarrinhoSpan.textContent = lista.length || 0;
            })
            .catch(() => contadorCarrinhoSpan.textContent = 0);
    }

    // --- 3. CARREGAR HISTÓRICO (DOAÇÕES/TROCAS) ---
    async function carregarHistorico() {
        if (!tabelaHistorico) return;

        tabelaHistorico.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';

        try {
            // Ajuste a URL se seu controller for diferente
            const response = await fetchWithAuth(`/api/transacoes/usuario/${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar historico");

            const transacoes = await response.json();
            tabelaHistorico.innerHTML = '';

            if (transacoes.length === 0) {
                tabelaHistorico.innerHTML = '<tr><td colspan="5">Nenhuma transacao encontrada.</td></tr>';
                return;
            }

            transacoes.forEach(t => {
                const dataFormatada = new Date(t.dataCriacao).toLocaleDateString('pt-BR');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${t.tipo}</td>
                    <td>${t.livro ? t.livro.titulo : 'Livro removido'}</td>
                    <td>${t.donoOriginal ? t.donoOriginal.nome : '-'}</td>
                    <td>${t.status}</td>
                `;
                tabelaHistorico.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            tabelaHistorico.innerHTML = '<tr><td colspan="5">Erro ao carregar historico.</td></tr>';
        }
    }
async function carregarMeusLivros() {
        const tabelaMeusLivros = document.querySelector('#tabela-meus-livros tbody');
        if (!tabelaMeusLivros) return;

        tabelaMeusLivros.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

        try {
            const response = await fetchWithAuth('/api/livros/meus-livros');

            if (!response.ok) {
                throw new Error('Erro ao buscar meus livros');
            }

            const livros = await response.json();
            tabelaMeusLivros.innerHTML = '';

            if (livros.length === 0) {
                tabelaMeusLivros.innerHTML = '<tr><td colspan="4">Voce nao cadastrou nenhum livro.</td></tr>';
                return;
            }

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.status}</td>
                    <td>
                        <button class="btn-excluir" data-id="${livro.id}" style="color: red; border: none; background: none; cursor: pointer;">
                            Remover
                        </button>
                    </td>
                `;
                tabelaMeusLivros.appendChild(tr);
            });

            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if(confirm('Tem certeza que deseja excluir este livro?')) {
                        await removerLivro(id);
                    }
                });
            });

        } catch (error) {
            console.error(error);
            tabelaMeusLivros.innerHTML = '<tr><td colspan="4">Erro ao carregar livros.</td></tr>';
        }
    }

    async function removerLivro(id) {
        try {
            const res = await fetchWithAuth(`/api/livros/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Livro removido!');
                carregarMeusLivros(); // Recarrega a tabela
            } else {
                alert('Erro ao remover.');
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (btnSair) {
            btnSair.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.clear();
                alert("Voce saiu com sucesso.");
                window.location.href = 'login.html';
            });
    }

    atualizarContador();
    carregarHistorico();
    carregarMeusLivros();
});