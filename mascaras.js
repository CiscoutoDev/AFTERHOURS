const mascarasNumericas = ['cpf', 'telefone', 'cep', 'data'];

function soNumeros(texto) {
    return String(texto).replace(/\D/g, '');
}

function aplicarPadrao(texto, padrao) {
    const numeros = soNumeros(texto);
    let saida = '';
    let posicao = 0;
    for (const caractere of padrao) {
        if (posicao >= numeros.length) break;
        if (caractere === '0') {
            saida += numeros[posicao];
            posicao++;
        } else {
            saida += caractere;
        }
    }
    return saida;
}

const mascaras = {
    nome(v) {
        return v.replace(/[^\p{L}' -]/gu, '').replace(/\s{2,}/g, ' ');
    },
    cpf(v) {
        return aplicarPadrao(v, '000.000.000-00');
    },
    telefone(v) {
        const padrao = soNumeros(v).length > 10 ? '(00) 00000-0000' : '(00) 0000-0000';
        return aplicarPadrao(v, padrao);
    },
    cep(v) {
        return aplicarPadrao(v, '00000-000');
    },
    data(v) {
        return aplicarPadrao(v, '00/00/0000');
    },
    uf(v) {
        return v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    }
};

document.addEventListener('input', e => {
    const campo = e.target;
    if (!campo.dataset) return;
    if (campo.dataset.mascara && mascaras[campo.dataset.mascara]) {
        campo.value = mascaras[campo.dataset.mascara](campo.value);
    } else if ('numerico' in campo.dataset) {
        campo.value = soNumeros(campo.value);
    }
});

document.addEventListener('beforeinput', e => {
    const campo = e.target;
    if (!campo.dataset) return;
    const numerico = 'numerico' in campo.dataset || mascarasNumericas.includes(campo.dataset.mascara);
    if (numerico && e.data && /\D/.test(e.data)) e.preventDefault();
});

function cpfValido(cpf) {
    const n = soNumeros(cpf);
    if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
    for (let t = 9; t < 11; t++) {
        let soma = 0;
        for (let i = 0; i < t; i++) {
            soma += Number(n[i]) * (t + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(n[t])) return false;
    }
    return true;
}

function emailValido(texto) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto.trim());
}

function dataValida(texto) {
    const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!partes) return false;
    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return false;
    return ano >= 1900 && data <= new Date();
}

const regras = {
    nome: v => (v.trim().length >= 5 && v.trim().split(/\s+/).length >= 2 ? '' : 'Informe nome e sobrenome.'),
    cpf: v => (cpfValido(v) ? '' : 'CPF inválido.'),
    email: v => (emailValido(v) ? '' : 'E-mail inválido.'),
    telefone: v => {
        const tamanho = soNumeros(v).length;
        return tamanho === 10 || tamanho === 11 ? '' : 'Telefone inválido.';
    },
    nascimento: v => (dataValida(v) ? '' : 'Data inválida (dd/mm/aaaa).'),
    cep: v => (soNumeros(v).length === 8 ? '' : 'O CEP deve ter 8 números.'),
    texto: v => (v.trim().length >= 2 ? '' : 'Campo obrigatório.'),
    numero: v => (v.length >= 1 ? '' : 'Informe o número.'),
    uf: v => (/^[A-Z]{2}$/.test(v) ? '' : 'Use a sigla do estado (ex: MG).'),
    senha: v => (v.length >= 6 ? '' : 'Mínimo de 6 caracteres.')
};

function mostrarErro(campo, mensagem) {
    const rotulo = campo.closest('.campo');
    const erro = rotulo ? rotulo.querySelector('.erro') : null;
    if (erro) erro.textContent = mensagem;
    campo.classList.toggle('invalido', mensagem !== '');
}

function validarCampo(campo) {
    let mensagem = '';
    const regra = campo.dataset.regra;
    if (regra === 'confirmar') {
        const senha = campo.form.elements['senha'].value;
        mensagem = campo.value !== '' && campo.value === senha ? '' : 'As senhas não coincidem.';
    } else if (regras[regra]) {
        mensagem = regras[regra](campo.value);
    }
    mostrarErro(campo, mensagem);
    return mensagem === '';
}

function validarFormulario(form) {
    let valido = true;
    let primeiroInvalido = null;
    form.querySelectorAll('[data-regra]').forEach(campo => {
        if (!validarCampo(campo)) {
            valido = false;
            if (!primeiroInvalido) primeiroInvalido = campo;
        }
    });
    if (primeiroInvalido) primeiroInvalido.focus();
    return valido;
}

function iniciarValidacao(form) {
    form.querySelectorAll('[data-regra]').forEach(campo => {
        campo.addEventListener('blur', () => {
            if (campo.value !== '') validarCampo(campo);
        });
        campo.addEventListener('input', () => {
            if (campo.classList.contains('invalido')) validarCampo(campo);
        });
    });
}

function buscarCep(form) {
    const campoCep = form.elements['cep'];
    const numeros = soNumeros(campoCep.value);
    if (numeros.length !== 8) return;
    fetch('https://viacep.com.br/ws/' + numeros + '/json/')
        .then(resposta => resposta.json())
        .then(dados => {
            if (dados.erro) {
                mostrarErro(campoCep, 'CEP não encontrado.');
                return;
            }
            mostrarErro(campoCep, '');
            if (dados.logradouro) form.elements['rua'].value = dados.logradouro;
            if (dados.bairro) form.elements['bairro'].value = dados.bairro;
            if (dados.localidade) form.elements['cidade'].value = dados.localidade;
            if (dados.uf) form.elements['uf'].value = dados.uf;
        })
        .catch(() => {});
}

function ligarCep(form) {
    form.elements['cep'].addEventListener('input', () => {
        if (soNumeros(form.elements['cep'].value).length === 8) buscarCep(form);
    });
}
