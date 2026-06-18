document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#ofertas-tabela tbody');
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            alert('Sessao expirada.');
            window.location.href = 'login.html';
            return Promise.reject(new Error('Sessao expirada'));
        }
        return response;
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
                    <td>${oferta.solicitante.emailUsuario}</td>
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
            tbody.innerHTML = '<tr><td colspan="4">Ocorreu um erro ao carregar as ofertas.</td></tr>';
        }
    }

    async function aceitarOferta(transacaoId) {
        try {
            const response = await fetchWithAuth(`/api/transacoes/${transacaoId}/aceitar`, { method: 'POST' });

            if (response.ok) {
                alert('Troca aceita com sucesso!');
                carregarOfertas();
            } else {
                const erro = await response.text();
                throw new Error(erro);
            }
        } catch (error) {
            alert(`Erro ao aceitar a troca: ${error.message}`);
        }
    }

    async function recusarOferta(transacaoId) {
        try {
            const response = await fetchWithAuth(`/api/transacoes/${transacaoId}/recusar`, { method: 'POST' });

            if (response.ok) {
                alert('Troca recusada com sucesso.');
                carregarOfertas();
            } else {
                const erro = await response.text();
                throw new Error(erro);
            }
        } catch (error) {
            alert(`Erro ao recusar a troca: ${error.message}`);
        }
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

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        };
    }

    carregarOfertas();
});