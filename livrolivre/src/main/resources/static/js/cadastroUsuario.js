document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');

    form.addEventListener('submit', event => {
        event.preventDefault();

        const usuario = {
            nomeUsuario: document.getElementById('nome-usuario').value,
            senha: document.getElementById('senha').value
        };

        // Verifique se este trecho está correto
        fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao cadastrar. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            alert('Usuário cadastrado com sucesso!');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Erro no cadastro:', error);
            alert('Não foi possível cadastrar o usuário. Verifique o console.');
        });
    });
});