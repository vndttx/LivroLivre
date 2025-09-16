document.getElementById('cadastro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nomeUsuario = document.getElementById('nome-usuario').value;
    const senha = document.getElementById('senha').value;

    fetch('/api/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nomeUsuario, senha })
    })
    .then(response => {
        if (response.ok) {
            alert('Usuário cadastrado com sucesso! Faça o login.');
            window.location.href = 'login.html'; // Redireciona para a tela de login
        } else {
            alert('Erro ao cadastrar usuário.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro. Tente novamente mais tarde.');
    });
});