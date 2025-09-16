document.getElementById('cadastro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const livro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero: document.getElementById('genero').value,
        tipo: document.getElementById('tipo').value,
        isbn: document.getElementById('isbn').value,
        sinopse: document.getElementById('sinopse').value,
        status: document.getElementById('status').value
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
            throw new Error('Erro ao cadastrar livro');
        }
        return response.json();
    })
    .then(data => {
        alert('Livro cadastrado com sucesso!');
        document.getElementById('cadastro-form').reset();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Falha ao cadastrar livro. Verifique o console.');
    });
});