const formPerfil = document.getElementById('form-perfil');
const camposPerfil = ['nome', 'cpf', 'email', 'telefone', 'nascimento', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf'];

function desenharPerfil() {
    const usuario = usuarioLogado();
    document.getElementById('precisa-login').hidden = !!usuario;
    document.getElementById('conteudo-perfil').hidden = !usuario;
    if (!usuario) return;

    camposPerfil.forEach(nome => {
        formPerfil.elements[nome].value = usuario[nome] || '';
        formPerfil.elements[nome].classList.remove('invalido');
    });

    const total = pedidosDoUsuario(usuario.email).length;
    document.getElementById('saudacao').textContent = 'Olá, ' + usuario.nome.split(' ')[0] + '!';
    document.getElementById('info-pedidos').textContent = total === 1 ? 'Você tem 1 pedido realizado.' : 'Você tem ' + total + ' pedidos realizados.';
}

iniciarValidacao(formPerfil);
ligarCep(formPerfil);

formPerfil.addEventListener('submit', e => {
    e.preventDefault();
    const usuario = usuarioLogado();
    if (!usuario) return;
    if (!validarFormulario(formPerfil)) return;

    const lista = listaUsuarios();
    const indice = lista.findIndex(u => u.email === usuario.email);
    if (indice === -1) return;

    ['nome', 'telefone', 'nascimento', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'uf'].forEach(nome => {
        lista[indice][nome] = formPerfil.elements[nome].value.trim();
    });

    salvar('usuarios', lista);
    atualizarConta();
    desenharPerfil();
    mostrarAviso('Dados atualizados com sucesso!');
});

document.addEventListener('sessaomudou', desenharPerfil);

desenharPerfil();
