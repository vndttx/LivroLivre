document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');

    if (!token || token === 'null' || !usuarioId || usuarioId === 'null') {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    const tbody = document.querySelector('#carrinho-tabela tbody');

    async function carregarCarrinho() {
        if (!tbody) return;
        try {
            const response = await fetch(`/api/carrinho/${usuarioId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const carrinho = await response.json();
            tbody.innerHTML = '';

            if (!carrinho.length) {
                tbody.innerHTML = '<tr><td colspan="2">Carrinho vazio.</td></tr>';
                return;
            }

            carrinho.forEach(item => {
                const tr = document.createElement('tr');
                const dono = item.livro.proprietario ? item.livro.proprietario.email : 'Desconhecido';

                tr.innerHTML = `
                    <td>${item.livro.titulo} (Dono: ${dono})</td>
                    <td>
                        <button onclick="removerItem(${item.livro.id})">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) { console.error(err); }
    }

    window.removerItem = async (livroId) => {
        const res = await fetch(`/api/carrinho/${usuarioId}/remover/${livroId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) carregarCarrinho();
    };

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