const iconeBusca = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>';

function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    document.querySelectorAll('[data-tema-botao]').forEach(b => {
        b.textContent = tema === 'claro' ? '☾' : '☀';
    });
}

function alternarTema() {
    const novo = document.documentElement.getAttribute('data-tema') === 'claro' ? 'escuro' : 'claro';
    salvar('tema', novo);
    aplicarTema(novo);
}

function paginaAtual() {
    const partes = location.pathname.split('/');
    return partes[partes.length - 1] || 'index.html';
}

function htmlConta() {
    const usuario = usuarioLogado();
    if (usuario) {
        const primeiroNome = escapar(usuario.nome.split(' ')[0]);
        return '<span class="ola">Olá, ' + primeiroNome + '</span>' +
            '<button type="button" class="botao-entrar" data-sair>SAIR</button>';
    }
    return '<button type="button" class="botao-entrar" data-abrir-login>ENTRAR</button>' +
        '<a href="cadastro.html" class="botao-cadastrar">CADASTRAR</a>';
}

function htmlBusca(classe) {
    return '<form class="form-busca ' + classe + '" role="search">' +
        '<input type="search" name="q" placeholder="Buscar lanche" maxlength="40" aria-label="Buscar lanche">' +
        '<button type="submit" aria-label="Buscar">' + iconeBusca + '</button>' +
        '</form>';
}

function montarCabecalho() {
    if (!document.getElementById('topo')) return;
    const atual = paginaAtual();

    function link(href, texto, extra) {
        const classes = [];
        if (atual === href) classes.push('active');
        if (extra) classes.push(extra);
        const atributo = classes.length ? ' class="' + classes.join(' ') + '"' : '';
        return '<a href="' + href + '"' + atributo + '>' + texto + '</a>';
    }

    document.getElementById('topo').innerHTML = `
    <header class="header">
        <div class="header-container">
            <a href="index.html" class="logo">
                <img src="imgs/Logo.jpeg" alt="Logo" class="logoheader">
            </a>
            <nav class="nav-menu" id="nav-menu">
                ${link('index.html', 'INÍCIO')}
                ${link('cardapio.html', 'CARDÁPIO')}
                <a href="index.html#sobre">SOBRE NÓS</a>
                ${link('pedidos.html', 'PEDIDOS')}
                ${link('perfil.html', 'PERFIL', 'so-mobile')}
                ${htmlBusca('busca-menu so-mobile')}
                <div class="conta conta-mobile so-mobile"></div>
            </nav>
            <div class="header-icons">
                ${htmlBusca('busca-topo')}
                <a href="sacola.html" class="icone-sacola">
                    <img src="imgs/carrin.png" alt="Sacola">
                    <span class="contador zero" data-contador>0</span>
                </a>
                <a href="perfil.html" class="icone-perfil">
                    <img src="imgs/user.png" alt="Perfil">
                </a>
                <div class="conta conta-desktop"></div>
            </div>
            <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>`;
}

function montarRodape() {
    if (!document.getElementById('rodape')) return;
    document.getElementById('rodape').innerHTML = `
    <footer class="rodape">
        <div class="rodape-colunas">
            <div>
                <p class="rodape-marca"><span class="corzinha1">AFTER</span><span class="corzinha2">HOURS</span></p>
                <p>Hambúrgueres artesanais, feitos pra quem valoriza boas músicas, boas vibes e noites inesquecíveis.</p>
            </div>
            <div>
                <h4>NAVEGUE</h4>
                <a href="index.html">Início</a>
                <a href="cardapio.html">Cardápio</a>
                <a href="index.html#sobre">Sobre nós</a>
                <a href="pedidos.html">Meus pedidos</a>
            </div>
            <div>
                <h4>SUA CONTA</h4>
                <a href="cadastro.html">Cadastre-se</a>
                <a href="perfil.html">Meu perfil</a>
                <a href="sacola.html">Minha sacola</a>
            </div>
            <div>
                <h4>CONTATO</h4>
                <p>Rua da Madrugada, 123 - Centro</p>
                <p>(31) 99999-0000</p>
                <p>contato@afterhours.com</p>
                <p>Todos os dias, das 18h às 04h</p>
            </div>
        </div>
        <p class="rodape-fim">© ${new Date().getFullYear()} AFTERHOURS. Todos os direitos reservados.</p>
    </footer>`;
}

function montarModal() {
    document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="modal-login">
        <div class="modal-caixa">
            <button type="button" class="modal-fechar" id="fechar-login" aria-label="Fechar">×</button>
            <h2 class="modal-titulo">ENTRAR</h2>
            <form id="form-login" novalidate>
                <label class="campo">
                    <span>E-mail</span>
                    <input type="email" name="email" maxlength="80" autocomplete="email">
                </label>
                <label class="campo">
                    <span>Senha</span>
                    <input type="password" name="senha" maxlength="20" autocomplete="current-password">
                </label>
                <p class="erro" id="erro-login"></p>
                <button type="submit" class="botao">ENTRAR</button>
            </form>
            <p class="modal-rodape">Ainda não tem conta? <a href="cadastro.html">Cadastre-se</a></p>
        </div>
    </div>`);
}

function atualizarConta() {
    document.querySelectorAll('.conta').forEach(el => {
        el.innerHTML = htmlConta();
    });
}

function atualizarContador() {
    const total = totalItens();
    document.querySelectorAll('[data-contador]').forEach(el => {
        el.textContent = total > 99 ? '99+' : total;
        el.classList.toggle('zero', total === 0);
    });
}

function mostrarAviso(texto) {
    const anterior = document.querySelector('.aviso');
    if (anterior) anterior.remove();
    const aviso = document.createElement('div');
    aviso.className = 'aviso';
    aviso.textContent = texto;
    document.body.appendChild(aviso);
    setTimeout(() => aviso.remove(), 2600);
}

function fecharMenu() {
    document.getElementById('nav-menu').classList.remove('active');
    document.getElementById('menu-toggle').classList.remove('active');
}

function abrirLogin() {
    fecharMenu();
    document.getElementById('erro-login').textContent = '';
    document.getElementById('modal-login').classList.add('aberto');
    document.getElementById('form-login').elements['email'].focus();
}

function fecharLogin() {
    document.getElementById('modal-login').classList.remove('aberto');
}

function sairDaConta() {
    encerrarSessao();
    atualizarConta();
    mostrarAviso('Você saiu da conta.');
    document.dispatchEvent(new Event('sessaomudou'));
}

function ligarEventos() {
    const botaoMenu = document.getElementById('menu-toggle');
    botaoMenu.addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('active');
        botaoMenu.classList.toggle('active');
    });

    document.addEventListener('click', e => {
        if (e.target.closest('[data-tema-botao]')) {
            alternarTema();
        } else if (e.target.closest('[data-abrir-login]')) {
            abrirLogin();
        } else if (e.target.closest('[data-sair]')) {
            sairDaConta();
        } else if (e.target.id === 'modal-login' || e.target.closest('#fechar-login')) {
            fecharLogin();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') fecharLogin();
    });

    document.addEventListener('submit', e => {
        const form = e.target.closest('.form-busca');
        if (!form) return;
        e.preventDefault();
        const termo = form.elements['q'].value.trim();
        location.href = 'cardapio.html' + (termo ? '?busca=' + encodeURIComponent(termo) : '');
    });

    document.getElementById('form-login').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const erro = document.getElementById('erro-login');
        const email = form.elements['email'].value.trim().toLowerCase();
        const senha = form.elements['senha'].value;

        if (!emailValido(email) || senha === '') {
            erro.textContent = 'Preencha o e-mail e a senha corretamente.';
            return;
        }

        const usuario = listaUsuarios().find(u => u.email === email && u.senha === senha);
        if (!usuario) {
            erro.textContent = 'E-mail ou senha incorretos.';
            return;
        }

        iniciarSessao(email);
        form.reset();
        fecharLogin();
        atualizarConta();
        mostrarAviso('Bem-vindo(a), ' + usuario.nome.split(' ')[0] + '!');
        document.dispatchEvent(new Event('sessaomudou'));
    });
}

aplicarTema(ler('tema', 'escuro'));
montarCabecalho();
montarRodape();
montarModal();
atualizarConta();
atualizarContador();
ligarEventos();
