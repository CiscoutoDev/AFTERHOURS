const TAXA_ENTREGA = 7;
const ENTREGA_GRATIS_ACIMA = 100;
const MAX_POR_ITEM = 20;

function ler(chave, padrao) {
    try {
        const texto = localStorage.getItem(chave);
        return texto === null ? padrao : JSON.parse(texto);
    } catch (erro) {
        return padrao;
    }
}

function salvar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {}
}

function escapar(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

function normalizar(texto) {
    return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function buscarProduto(id) {
    return produtos.find(p => p.id === Number(id));
}

function listaUsuarios() {
    return ler('usuarios', []);
}

function usuarioLogado() {
    const email = ler('sessao', null);
    if (!email) return null;
    return listaUsuarios().find(u => u.email === email) || null;
}

function iniciarSessao(email) {
    salvar('sessao', email);
}

function encerrarSessao() {
    try {
        localStorage.removeItem('sessao');
    } catch (erro) {}
}

function textoEndereco(u) {
    let texto = u.rua + ', ' + u.numero;
    if (u.complemento) texto += ' - ' + u.complemento;
    texto += ' - ' + u.bairro + ', ' + u.cidade + '/' + u.uf + ' - CEP ' + u.cep;
    return texto;
}

function lerCarrinho() {
    return ler('carrinho', []).filter(i => buscarProduto(i.id));
}

function adicionarAoCarrinho(id, qtd) {
    if (!buscarProduto(id)) return false;
    const itens = lerCarrinho();
    const item = itens.find(i => i.id === Number(id));
    if (item) {
        if (item.qtd >= MAX_POR_ITEM) return false;
        item.qtd = Math.min(item.qtd + qtd, MAX_POR_ITEM);
    } else {
        itens.push({ id: Number(id), qtd: Math.min(qtd, MAX_POR_ITEM) });
    }
    salvar('carrinho', itens);
    return true;
}

function definirQuantidade(id, qtd) {
    const itens = lerCarrinho();
    const item = itens.find(i => i.id === Number(id));
    if (item) item.qtd = Math.max(1, Math.min(qtd, MAX_POR_ITEM));
    salvar('carrinho', itens);
}

function removerDoCarrinho(id) {
    salvar('carrinho', lerCarrinho().filter(i => i.id !== Number(id)));
}

function limparCarrinho() {
    salvar('carrinho', []);
}

function totalItens() {
    return lerCarrinho().reduce((soma, i) => soma + i.qtd, 0);
}

function subtotalCarrinho() {
    return arredondar(lerCarrinho().reduce((soma, i) => soma + buscarProduto(i.id).preco * i.qtd, 0));
}

function calcularEntrega(subtotal) {
    if (subtotal === 0 || subtotal >= ENTREGA_GRATIS_ACIMA) return 0;
    return TAXA_ENTREGA;
}

function listaPedidos() {
    return ler('pedidos', []);
}

function pedidosDoUsuario(email) {
    return listaPedidos().filter(p => p.email === email).reverse();
}
