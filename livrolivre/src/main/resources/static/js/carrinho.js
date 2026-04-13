document.addEventListener('DOMContentLoaded', () => {
    const carrinhoTabelaBody = document.querySelector('#carrinho-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const modal = document.getElementById('modal-troca');
    const closeButton = document.querySelector('.close-button');
    const selectMeusLivros = document.getElementById('select-meus-livros');
    const btnConfirmarTroca = document.getElementById('btn-confirmar-troca');
    const tituloLivroSolicitadoSpan = document.getElementById('titulo-livro-solicitado');
    const btnSair = document.getElementById('btn-sair');

    let livroSolicitadoAtualId = null;

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }

    async function carregarCarrinho() {
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
            const carrinho = await response.json();

            carrinhoTabelaBody.innerHTML = '';
            if (carrinho.length === 0) {
                carrinhoTabelaBody.innerHTML = '<tr><td colspan="2">Seu carrinho esta vazio.</td></tr>';
                return;
            }

            carrinho.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.livro.titulo} (Dono: ${item.livro.proprietario.emailUsuario})</td>
                    <td>
                        <a href="#" class="pedir-doacao" data-livro-id="${item.livro.id}">Pedir Doacao</a>
                        <a href="#" class="propor-troca" data-livro-id="${item.livro.id}" data-livro-titulo="${item.livro.titulo}">Propor Troca</a>
                        <a href="#" class="remover-carrinho" data-livro-id="${item.livro.id}">Remover</a>
                    </td>
                `;
                carrinhoTabelaBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
        }
    }

    async function removerItemDoCarrinho(livroId) {
        try {
            const response = await fetchWithAuth(`/api/carrinho/${usuarioId}/remover/${livroId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Livro removido do carrinho!');
                carregarCarrinho();
            } else {
                throw new Error('Falha ao remover.');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    async function pedirDoacao(livroId) {
        if (confirm('Voce tem certeza que deseja solicitar este livro como doacao?')) {
            try {
                const response = await fetchWithAuth(`/api/transacoes/finalizar/${livroId}`, {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('Doacao solicitada com sucesso!');
                    carregarCarrinho();
                } else {
                    const erro = await response.text();
                    throw new Error(erro || 'Falha ao solicitar a doacao.');
                }
            } catch (error) {
                console.error('Erro ao solicitar doacao:', error);
                alert(`Nao foi possivel solicitar a doacao: ${error.message}`);
            }
        }
    }

    async function abrirModalProposta(livroId, livroTitulo) {
        livroSolicitadoAtualId = livroId;
        tituloLivroSolicitadoSpan.textContent = livroTitulo;

        try {
            const response = await fetchWithAuth('/api/livros/meus-livros');
            const meusLivros = await response.json();

            selectMeusLivros.innerHTML = '<option value="">Selecione um livro</option>';
            if (meusLivros.length === 0) {
                selectMeusLivros.innerHTML = '<option value="">Voce nao tem livros disponiveis para troca</option>';
                btnConfirmarTroca.disabled = true;
            } else {
                meusLivros.forEach(livro => {
                    const option = document.createElement('option');
                    option.value = livro.id;
                    option.textContent = livro.titulo;
                    selectMeusLivros.appendChild(option);
                });
                btnConfirmarTroca.disabled = false;
            }
            modal.style.display = 'block';
        } catch (error) {
            console.error('Erro ao carregar livros para troca:', error);
        }
    }

    function fecharModal() {
        modal.style.display = 'none';
        livroSolicitadoAtualId = null;
    }

    carrinhoTabelaBody.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.classList.contains('remover-carrinho')) {
            const livroId = event.target.getAttribute('data-livro-id');
            removerItemDoCarrinho(livroId);
        }
        if (event.target.classList.contains('propor-troca')) {
            const livroId = event.target.getAttribute('data-livro-id');
            const livroTitulo = event.target.getAttribute('data-livro-titulo');
            abrirModalProposta(livroId, livroTitulo);
        }
        if (event.target.classList.contains('pedir-doacao')) {
            const livroId = event.target.getAttribute('data-livro-id');
            pedirDoacao(livroId);
        }
    });

    closeButton.addEventListener('click', fecharModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            fecharModal();
        }
    });

    btnConfirmarTroca.addEventListener('click', async () => {
        const livroOfertadoId = selectMeusLivros.value;
        if (!livroOfertadoId) {
            alert('Por favor, selecione um livro para ofertar.');
            return;
        }

        const proposta = {
            livroSolicitadoId: livroSolicitadoAtualId,
            livroOfertadoId: livroOfertadoId
        };

        try {
            const response = await fetchWithAuth('/api/transacoes/propor-troca', {
                method: 'POST',
                body: JSON.stringify(proposta)
            });

            if (response.ok) {
                alert('Proposta de troca enviada com sucesso!');
                fecharModal();
                carregarCarrinho();
            } else {
                const erro = await response.text();
                throw new Error(erro);
            }
        } catch (error) {
            console.error('Erro ao propor troca:', error);
            alert(`Nao foi possivel enviar a proposta: ${error.message}`);
        }
    });

    if (btnSair) {
        btnSair.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.clear();
            alert("Voce saiu com sucesso.");
            window.location.href = 'login.html';
            return;
        });
    }

    carregarCarrinho();
});