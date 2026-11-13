const formCadastro = document.getElementById('form-cadastro');

iniciarValidacao(formCadastro);
ligarCep(formCadastro);

formCadastro.addEventListener('submit', e => {
    e.preventDefault();
    if (!validarFormulario(formCadastro)) return;

    const dados = Object.fromEntries(new FormData(formCadastro));
    dados.nome = dados.nome.trim();
    dados.email = dados.email.trim().toLowerCase();
    delete dados.confirmar;

    const lista = listaUsuarios();

    if (lista.some(u => u.email === dados.email)) {
        mostrarErro(formCadastro.elements['email'], 'E-mail já cadastrado.');
        formCadastro.elements['email'].focus();
        return;
    }

    if (lista.some(u => soNumeros(u.cpf) === soNumeros(dados.cpf))) {
        mostrarErro(formCadastro.elements['cpf'], 'CPF já cadastrado.');
        formCadastro.elements['cpf'].focus();
        return;
    }

    lista.push(dados);
    salvar('usuarios', lista);
    iniciarSessao(dados.email);
    atualizarConta();
    mostrarAviso('Conta criada com sucesso!');
    setTimeout(() => {
        location.href = 'index.html';
    }, 1200);
});
