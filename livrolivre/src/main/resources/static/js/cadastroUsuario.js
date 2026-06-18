document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nomeUsuario: document.getElementById('nome-usuario').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
    };

    try {
        const response = await fetch('/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html';
        } else {
            const erroMsg = await response.text();
            alert('Erro no cadastro: ' + erroMsg);
        }
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});