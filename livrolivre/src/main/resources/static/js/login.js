document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const dados = {
                email: document.getElementById('email-usuario').value,
                senha: document.getElementById('senha').value
            };

            const loginRequest = {
                emailUsuario: dados.email,
                senha: dados.senha
            };

            try {
                const response = await fetch('/api/autenticacao/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    const errorText = await response.text(); // Use response aqui dentro do else
                    throw new Error(errorText);
                }
            } catch (error) {
                console.error('Erro de Login:', error);
                alert('Erro ao realizar login. Verifique suas credenciais.');
            }
        });
    }
});