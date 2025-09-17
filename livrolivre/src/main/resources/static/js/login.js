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

        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('usuarioId', data.usuarioId);
        localStorage.setItem('usuarioLogado', data.nomeUsuario);

        alert('Login bem-sucedido!');
        window.location.href = 'index.html';
    })
});