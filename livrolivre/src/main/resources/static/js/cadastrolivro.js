document.getElementById('cadastro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const livro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        estoque: document.getElementById('estoque').value
    };

    fetch('/api/livros', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(livro)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao cadastrar livro. Verifique o console.');
        }
        return response.json();
    })
    .then(data => {
        alert('Livro cadastrado com sucesso!');
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Falha ao cadastrar livro. Verifique o console.');
    });
});