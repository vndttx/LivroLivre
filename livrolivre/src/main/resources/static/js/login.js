document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) {
        console.error('Formulário de login não encontrado na página.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email') || document.querySelector('input[type="email"]');
        const senhaInput = document.getElementById('senha') || document.querySelector('input[type="password"]');

        if (!emailInput || !senhaInput) {
            alert('Campos de entrada não foram encontrados.');
            return;
        }

        try {
            const response = await fetch('/api/autenticacao/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    senha: senhaInput.value
                })
            });

            if (response.ok) {
                const dados = await response.json();

                localStorage.setItem('token', dados.token);
                localStorage.setItem('usuarioId', dados.id);

                window.location.href = 'catalogo.html';
            } else {
                const textoErro = await response.text();
                alert(textoErro || 'E-mail ou senha incorretos.');
            }

        } catch (error) {
            console.error('Erro detalhado no login:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });
});