document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#ofertas-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');
    const btnSair = document.getElementById('btn-sair');

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

    async function carregarOfertas() {
        try {
            const response = await fetchWithAuth('/api/transacoes/ofertas-recebidas');
            if (!response.ok) {
                throw new Error('Nao foi possivel carregar as ofertas.');
            }
            const ofertas = await response.json();
            tbody.innerHTML = '';
            if (ofertas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">Voce nao tem nenhuma oferta de troca pendente.</td></tr>';
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
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar ofertas:', error);
            tbody.innerHTML = '<tr><td colspan="4">Ocorreu um erro ao carregar as ofertas.</td></tr>';
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
                carregarOfertas();
            })
            .catch(error => {
                alert(`Erro ao aceitar a troca: ${error.message}`);
            });
    }

    function recusarOferta(transacaoId) {
        fetchWithAuth(`/api/transacoes/${transacaoId}/recusar`, { method: 'POST' })
            .then(response => {
                if (!response.ok) return response.text().then(text => { throw new Error(text) });
                return response.json();
            })
            .then(() => {
                alert('Troca recusada com sucesso.');
                carregarOfertas();
            })
            .catch(error => {
                alert(`Erro ao recusar a troca: ${error.message}`);
            });
    }

    tbody.addEventListener('click', (event) => {
        const target = event.target;
        const transacaoId = target.getAttribute('data-id');

        if (target.classList.contains('btn-aceitar')) {
            aceitarOferta(transacaoId);
        } else if (target.classList.contains('btn-recusar')) {
            recusarOferta(transacaoId);
        }
    });

    if (btnSair) {
            btnSair.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.clear();
                alert("Voce saiu com sucesso.");
                window.location.href = 'login.html';
            });
    }

    carregarOfertas();
});