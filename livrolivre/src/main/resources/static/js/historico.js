document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#historico-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');


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
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }

    async function carregarHistorico() {
        try {
            const response = await fetchWithAuth('/api/transacoes/meu-historico');
            if (!response.ok) {
                throw new Error('Nao foi possivel carregar o historico.');
            }
            const transacoes = await response.json();

            tbody.innerHTML = ''; // Limpa a tabela

            if (transacoes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Voce ainda nao realizou nenhuma transacao.</td></tr>';
                return;
            }

            transacoes.forEach(transacao => {
                const tr = document.createElement('tr');

                // Formata a lista de livros para exibicao
                const titulosLivros = transacao.livros.map(livro => livro.titulo).join(', ');

                // Formata a data para o padrao brasileiro
                const dataFormatada = new Date(transacao.data).toLocaleDateString('pt-BR');

                tr.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>${transacao.tipo}</td>
                    <td>${titulosLivros}</td>
                    <td>${transacao.proprietario.nomeUsuario}</td>
                    <td>${transacao.status}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao carregar historico:', error);
            tbody.innerHTML = '<tr><td colspan="5">Ocorreu um erro ao carregar seu historico.</td></tr>';
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

    carregarHistorico();
});