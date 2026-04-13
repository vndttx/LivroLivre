document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const usuario = {
                emailUsuario: document.getElementById('email-usuario').value,
                senha: document.getElementById('senha').value
            };

            try {
                const response = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(usuario)
                });

                if (response.ok) {
                    alert('Usuário cadastrado com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    const erro = await response.text();
                    alert('Erro ao cadastrar: ' + (erro || response.status));
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                alert('Não foi possível conectar ao servidor.');
            }
        });
    }
});