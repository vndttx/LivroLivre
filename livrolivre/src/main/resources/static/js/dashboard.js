document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const nomeUsuario = localStorage.getItem('usuarioLogado');

    const tituloPainel = document.getElementById('titulo-painel');
    const ofertasTbody = document.querySelector('#ofertas-tabela tbody');
    const meusLivrosTbody = document.querySelector('#meus-livros-tabela tbody');
    const historicoTbody = document.querySelector('#historico-tabela tbody');
    const container = document.querySelector('.container');
    const btnSair = document.getElementById('btn-sair');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    tituloPainel.textContent = `Painel do Usuario: ${nomeUsuario}`;

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    }

    function renderOfertas(ofertas) {
        ofertasTbody.innerHTML = '';
        if (ofertas.length === 0) {
            ofertasTbody.innerHTML = '<tr><td colspan="4">Nenhuma oferta recebida.</td></tr>';
            return;
        }
        ofertas.forEach(oferta => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${oferta.solicitante.nomeUsuario}</td>
                <td>${oferta.livroOfertado.titulo}</td>
                <td>${oferta.livroSolicitado.titulo}</td>
                <td>
                    <button class="btn-aceitar" data-id="${oferta.id}">Aceitar</button>
                    <button class="btn-recusar" data-id="${oferta.id}">Recusar</button>
                </td>
            `;
            ofertasTbody.appendChild(tr);
        });
    }

    function renderMeusLivros(livros) {
        meusLivrosTbody.innerHTML = '';
        if (livros.length === 0) {
            meusLivrosTbody.innerHTML = '<tr><td colspan="4">Voce nao cadastrou nenhum livro.</td></tr>';
            return;
        }
        livros.forEach(livro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="detalhes.html?id=${livro.id}">${livro.titulo}</a></td>
                    <td>${livro.autor}</td>
                    <td>${livro.status}</td>
                    <td>
                        <button class="btn-remover-livro" data-id="${livro.id}">Remover</button>
                    </td>
            `;
            meusLivrosTbody.appendChild(tr);
        });
    }

    function renderHistorico(transacoes) {
        historicoTbody.innerHTML = '';
        if (transacoes.length === 0) {
            historicoTbody.innerHTML = '<tr><td colspan="5">Nenhuma transacao no seu historico.</td></tr>';
            return;
        }
        transacoes.forEach(transacao => {
            const tr = document.createElement('tr');
            const dataFormatada = new Date(transacao.data).toLocaleDateString('pt-BR');
            const livroPrincipal = transacao.livroSolicitado ? transacao.livroSolicitado.titulo : '(N/A)';

            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${transacao.tipo}</td>
                <td>${livroPrincipal}</td>
                <td>${transacao.proprietario.nomeUsuario}</td>
                <td>${transacao.status}</td>
            `;
            historicoTbody.appendChild(tr);
        });
    }

    async function carregarDashboard() {
        try {
            const [ofertasRes, meusLivrosRes, historicoRes] = await Promise.all([
                fetchWithAuth('/api/transacoes/ofertas-recebidas'),
                fetchWithAuth('/api/livros/meus-livros'),
                fetchWithAuth('/api/transacoes/meu-historico')
            ]);

            if (!ofertasRes.ok || !meusLivrosRes.ok || !historicoRes.ok) {
                throw new Error('Falha ao carregar dados do painel.');
            }

            const [ofertas, meusLivros, historico] = await Promise.all([
                ofertasRes.json(),
                meusLivrosRes.json(),
                historicoRes.json()
            ]);

            renderOfertas(ofertas);
            renderMeusLivros(meusLivros);
            renderHistorico(historico);

        } catch (error) {
            console.error("Erro ao carregar painel:", error);
        }
    }

    function aceitarOferta(transacaoId) {
        fetchWithAuth(`/api/transacoes/${transacaoId}/aceitar`, { method: 'POST' })
            .then(response => {
                if (!response.ok) return response.text().then(text => { throw new Error(text) });
                return response.json();
            })
            .then(() => {
                alert('Troca aceita com sucesso!');
                carregarDashboard();
            })
            .catch(error => alert(`Erro ao aceitar a troca: ${error.message}`));
    }

    function recusarOferta(transacaoId) {
        fetchWithAuth(`/api/transacoes/${transacaoId}/recusar`, { method: 'POST' })
            .then(response => {
                if (!response.ok) return response.text().then(text => { throw new Error(text) });
                return response.json();
            })
            .then(() => {
                alert('Troca recusada com sucesso.');
                carregarDashboard();
            })
            .catch(error => alert(`Erro ao recusar a troca: ${error.message}`));
    }

    function removerLivro(livroId) {
        if (confirm('Voce tem certeza que deseja remover este livro permanentemente?')) {
            fetchWithAuth(`/api/livros/${livroId}`, { method: 'DELETE' })
                .then(response => {
                    if (!response.ok) throw new Error('Falha ao remover o livro.');
                    alert('Livro removido com sucesso.');
                    carregarDashboard();
                })
                .catch(error => alert(error.message));
        }
    }

    container.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.getAttribute('data-id');

        if (target.classList.contains('btn-aceitar')) {
            aceitarOferta(id);
        } else if (target.classList.contains('btn-recusar')) {
            recusarOferta(id);
        } else if (target.classList.contains('btn-remover-livro')) {
            removerLivro(id);
        }
    });

    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    carregarDashboard();
});