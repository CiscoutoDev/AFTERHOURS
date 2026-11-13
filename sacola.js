const itensSacola = document.getElementById('itens-sacola');
const formPedido = document.getElementById('form-pedido');
const campoObs = document.getElementById('obs');

function desenharResumo() {
    const subtotal = subtotalCarrinho();
    const entrega = calcularEntrega(subtotal);

    document.getElementById('subtotal').textContent = formatarPreco(subtotal);
    document.getElementById('entrega').textContent = entrega === 0 ? 'Grátis' : formatarPreco(entrega);
    document.getElementById('total').textContent = formatarPreco(subtotal + entrega);

    const dica = document.getElementById('dica-entrega');
    if (entrega > 0) {
        dica.textContent = 'Faltam ' + formatarPreco(ENTREGA_GRATIS_ACIMA - subtotal) + ' para entrega grátis.';
    } else {
        dica.textContent = 'Você ganhou entrega grátis!';
    }

    const usuario = usuarioLogado();
    const caixa = document.getElementById('endereco-entrega');
    if (usuario) {
        caixa.innerHTML = 'Entrega em:<br>' + escapar(textoEndereco(usuario)) + '<br><a href="perfil.html">Alterar endereço</a>';
    } else {
        caixa.textContent = 'Entre na sua conta para finalizar o pedido.';
    }
}

function desenharItens() {
    const itens = lerCarrinho();
    document.getElementById('conteudo-sacola').hidden = itens.length === 0;
    document.getElementById('sacola-vazia').hidden = itens.length !== 0;
    atualizarContador();

    itensSacola.innerHTML = itens.map(item => {
        const p = buscarProduto(item.id);
        return `
        <div class="item-sacola">
            <div class="miniatura"><img src="${p.imagem}" alt="${escapar(p.nome)}" onerror="this.style.visibility='hidden'"></div>
            <div class="item-info">
                <h3 class="nome">${escapar(p.nome)}</h3>
                <p class="preco-un">${formatarPreco(p.preco)} cada</p>
            </div>
            <div class="item-direita">
                <div class="quantidade">
                    <button type="button" data-menos="${p.id}" aria-label="Diminuir">−</button>
                    <input type="text" inputmode="numeric" maxlength="2" value="${item.qtd}" data-numerico data-qtd="${p.id}" aria-label="Quantidade">
                    <button type="button" data-mais="${p.id}" aria-label="Aumentar">+</button>
                </div>
                <span class="item-subtotal">${formatarPreco(p.preco * item.qtd)}</span>
                <button type="button" class="remover" data-remover="${p.id}">Remover</button>
            </div>
        </div>`;
    }).join('');

    desenharResumo();
}

itensSacola.addEventListener('click', e => {
    const menos = e.target.closest('[data-menos]');
    const mais = e.target.closest('[data-mais]');
    const remover = e.target.closest('[data-remover]');

    if (menos) {
        const id = Number(menos.dataset.menos);
        const item = lerCarrinho().find(i => i.id === id);
        if (item && item.qtd > 1) definirQuantidade(id, item.qtd - 1);
    } else if (mais) {
        const id = Number(mais.dataset.mais);
        const item = lerCarrinho().find(i => i.id === id);
        if (item && item.qtd >= MAX_POR_ITEM) {
            mostrarAviso('Máximo de ' + MAX_POR_ITEM + ' unidades por item.');
        } else if (item) {
            definirQuantidade(id, item.qtd + 1);
        }
    } else if (remover) {
        removerDoCarrinho(remover.dataset.remover);
    } else {
        return;
    }
    desenharItens();
});

itensSacola.addEventListener('change', e => {
    const campo = e.target.closest('[data-qtd]');
    if (!campo) return;
    let qtd = parseInt(campo.value, 10);
    if (isNaN(qtd) || qtd < 1) qtd = 1;
    if (qtd > MAX_POR_ITEM) {
        qtd = MAX_POR_ITEM;
        mostrarAviso('Máximo de ' + MAX_POR_ITEM + ' unidades por item.');
    }
    definirQuantidade(campo.dataset.qtd, qtd);
    desenharItens();
});

campoObs.addEventListener('input', () => {
    document.getElementById('contagem-obs').textContent = campoObs.value.length + '/120';
});

function baixarPedidoJson(pedido, usuario) {
    const dados = {
        codigo_pedido: 'PED-' + pedido.numero,
        nome_cliente: usuario.nome,
        total: pedido.total,
        status: 'Pendente',
        cliente: {
            nome: usuario.nome,
            email: usuario.email,
            endereco: pedido.endereco
        },
        itens: pedido.itens.map(i => ({
            nome: i.nome,
            categoria: buscarProduto(i.id).categoria,
            quantidade: i.qtd,
            preco: i.preco
        }))
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pedido.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function finalizarPedido() {
    const usuario = usuarioLogado();
    if (!usuario) {
        abrirLogin();
        return;
    }

    const itens = lerCarrinho();
    if (itens.length === 0) return;

    const subtotal = subtotalCarrinho();
    const entrega = calcularEntrega(subtotal);
    const numero = ler('contadorPedidos', 1000) + 1;
    salvar('contadorPedidos', numero);

    const pedido = {
        numero: numero,
        email: usuario.email,
        data: new Date().toISOString(),
        itens: itens.map(i => {
            const p = buscarProduto(i.id);
            return { id: p.id, nome: p.nome, preco: p.preco, qtd: i.qtd };
        }),
        subtotal: subtotal,
        entrega: entrega,
        total: arredondar(subtotal + entrega),
        pagamento: formPedido.elements['pagamento'].value,
        obs: campoObs.value.trim(),
        endereco: textoEndereco(usuario)
    };

    const todos = listaPedidos();
    todos.push(pedido);
    salvar('pedidos', todos);

    baixarPedidoJson(pedido, usuario);

    limparCarrinho();
    atualizarContador();
    mostrarAviso('Pedido #' + numero + ' realizado! O arquivo pedido.json foi baixado.');
    setTimeout(() => {
        location.href = 'pedidos.html';
    }, 2000);
}

formPedido.addEventListener('submit', e => {
    e.preventDefault();
    finalizarPedido();
});

document.addEventListener('sessaomudou', desenharResumo);

desenharItens();
