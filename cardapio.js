const listaProdutos = document.getElementById('lista-produtos');
const campoBusca = document.getElementById('busca-cardapio');
const seletorOrdem = document.getElementById('ordenar');
const textoResultado = document.getElementById('resultado');
const caixaFiltros = document.getElementById('filtros');
let categoriaAtual = 'Todos';

function cardProduto(p) {
    return `
    <div class="card">
        ${p.destaque ? '<span class="etiqueta">HOUSE SPECIAL</span>' : ''}
        <div class="imagem"><img src="${p.imagem}" alt="${escapar(p.nome)}" onerror="this.style.visibility='hidden'"></div>
        <h3 class="nome">${escapar(p.nome)}</h3>
        <p class="preco">${formatarPreco(p.preco)}</p>
        <p class="descricao">${escapar(p.descricao)}</p>
        <button type="button" class="botao botao-pequeno" data-id="${p.id}">ADICIONAR</button>
    </div>`;
}

function desenharFiltros() {
    const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria))];
    caixaFiltros.innerHTML = categorias.map(c =>
        '<button type="button" class="filtro' + (c === categoriaAtual ? ' ativo' : '') + '" data-categoria="' + escapar(c) + '">' + escapar(c.toUpperCase()) + '</button>'
    ).join('');
}

function desenharProdutos() {
    const termo = normalizar(campoBusca.value.trim());

    const itens = produtos.filter(p => {
        const naCategoria = categoriaAtual === 'Todos' || p.categoria === categoriaAtual;
        const noTexto = normalizar(p.nome + ' ' + p.descricao).includes(termo);
        return naCategoria && noTexto;
    });

    if (seletorOrdem.value === 'menor') itens.sort((a, b) => a.preco - b.preco);
    if (seletorOrdem.value === 'maior') itens.sort((a, b) => b.preco - a.preco);
    if (seletorOrdem.value === 'nome') itens.sort((a, b) => a.nome.localeCompare(b.nome));

    if (itens.length === 0) {
        listaProdutos.innerHTML = '<div class="vazio"><p>Nenhum produto encontrado.</p></div>';
    } else {
        listaProdutos.innerHTML = itens.map(cardProduto).join('');
    }

    textoResultado.textContent = itens.length === 1 ? '1 produto encontrado' : itens.length + ' produtos encontrados';
}

caixaFiltros.addEventListener('click', e => {
    const botao = e.target.closest('[data-categoria]');
    if (!botao) return;
    categoriaAtual = botao.dataset.categoria;
    desenharFiltros();
    desenharProdutos();
});

campoBusca.addEventListener('input', desenharProdutos);
seletorOrdem.addEventListener('change', desenharProdutos);

listaProdutos.addEventListener('click', e => {
    const botao = e.target.closest('[data-id]');
    if (!botao) return;
    const produto = buscarProduto(botao.dataset.id);
    if (adicionarAoCarrinho(produto.id, 1)) {
        atualizarContador();
        mostrarAviso(produto.nome + ' adicionado à sacola.');
    } else {
        mostrarAviso('Máximo de ' + MAX_POR_ITEM + ' unidades por item.');
    }
});

const buscaInicial = new URLSearchParams(location.search).get('busca');
if (buscaInicial) campoBusca.value = buscaInicial.slice(0, 40);

desenharFiltros();
desenharProdutos();
