document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nomeInput = document.getElementById('nome-usuario');
            const emailInput = document.getElementById('email');
            const senhaInput = document.getElementById('senha');

            if (!nomeInput || !emailInput || !senhaInput) {
                console.error("Erro: Um ou mais campos não foram encontrados no HTML.");
                return;
            }

            const usuario = {
                nomeUsuario: nomeInput.value,
                email: emailInput.value,
                senha: senhaInput.value
            };

            try {
                const response = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuario)
                });

                if (response.ok) {
                    alert('Usuário cadastrado com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    const erroTxt = await response.text();
                    alert('Erro no cadastro: ' + erroTxt);
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor.');
            }
        });
    }
});