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
        return Promise.reject(new Error('Sessao expirada'));
    }

    return response;
}

async function atualizarContadorCarrinho() {
    const usuarioId = localStorage.getItem('usuarioId');
    const contadorElement = document.getElementById('contador-carrinho');

    if (!usuarioId || !contadorElement) {
        if (contadorElement) {
            contadorElement.textContent = '0';
        }
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/carrinho/${usuarioId}`);
        if (response.ok) {
            const carrinho = await response.json();
            contadorElement.textContent = carrinho.length;
        } else {
            contadorElement.textContent = '0';
        }
    } catch (error) {
        contadorElement.textContent = '0';
    }
}