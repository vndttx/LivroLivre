document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cadastro-livro');

    function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('jwtToken');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers: headers
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const livro = {
            titulo: document.getElementById('titulo').value,
            autor: document.getElementById('autor').value,
            genero: document.getElementById('genero').value,
            estoque: document.getElementById('estoque').value
        };

        fetchWithAuth('/api/livros', {
            method: 'POST',
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
});