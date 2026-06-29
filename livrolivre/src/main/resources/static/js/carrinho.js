document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');
    const emailUsuario = localStorage.getItem('emailUsuario') || localStorage.getItem('usuarioEmail');

    if (!token || token === 'null' || !usuarioId || usuarioId === 'null') {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

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

    const tbody = document.querySelector('#carrinho-tabela tbody');

    async function fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'login.html';
            return Promise.reject('Sessao expirada');
        }
        return response;
    }

    async function carregarCarrinho() {
        if (!tbody) return;
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            const carrinho = await response.json();
            tbody.innerHTML = '';

            const livros = carrinho.livros || [];

            if (livros.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">Carrinho vazio.</td></tr>';
                return;
            }

            livros.forEach(livro => {
                const tr = document.createElement('tr');
                const donoEmail = (livro.proprietario && livro.proprietario.email) ? livro.proprietario.email : 'Desconhecido';
                const donoId = (livro.proprietario && livro.proprietario.id) ? livro.proprietario.id : '';

                tr.innerHTML = `
                    <td style="padding: 10px; vertical-align: middle;">
                        <strong>${livro.titulo}</strong><br>
                        <span style="font-size: 0.85em; color: #555;">Dono: ${donoEmail}</span>
                    </td>
                    <td style="padding: 10px; display: flex; gap: 8px; justify-content: flex-start; align-items: center;">
                        <button onclick="proporTroca('${livro.id}', '${donoId}')" class="btn-cadastro">Propor Troca</button>
                        <button onclick="solicitarDoacao('${livro.id}', '${donoId}')" class="button">Pedir Doação</button>
                        <button onclick="removerItem('${livro.id}')" class="btn-sair">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar itens do carrinho.</td></tr>';
        }
    }

    window.proporTroca = async (livroSolicitadoId, destinatarioId) => {
        if (destinatarioId === usuarioId) {
            alert('Você não pode integrar uma proposta de troca consigo mesmo.');
            return;
        }

        const nomeLivroOfertado = prompt('Insira o TÍTULO do livro do seu acervo que você deseja oferecer em troca:');
        if (!nomeLivroOfertado || nomeLivroOfertado.trim() === '') return;

        try {
            const resLivros = await fetchWithAuth(`/api/livros/usuario/${usuarioId}`);
            if (!resLivros.ok) {
                alert('Erro ao consultar seu acervo de livros.');
                return;
            }

            const meusLivros = await resLivros.json();
            const livroEncontrado = meusLivros.find(l =>
                l.titulo.toLowerCase().trim() === nomeLivroOfertado.toLowerCase().trim()
            );

            if (!livroEncontrado) {
                alert(`Livro "${nomeLivroOfertado}" não foi encontrado no seu acervo ou não está disponível.`);
                return;
            }

            const transacaoPayload = {
                solicitante: { id: usuarioId },
                destinatario: { id: destinatarioId },
                livroSolicitado: { id: livroSolicitadoId },
                livroOfertado: { id: livroEncontrado.id },
                tipo: "TROCA"
            };

            const res = await fetchWithAuth('/api/transacoes', {
                method: 'POST',
                body: JSON.stringify(transacaoPayload)
            });

            if (res.ok) {
                alert('Proposta de troca enviada com sucesso!');
                await removerItemSemAtualizar(livroSolicitadoId);
                carregarCarrinho();
            } else {
                alert('Erro ao enviar proposta de troca.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.solicitarDoacao = async (livroSolicitadoId, destinatarioId) => {
        if (destinatarioId === usuarioId) {
            alert('Você não pode solicitar uma doação de si mesmo.');
            return;
        }

        const transacaoPayload = {
            solicitante: { id: usuarioId },
            destinatario: { id: destinatarioId },
            livroSolicitado: { id: livroSolicitadoId },
            livroOfertado: null,
            tipo: "DOACAO"
        };

        try {
            const res = await fetchWithAuth('/api/transacoes', {
                method: 'POST',
                body: JSON.stringify(transacaoPayload)
            });

            if (res.ok) {
                alert('Solicitação de doação enviada com sucesso!');
                await removerItemSemAtualizar(livroSolicitadoId);
                carregarCarrinho();
            } else {
                alert('Erro ao enviar solicitação de doação.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.removerItem = async (livroId) => {
        try {
            const res = await fetchWithAuth(`/api/carrinho/${usuarioId}/remover/${livroId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                carregarCarrinho();
            } else {
                alert('Erro ao remover item do carrinho.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    async function removerItemSemAtualizar(livroId) {
        await fetchWithAuth(`/api/carrinho/${usuarioId}/remover/${livroId}`, {
            method: 'DELETE'
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

    carregarCarrinho();
});