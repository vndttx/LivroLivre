document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro-livro');
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuarioId');

    if (!token || token === 'null' || !usuarioId || usuarioId === 'null') {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const dados = {
            titulo: document.getElementById('titulo').value,
            autor: document.getElementById('autor').value,
            genero: document.getElementById('genero').value,
            estoque: parseInt(document.getElementById('estoque').value) || 1,
            status: "DISPONIVEL"
        };

        try {
            const response = await fetch('/api/livros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Usuario-Id': usuarioId
                },
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                alert('Livro cadastrado com sucesso!');
                window.location.href = 'index.html';
            } else {
                alert('Erro ao cadastrar livro.');
            }
        } catch (error) {
            alert('Erro de conexao.');
        }
    });
});