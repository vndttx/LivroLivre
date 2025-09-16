document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nomeUsuario = document.getElementById('nome-usuario').value;
    const senha = document.getElementById('senha').value;

    fetch('/api/autenticacao/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nomeUsuario, senha })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Credenciais inválidas. Tente novamente.');
        }
        return response.json();
    })
    .then(data => {
        const token = data.token;
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('usuarioLogado', nomeUsuario);
        alert('Login bem-sucedido!');
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert(error.message);
    });
});