const listaDePedidos = document.getElementById('lista-pedidos');
const campoBuscaPedidos = document.getElementById('busca-pedidos');

function statusPedido(p) {
    const minutos = (Date.now() - new Date(p.data).getTime()) / 60000;
    if (minutos < 2) return { texto: 'EM PREPARO', classe: 'status-preparo' };
    if (minutos < 5) return { texto: 'SAIU PARA ENTREGA', classe: 'status-rota' };
    return { texto: 'ENTREGUE', classe: 'status-entregue' };
}

function cardPedido(p) {
    const status = statusPedido(p);
    const data = new Date(p.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const itens = p.itens.map(i =>
        '<div class="linha-item"><span>' + i.qtd + 'x ' + escapar(i.nome) + '</span><span>' + formatarPreco(i.preco * i.qtd) + '</span></div>'
    ).join('');

    return `
    <article class="pedido">
        <div class="pedido-topo">
            <div>
                <span class="pedido-numero">Pedido #${p.numero}</span>
                <p class="pedido-data">${data}</p>
            </div>
            <span class="status ${status.classe}">${status.texto}</span>
        </div>
        <div class="pedido-corpo">
            ${itens}
            <div class="linha-item"><span>Entrega</span><span>${p.entrega === 0 ? 'Grátis' : formatarPreco(p.entrega)}</span></div>
            <p class="pedido-info">Pagamento: ${escapar(p.pagamento)}</p>
            <p class="pedido-info">Entrega em: ${escapar(p.endereco)}</p>
            ${p.obs ? '<p class="pedido-info">Obs.: ' + escapar(p.obs) + '</p>' : ''}
        </div>
        <div class="pedido-rodape">
            <strong class="pedido-total">Total: ${formatarPreco(p.total)}</strong>
            <button type="button" class="botao botao-pequeno" data-repetir="${p.numero}">PEDIR NOVAMENTE</button>
        </div>
    </article>`;
}

function desenharPedidos() {
    const usuario = usuarioLogado();
    document.getElementById('precisa-login').hidden = !!usuario;
    document.getElementById('conteudo-pedidos').hidden = !usuario;
    if (!usuario) return;

    const todos = pedidosDoUsuario(usuario.email);

    if (todos.length === 0) {
        listaDePedidos.innerHTML = '<div class="vazio"><p>Você ainda não fez nenhum pedido.</p><a href="cardapio.html" class="botao botao-pequeno">VER CARDÁPIO</a></div>';
        return;
    }

    const termo = normalizar(campoBuscaPedidos.value.trim().replace('#', ''));
    const filtrados = todos.filter(p =>
        normalizar(p.numero + ' ' + p.itens.map(i => i.nome).join(' ')).includes(termo)
    );

    if (filtrados.length === 0) {
        listaDePedidos.innerHTML = '<div class="vazio"><p>Nenhum pedido encontrado.</p></div>';
        return;
    }

    listaDePedidos.innerHTML = filtrados.map(cardPedido).join('');
}

listaDePedidos.addEventListener('click', e => {
    const botao = e.target.closest('[data-repetir]');
    if (!botao) return;
    const pedido = listaPedidos().find(p => p.numero === Number(botao.dataset.repetir));
    if (!pedido) return;
    pedido.itens.forEach(i => adicionarAoCarrinho(i.id, i.qtd));
    atualizarContador();
    mostrarAviso('Itens adicionados à sacola.');
    setTimeout(() => {
        location.href = 'sacola.html';
    }, 800);
});

campoBuscaPedidos.addEventListener('input', desenharPedidos);
document.addEventListener('sessaomudou', desenharPedidos);
setInterval(desenharPedidos, 30000);

desenharPedidos();
