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
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioId', data.usuarioId);
            window.location.replace('/dashboard.html');
        } else {
            alert('Credenciais inválidas.');
        }
    } catch (err) {
        alert('Erro ao conectar ao servidor.');
    }
});