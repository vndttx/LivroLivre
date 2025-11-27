document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro-livro');
    const usuarioId = localStorage.getItem('usuarioId');

    if (!usuarioId) {
        alert("Voce precisa estar logado.");
        window.location.href = 'login.html';
        return;
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('titulo').value;
            const autor = document.getElementById('autor').value;
            const genero = document.getElementById('genero').value;
            const estoque = document.getElementById('estoque').value;

            const livroData = {
                titulo: titulo,
                autor: autor,
                genero: genero,
                estoque: parseInt(estoque) || 1,
                status: "DISPONIVEL"
            };

            try {
                const token = localStorage.getItem('jwtToken');

                const response = await fetch('/api/livros', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(livroData)
                });

                if (response.ok) {
                    alert('Livro cadastrado com sucesso!');
                    window.location.href = 'index.html';
                } else {
                    const erro = await response.text();
                    alert('Erro ao cadastrar: ' + erro);
                    console.error('Erro backend:', erro);
                }
            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Erro de conexao com o servidor.');
            }
        });
    }
});