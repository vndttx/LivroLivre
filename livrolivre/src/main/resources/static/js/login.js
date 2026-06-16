document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('/api/autenticacao/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const data = await response.json();
            // Sincronizando com o Dashboard e Carrinho
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioId', data.usuarioId);
            window.location.href = 'dashboard.html';
        } else {
            alert('E-mail ou senha incorretos.');
        }
    } catch (err) {
        alert('Erro ao conectar com o servidor.');
    }
});