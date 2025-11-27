document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nomeUsuario = document.getElementById('nome-usuario').value;
            const senha = document.getElementById('senha').value;

            const loginRequest = {
                nomeUsuario: nomeUsuario,
                senha: senha
            };

            try {
                const response = await fetch('/api/autenticacao/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginRequest)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('jwtToken', data.jwt);
                    localStorage.setItem('usuarioId', data.usuarioId);
                    window.location.href = 'dashboard.html';
                } else {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage || "Erro desconhecido de autenticação.");
                }
            } catch (error) {
                alert(error.message);
                console.error('Erro de Login:', error);
            }
        });
    }
});