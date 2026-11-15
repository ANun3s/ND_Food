import { apiRequest, entityPath, loadAdminData } from '../services/adminApi.js';

const SESSION_KEY = 'nd-food-admin-demo-session';
const pages = {
  resumo: { label: 'Visão geral', eyebrow: 'SUA OPERAÇÃO EM UM SÓ LUGAR', title: 'Bom dia, equipe.', description: 'Acompanhe o que está acontecendo e mantenha cada sabor no caminho certo.' },
  produtos: { label: 'Produtos', eyebrow: 'CARDÁPIO E DISPONIBILIDADE', title: 'Produtos', description: 'Organize os pratos que aparecem no cardápio da ND Food.' },
  pedidos: { label: 'Pedidos', eyebrow: 'ACOMPANHAMENTO DE PEDIDOS', title: 'Pedidos', description: 'Consulte os pedidos e atualize cada etapa.' },
  enderecos: { label: 'Endereços', eyebrow: 'DESTINOS DE ENTREGA', title: 'Endereços', description: 'Mantenha os endereços organizados.' },
  entregas: { label: 'Entregas', eyebrow: 'ÚLTIMA ETAPA DO PEDIDO', title: 'Entregas', description: 'Acompanhe responsáveis, regiões e previsões.' },
};
const pageEntities = { produtos: 'products', pedidos: 'orders', enderecos: 'addresses', entregas: 'deliveries' };
const orderStatuses = ['Pendente', 'Confirmado', 'Em preparação', 'Enviado', 'Entregue', 'Cancelado'];
const deliveryStatuses = ['Aguardando confirmação', 'Aguardando coleta', 'Preparando pedido', 'Saiu para entrega', 'Em trânsito', 'Entregue', 'Cancelada'];
const addressFields = ['cliente', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'referencia'];
let sessionOpen = false;
let adminData = null;
let renderSequence = 0;

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const currency = (value) => 'R$ ' + Number(value || 0).toFixed(2).replace('.', ',');
const readSession = () => {
  try { return sessionOpen || sessionStorage.getItem(SESSION_KEY) === 'open'; } catch { return sessionOpen; }
};
const currentPage = () => {
  const page = location.hash.replace(/^#\/admin\/?/, '').split('/')[0];
  return pages[page] ? page : 'resumo';
};
const newId = (prefix) => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2, 9)).toUpperCase();
const cents = (value) => Math.round(Number(value) * 100);
const dateToIso = (value) => value ? new Date(value).toISOString() : null;
const dateToInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const displayDate = (value) => {
  if (!value) return 'A combinar';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'A combinar' : date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};
const addressSummary = (address) => address
  ? [[address.rua, address.numero, address.complemento].filter(Boolean).join(', '), address.bairro, address.cidade + ' · ' + address.estado].filter(Boolean).join(' · ')
  : 'Endereço não informado';
const statusFromDelivery = (status) => ({
  'Aguardando confirmação': 'Pendente', 'Aguardando coleta': 'Confirmado', 'Preparando pedido': 'Em preparação',
  'Saiu para entrega': 'Enviado', 'Em trânsito': 'Enviado', 'Entregue': 'Entregue', 'Cancelada': 'Cancelado',
}[status] || 'Pendente');
const statusForDelivery = (status) => ({
  'Pendente': 'Aguardando confirmação', 'Confirmado': 'Aguardando coleta', 'Em preparação': 'Preparando pedido',
  'Enviado': 'Saiu para entrega', 'Entregue': 'Entregue', 'Cancelado': 'Cancelada',
}[status] || 'Aguardando confirmação');

function shapeData(raw) {
  const productsById = new Map(raw.products.map((item) => [item.id, item]));
  const addressesById = new Map(raw.addresses.map((item) => [item.id, item]));
  const products = raw.products.map((item) => ({ ...item, name: item.nome, description: item.descricao, price: item.preco, stock: item.estoque, image: item.imagem, status: item.disponivel ? 'Disponível' : 'Indisponível' }));
  const addresses = raw.addresses.map((item) => ({ ...item, customer: item.cliente, street: [item.rua, item.numero, item.complemento].filter(Boolean).join(', '), district: item.bairro, city: item.cidade + ' · ' + item.estado }));
  const orders = raw.orders.map((item) => ({
    ...item,
    customer: item.cliente,
    items: item.produtos.map((line) => (productsById.get(line.produtoId)?.nome || 'Produto removido') + ' × ' + line.quantidade).join(', '),
    address: addressSummary(addressesById.get(item.enderecoId)),
  }));
  const deliveries = raw.deliveries.map((item) => ({
    ...item,
    orderId: item.pedidoId,
    courier: item.transportadora,
    status: item.statusEntrega,
    eta: displayDate(item.previsaoEntrega),
    area: addressesById.get(item.enderecoId)?.bairro || 'Região não informada',
  }));
  return { products, orders, addresses, deliveries };
}

function badgeClass(value) {
  const status = String(value).toLocaleLowerCase('pt-BR');
  if (status.includes('entregue') || status.includes('disponível')) return 'is-good';
  if (status.includes('confirmado') || status.includes('caminho') || status.includes('trânsito') || status.includes('prepar') || status.includes('coleta')) return 'is-progress';
  if (status.includes('indisponível') || status.includes('cancel')) return 'is-muted';
  return 'is-pending';
}

function renderLogin(root) {
  root.innerHTML = `
    <main class="nd-admin-login" aria-labelledby="admin-login-title">
      <a class="nd-admin-login__back" href="#/">← Voltar para a ND Food</a>
      <section class="nd-admin-login__card">
        <a class="nd-admin-brand" href="#/" aria-label="ND Food, página inicial"><span class="nd-admin-brand__mark">n.</span><span>ND<small>Food.</small></span></a>
        <p class="nd-admin-eyebrow">ÁREA DA EQUIPE</p><h1 id="admin-login-title">Entre no painel.</h1>
        <p class="nd-admin-login__intro">Acesse a demonstração de gestão para explorar produtos, pedidos, endereços e entregas.</p>
        <div class="nd-admin-demo-note"><span aria-hidden="true">✦</span><p>Este painel é demonstrativo. Qualquer e-mail e senha abrem os dados da API local.</p></div>
        <form class="nd-admin-login__form" data-admin-login>
          <label>E-mail<input type="email" name="email" autocomplete="username" placeholder="equipe@ndfood.com.br" required /></label>
          <label>Senha<input type="password" name="password" autocomplete="current-password" placeholder="Digite sua senha" required /></label>
          <p class="nd-admin-feedback" data-login-feedback role="alert" hidden></p>
          <button class="nd-admin-primary" type="submit">Entrar na demonstração <span aria-hidden="true">→</span></button>
        </form>
        <p class="nd-admin-login__footnote">Acesso demonstrativo, sem autenticação ou operação real.</p>
      </section>
      <aside class="nd-admin-login__story"><div class="nd-admin-login__story-mark">ND FOOD <span>·</span> GESTÃO</div><div><p>BOA COMIDA.<br />BONS FLUXOS.</p><span>Um painel claro para cada etapa do pedido.</span></div><span class="nd-admin-login__story-badge">FEITO PARA A EQUIPE <b>✦</b></span></aside>
    </main>`;
}

function navMarkup(current, data) {
  return Object.entries(pages).map(([key, page]) => `
    <a class="nd-admin-nav__link${current === key ? ' is-active' : ''}" href="#/admin/${key}"${current === key ? ' aria-current="page"' : ''}>
      <span class="nd-admin-nav__icon" aria-hidden="true">${{ resumo: '⌂', produtos: '◈', pedidos: '▤', enderecos: '⌖', entregas: '↗' }[key]}</span>
      <span>${page.label}</span>${key === 'pedidos' ? '<b>' + data.orders.length + '</b>' : ''}
    </a>`).join('');
}

function renderStats(data) {
  const activeOrders = data.orders.filter((item) => item.status !== 'Entregue' && item.status !== 'Cancelado').length;
  const activeDeliveries = data.deliveries.filter((item) => item.statusEntrega !== 'Entregue' && item.statusEntrega !== 'Cancelada').length;
  return `
    <section class="nd-admin-stats" aria-label="Resumo dos dados da API">
      <article class="nd-admin-stat"><span class="nd-admin-stat__icon">▤</span><div><span>Pedidos ativos</span><strong>${activeOrders}</strong><small>em andamento</small></div><span class="nd-admin-stat__trend">agora</span></article>
      <article class="nd-admin-stat"><span class="nd-admin-stat__icon nd-admin-stat__icon--peach">◈</span><div><span>Produtos ativos</span><strong>${data.products.filter((item) => item.disponivel && item.estoque > 0).length}</strong><small>no cardápio</small></div><span class="nd-admin-stat__trend">catálogo</span></article>
      <article class="nd-admin-stat"><span class="nd-admin-stat__icon nd-admin-stat__icon--green">↗</span><div><span>Entregas abertas</span><strong>${activeDeliveries}</strong><small>a caminho da porta</small></div><span class="nd-admin-stat__trend">agora</span></article>
      <article class="nd-admin-stat"><span class="nd-admin-stat__icon nd-admin-stat__icon--gold">⌖</span><div><span>Endereços salvos</span><strong>${data.addresses.length}</strong><small>na demonstração</small></div><span class="nd-admin-stat__trend">locais</span></article>
    </section>`;
}

function renderProducts(data) {
  const rows = data.products.map((item) => `
    <tr data-searchable="${escapeHTML((item.nome + ' ' + item.categoria).toLocaleLowerCase('pt-BR'))}">
      <td><div class="nd-admin-product"><img src="${escapeHTML(item.imagem || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=160&q=75')}" alt="" loading="lazy" /><div><strong>${escapeHTML(item.nome)}</strong><span>${escapeHTML(item.descricao)}</span></div></div></td>
      <td>${escapeHTML(item.categoria)}</td><td class="nd-admin-number">${item.estoque}</td><td class="nd-admin-number">${currency(item.preco)}</td>
      <td><span class="nd-admin-badge ${badgeClass(item.disponivel ? 'Disponível' : 'Indisponível')}"><i></i>${item.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
      <td><div class="nd-admin-actions"><button type="button" data-edit="products" data-id="${escapeHTML(item.id)}" aria-label="Editar ${escapeHTML(item.nome)}">Editar</button><button type="button" data-delete="products" data-id="${escapeHTML(item.id)}" aria-label="Excluir ${escapeHTML(item.nome)}">Excluir</button></div></td>
    </tr>`).join('');
  return '<div class="nd-admin-table-wrap"><table class="nd-admin-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Disponibilidade</th><th><span class="nd-admin-visually-hidden">Ações</span></th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="nd-admin-empty">Nenhum produto cadastrado.</td></tr>') + '</tbody></table></div>';
}

function renderOrders(data) {
  const rows = data.orders.map((item) => `
    <tr data-searchable="${escapeHTML((item.id + ' ' + item.cliente + ' ' + item.items + ' ' + item.address).toLocaleLowerCase('pt-BR'))}">
      <td><div class="nd-admin-order-id"><strong>${escapeHTML(item.id)}</strong><span>${escapeHTML(displayDate(item.dataPedido))}</span></div></td>
      <td><strong>${escapeHTML(item.cliente)}</strong><span class="nd-admin-cell-subtitle">${escapeHTML(item.address)}</span></td>
      <td>${escapeHTML(item.items || 'Nenhum produto')}</td><td class="nd-admin-number">${currency(item.valorTotal)}</td>
      <td><span class="nd-admin-badge ${badgeClass(item.status)}"><i></i>${escapeHTML(item.status)}</span></td>
      <td><div class="nd-admin-actions"><button type="button" data-edit="orders" data-id="${escapeHTML(item.id)}" aria-label="Editar pedido ${escapeHTML(item.id)}">Editar</button><button type="button" data-delete="orders" data-id="${escapeHTML(item.id)}" aria-label="Excluir pedido ${escapeHTML(item.id)}">Excluir</button></div></td>
    </tr>`).join('');
  return '<div class="nd-admin-table-wrap"><table class="nd-admin-table"><thead><tr><th>Pedido</th><th>Cliente e destino</th><th>Itens</th><th>Total</th><th>Status</th><th><span class="nd-admin-visually-hidden">Ações</span></th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="nd-admin-empty">Nenhum pedido cadastrado.</td></tr>') + '</tbody></table></div>';
}

function renderAddresses(data) {
  const cards = data.addresses.map((item) => `
    <article class="nd-admin-address-card" data-searchable="${escapeHTML((item.cliente + ' ' + item.rua + ' ' + item.bairro + ' ' + item.cidade).toLocaleLowerCase('pt-BR'))}">
      <div class="nd-admin-address-card__top"><span class="nd-admin-address-icon">⌖</span><span class="nd-admin-badge is-good"><i></i>${escapeHTML(item.cep)}</span></div>
      <p class="nd-admin-address-card__label">${escapeHTML(item.cliente)} · ${escapeHTML(item.cidade)} / ${escapeHTML(item.estado)}</p>
      <h3>${escapeHTML([item.rua, item.numero, item.complemento].filter(Boolean).join(', '))}</h3><p>${escapeHTML(item.bairro)}<br />${escapeHTML(item.cidade)} · ${escapeHTML(item.estado)}</p>
      <div class="nd-admin-address-card__bottom"><span>Referência: ${escapeHTML(item.referencia || 'Não informada')}</span><div class="nd-admin-actions"><button type="button" data-edit="addresses" data-id="${escapeHTML(item.id)}">Editar</button><button type="button" data-delete="addresses" data-id="${escapeHTML(item.id)}">Excluir</button></div></div>
    </article>`).join('');
  return '<div class="nd-admin-address-grid">' + (cards || '<p class="nd-admin-empty-card">Nenhum endereço cadastrado.</p>') + '</div>';
}

function renderDeliveries(data) {
  const rows = data.deliveries.map((item) => `
    <tr data-searchable="${escapeHTML((item.id + ' ' + item.pedidoId + ' ' + item.transportadora + ' ' + item.codigoRastreamento + ' ' + item.area).toLocaleLowerCase('pt-BR'))}">
      <td><div class="nd-admin-order-id"><strong>${escapeHTML(item.id)}</strong><span>Pedido ${escapeHTML(item.pedidoId)}</span></div></td>
      <td><strong>${escapeHTML(item.transportadora || 'A definir')}</strong><span class="nd-admin-cell-subtitle">${escapeHTML(item.codigoRastreamento || item.area)}</span></td>
      <td>${escapeHTML(displayDate(item.previsaoEntrega))}</td><td><span class="nd-admin-badge ${badgeClass(item.statusEntrega)}"><i></i>${escapeHTML(item.statusEntrega)}</span></td>
      <td><div class="nd-admin-actions"><button type="button" data-edit="deliveries" data-id="${escapeHTML(item.id)}">Editar</button><button type="button" data-delete="deliveries" data-id="${escapeHTML(item.id)}">Excluir</button></div></td>
    </tr>`).join('');
  return '<div class="nd-admin-table-wrap"><table class="nd-admin-table"><thead><tr><th>Entrega</th><th>Transportadora e código</th><th>Previsão</th><th>Status</th><th><span class="nd-admin-visually-hidden">Ações</span></th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="nd-admin-empty">Nenhuma entrega cadastrada.</td></tr>') + '</tbody></table></div>';
}

function renderActivity(data) {
  return '<section class="nd-admin-panel nd-admin-activity"><div class="nd-admin-panel__heading"><div><p class="nd-admin-eyebrow">ACOMPANHAMENTO</p><h2>Pedidos recentes</h2></div><a href="#/admin/pedidos">Ver todos <span aria-hidden="true">→</span></a></div>' + renderOrders({ orders: data.orders.slice(0, 4) }) + '</section>';
}

function renderContent(page, data) {
  if (page === 'produtos') return renderProducts(data);
  if (page === 'pedidos') return renderOrders(data);
  if (page === 'enderecos') return renderAddresses(data);
  return renderDeliveries(data);
}

function renderDashboard(root, data) {
  const current = currentPage();
  const page = pages[current];
  const overview = current === 'resumo';
  const entity = pageEntities[current];
  const content = overview
    ? renderStats(data) + '<div class="nd-admin-overview-grid"><section class="nd-admin-panel nd-admin-welcome"><div><p class="nd-admin-eyebrow">ND FOOD · PAINEL DE GESTÃO</p><h2>Sabores em movimento.</h2><p>Seu resumo está pronto. Atualize o cardápio ou acompanhe os pedidos.</p><a class="nd-admin-primary nd-admin-primary--inline" href="#/admin/pedidos">Acompanhar pedidos <span aria-hidden="true">→</span></a></div><span class="nd-admin-welcome__glyph" aria-hidden="true">✦</span></section><section class="nd-admin-panel nd-admin-quick"><div class="nd-admin-panel__heading"><div><p class="nd-admin-eyebrow">ATALHOS</p><h2>O que vamos fazer?</h2></div></div><a href="#/admin/produtos"><span>◈</span><div><strong>Gerenciar cardápio</strong><small>Editar produtos e disponibilidade</small></div><b>→</b></a><a href="#/admin/entregas"><span>↗</span><div><strong>Ver entregas</strong><small>Acompanhar previsões</small></div><b>→</b></a></section></div>' + renderActivity(data)
    : renderContent(current, data);
  root.innerHTML = `
    <div class="nd-admin-shell">
      <aside class="nd-admin-sidebar" aria-label="Navegação do painel"><a class="nd-admin-brand" href="#/" aria-label="ND Food, voltar ao site"><span class="nd-admin-brand__mark">n.</span><span>ND<small>Food.</small></span></a><p class="nd-admin-sidebar__label">GESTÃO DO DELIVERY</p><nav class="nd-admin-nav">${navMarkup(current, data)}</nav><div class="nd-admin-sidebar__bottom"><div class="nd-admin-profile"><span>ND</span><div><strong>Equipe ND Food</strong><small>Conta demonstrativa</small></div></div><button class="nd-admin-logout" type="button" data-admin-logout>↪ <span>Sair do painel</span></button></div></aside>
      <main class="nd-admin-main" aria-labelledby="admin-page-title">
        <header class="nd-admin-topbar"><div class="nd-admin-breadcrumb"><a href="#/">ND Food</a><span>/</span><span>Painel</span><span>/</span><strong>${page.label}</strong></div><div class="nd-admin-topbar__actions"><span class="nd-admin-demo-pill"><i></i> API local</span><button class="nd-admin-theme" type="button" data-theme-toggle aria-label="Alternar tema" title="Alternar tema">◐</button><button class="nd-admin-mobile-logout" type="button" data-admin-logout>Sair</button><span class="nd-admin-avatar" aria-label="Equipe ND Food">ND</span></div></header>
        <div class="nd-admin-content">
          <header class="nd-admin-page-heading"><div><p class="nd-admin-eyebrow">${page.eyebrow}</p><h1 id="admin-page-title">${page.title}</h1><p>${page.description}</p></div>${!overview ? '<button class="nd-admin-primary" type="button" data-create="' + entity + '">+ <span>' + ({ produtos: 'Novo produto', pedidos: 'Novo pedido', enderecos: 'Novo endereço', entregas: 'Nova entrega' }[current]) + '</span></button>' : ''}</header>
          <div class="nd-admin-demo-banner"><span aria-hidden="true">i</span><p>Ambiente escolar de demonstração · dados lidos e gravados no JSON Server local.</p><a href="#/">Voltar ao site</a></div>
          ${overview ? content : '<section class="nd-admin-panel nd-admin-list-panel"><div class="nd-admin-list-toolbar"><label class="nd-admin-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar ' + page.label.toLocaleLowerCase('pt-BR') + '..." aria-label="Buscar ' + page.label.toLocaleLowerCase('pt-BR') + '" data-admin-search /><kbd>⌘ K</kbd></label><span class="nd-admin-record-count">' + data[entity].length + ' ' + (data[entity].length === 1 ? 'registro' : 'registros') + '</span></div>' + content + '</section>'}
          <footer class="nd-admin-footer"><span>ND Food · Painel de gestão</span><span>Projeto demonstrativo · ${new Date().getFullYear()}</span></footer>
        </div>
      </main>
    </div><div class="nd-admin-toast" role="status" aria-live="polite" hidden></div>`;
}

function optionsMarkup(options, selected) {
  return options.map((option) => {
    const value = typeof option === 'string' ? option : option.value;
    const label = typeof option === 'string' ? option : option.label;
    return '<option value="' + escapeHTML(value) + '"' + (String(selected ?? '') === String(value) ? ' selected' : '') + '>' + escapeHTML(label) + '</option>';
  }).join('');
}

function itemRow(line, data) {
  const selected = line?.produtoId;
  const options = data.products.filter((item) => item.disponivel || item.id === selected)
    .map((item) => ({ value: item.id, label: item.nome + ' · ' + currency(item.preco) + (item.estoque > 0 ? '' : ' · sem estoque') }));
  return `<div class="nd-admin-form-row nd-admin-order-item" data-order-item><label>Produto<select name="produtoId" required>${optionsMarkup(options, selected || options[0]?.value)}</select></label><label>Quantidade<input type="number" name="quantidade" min="1" step="1" value="${escapeHTML(line?.quantidade || 1)}" required /></label><button class="nd-admin-secondary nd-admin-order-item__remove" type="button" data-order-item-remove aria-label="Remover produto">×</button></div>`;
}

function editorFields(entity, item, data) {
  const value = (key) => escapeHTML(item?.[key] ?? '');
  const field = (label, name, placeholder, type = 'text', required = true, attrs = '') => '<label>' + label + '<input type="' + type + '" name="' + name + '" value="' + value(name) + '" placeholder="' + placeholder + '"' + (required ? ' required' : '') + ' ' + attrs + ' /></label>';
  const area = (label, name, placeholder) => '<label>' + label + '<textarea name="' + name + '" rows="3" placeholder="' + placeholder + '">' + value(name) + '</textarea></label>';
  const select = (label, name, options) => '<label>' + label + '<select name="' + name + '" required>' + optionsMarkup(options, item?.[name]) + '</select></label>';
  if (entity === 'products') return field('Nome do produto', 'nome', 'Ex.: Smash da casa') + select('Categoria', 'categoria', ['Hambúrgueres', 'Pizzas', 'Japonesa', 'Açaí', 'Sobremesas', 'Bebidas', 'Massas', 'Saladas', 'Acompanhamentos', 'Sanduíches', 'Brasileira', 'Pães']) + '<div class="nd-admin-form-row">' + field('Preço', 'preco', '29,90', 'number', true, 'min="0.01" step="0.01"') + field('Estoque', 'estoque', '10', 'number', true, 'min="0" step="1"') + '</div>' + area('Descrição', 'descricao', 'Conte o que torna este prato especial.') + field('URL da imagem', 'imagem', 'https://...', 'url', false) + select('Disponibilidade', 'disponivel', [{ value: 'true', label: 'Disponível' }, { value: 'false', label: 'Indisponível' }]);
  if (entity === 'orders') {
    const addressOptions = data.addresses.map((address) => ({ value: address.id, label: address.cliente + ' · ' + addressSummary(address) }));
    const lines = item?.produtos?.length ? item.produtos : [{ produtoId: data.products.find((product) => product.disponivel && product.estoque > 0)?.id, quantidade: 1 }];
    return field('Cliente', 'cliente', 'Nome do cliente') + select('Endereço de entrega', 'enderecoId', addressOptions) + '<div class="nd-admin-order-items" data-order-items>' + lines.map((line) => itemRow(line, data)).join('') + '</div><button class="nd-admin-secondary nd-admin-order-item__add" type="button" data-order-item-add>+ Adicionar produto</button><p class="nd-admin-order-total" data-order-total></p>' + select('Status', 'status', orderStatuses);
  }
  if (entity === 'addresses') return field('Cliente', 'cliente', 'Nome do cliente') + field('CEP', 'cep', '00000-000', 'text', true, 'inputmode="numeric" pattern="[0-9]{5}-?[0-9]{3}"') + field('Rua', 'rua', 'Nome da rua') + field('Número', 'numero', 'Número ou s/n') + field('Complemento', 'complemento', 'Apartamento, casa...', 'text', false) + '<div class="nd-admin-form-row">' + field('Bairro', 'bairro', 'Bairro') + field('Cidade', 'cidade', 'Cidade') + '</div><div class="nd-admin-form-row">' + field('Estado', 'estado', 'UF', 'text', true, 'maxlength="2"') + field('Referência', 'referencia', 'Ponto de referência', 'text', false) + '</div>';
  const linkedOrder = data.orders.find((order) => order.id === item?.pedidoId);
  const availableOrders = data.orders.map((order) => {
    const linkedDelivery = data.deliveries.find((delivery) => delivery.id === order.entregaId);
    return { value: order.id, label: order.id + ' · ' + order.cliente + (linkedDelivery ? ' · substituir ' + linkedDelivery.id : ' · sem entrega') };
  });
  const orderControl = item
    ? '<input type="hidden" name="pedidoId" value="' + escapeHTML(item.pedidoId) + '" /><div class="nd-admin-linked-order"><span>Pedido relacionado</span><strong>' + escapeHTML(linkedOrder?.id || item.pedidoId) + ' · ' + escapeHTML(linkedOrder?.cliente || '') + '</strong><small>O endereço acompanha o pedido.</small></div>'
    : select('Pedido relacionado', 'pedidoId', availableOrders);
  const dateField = (label, name) => '<label>' + label + '<input type="datetime-local" name="' + name + '" value="' + escapeHTML(dateToInput(item?.[name])) + '" /></label>';
  return orderControl + field('Transportadora', 'transportadora', 'Ex.: Motoboy ND Food') + field('Código de rastreamento', 'codigoRastreamento', 'Ex.: ND-RAST-001', 'text', false) + '<div class="nd-admin-form-row">' + select('Tipo de entrega', 'tipoEntrega', ['Padrão', 'Expressa', 'Agendada']) + field('Valor do frete', 'valorFrete', '0,00', 'number', true, 'min="0" step="0.01"') + '</div>' + select('Status da entrega', 'statusEntrega', deliveryStatuses) + '<div class="nd-admin-form-row">' + dateField('Data de envio', 'dataEnvio') + dateField('Previsão de entrega', 'previsaoEntrega') + '</div>' + dateField('Data de entrega', 'dataEntrega');
}

function openEditor(entity, id = '') {
  const root = document.querySelector('#nd-admin-root');
  const data = adminData;
  if (!root || !data) return;
  const item = id ? data[entity].find((record) => record.id === id) : null;
  const labels = { products: 'produto', orders: 'pedido', addresses: 'endereço', deliveries: 'entrega' };
  if (!labels[entity]) return;
  if (entity === 'orders' && (!data.products.some((product) => product.disponivel && product.estoque > 0) || !data.addresses.length)) return toast('Cadastre um produto disponível com estoque e um endereço antes do pedido.');
  if (entity === 'deliveries' && !item && !data.orders.length) return toast('Cadastre um pedido antes de criar uma entrega.');
  const dialog = document.createElement('dialog');
  dialog.className = 'nd-admin-dialog';
  dialog.innerHTML = '<form method="dialog" class="nd-admin-dialog__dismiss"><button type="submit" aria-label="Fechar">×</button></form><div class="nd-admin-dialog__heading"><p class="nd-admin-eyebrow">' + (item ? 'ATUALIZE OS DETALHES' : 'NOVO REGISTRO') + '</p><h2>' + (item ? 'Editar' : 'Adicionar') + ' ' + labels[entity] + '</h2><p>As alterações serão gravadas no JSON Server local.</p></div><form class="nd-admin-editor" data-admin-editor data-entity="' + entity + '" data-id="' + escapeHTML(item?.id || '') + '">' + editorFields(entity, item, data) + '<p class="nd-admin-feedback" data-editor-feedback role="alert" hidden></p><div class="nd-admin-dialog__actions"><button type="button" class="nd-admin-secondary" data-dialog-close>Cancelar</button><button class="nd-admin-primary" type="submit">Salvar ' + labels[entity] + ' <span aria-hidden="true">→</span></button></div></form>';
  root.append(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.showModal();
  if (entity === 'orders') updateOrderTotal(dialog);
}

function toast(message) {
  const element = document.querySelector('.nd-admin-toast');
  if (!element) return;
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.hidden = true; }, 3200);
}

function updateOrderTotal(dialog) {
  if (!dialog || !adminData) return;
  const total = [...dialog.querySelectorAll('[data-order-item]')].reduce((sum, row) => {
    const product = adminData.products.find((item) => item.id === row.querySelector('[name="produtoId"]')?.value);
    const quantity = Number(row.querySelector('[name="quantidade"]')?.value || 0);
    return sum + (product && Number.isInteger(quantity) && quantity > 0 ? cents(product.preco) * quantity : 0);
  }, 0);
  const output = dialog.querySelector('[data-order-total]');
  if (output) output.textContent = 'Total dos produtos: ' + currency(total / 100) + ' · calculado pelo catálogo';
}

function orderPayload(order) {
  return { id: order.id, cliente: order.cliente, produtos: order.produtos, valorTotal: order.valorTotal, enderecoId: order.enderecoId, entregaId: order.entregaId || null, status: order.status, dataPedido: order.dataPedido };
}

function deliveryPayload(delivery) {
  return {
    id: delivery.id,
    pedidoId: delivery.pedidoId,
    enderecoId: delivery.enderecoId,
    transportadora: delivery.transportadora,
    codigoRastreamento: delivery.codigoRastreamento,
    tipoEntrega: delivery.tipoEntrega,
    valorFrete: delivery.valorFrete,
    statusEntrega: delivery.statusEntrega,
    dataEnvio: delivery.dataEnvio,
    previsaoEntrega: delivery.previsaoEntrega,
    dataEntrega: delivery.dataEntrega,
  };
}

async function saveProduct(form, id) {
  const values = new FormData(form);
  const payload = {
    id: id || newId('PR'),
    nome: String(values.get('nome') || '').trim(),
    descricao: String(values.get('descricao') || '').trim(),
    categoria: String(values.get('categoria') || ''),
    preco: Number(values.get('preco')),
    estoque: Number(values.get('estoque')),
    imagem: String(values.get('imagem') || '').trim(),
    disponivel: values.get('disponivel') === 'true',
  };
  if (!payload.nome || !Number.isFinite(payload.preco) || payload.preco <= 0 || !Number.isInteger(payload.estoque) || payload.estoque < 0) throw new Error('Confira nome, preço e estoque do produto.');
  const reserved = adminData.orders.filter((order) => order.status !== 'Cancelado').reduce((sum, order) => sum + order.produtos.filter((line) => line.produtoId === payload.id).reduce((amount, line) => amount + line.quantidade, 0), 0);
  if (payload.estoque < reserved) throw new Error('O estoque não pode ficar abaixo das quantidades já registradas nos pedidos.');
  await apiRequest(entityPath('products', id ? payload.id : undefined), { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
}

async function saveAddress(form, id) {
  const values = new FormData(form);
  const payload = Object.fromEntries(addressFields.map((key) => [key, String(values.get(key) || '').trim()]));
  payload.id = id || newId('END');
  payload.estado = payload.estado.toUpperCase();
  if (!payload.cliente || !payload.cep || !payload.rua || !payload.numero || !payload.bairro || !payload.cidade || !payload.estado) throw new Error('Preencha os campos obrigatórios do endereço.');
  if (!/^\d{5}-?\d{3}$/.test(payload.cep)) throw new Error('Informe um CEP no formato 00000-000.');
  await apiRequest(entityPath('addresses', id ? payload.id : undefined), { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
}

async function saveOrder(form, id) {
  const values = new FormData(form);
  const current = adminData.orders.find((item) => item.id === id);
  const cliente = String(values.get('cliente') || '').trim();
  const enderecoId = String(values.get('enderecoId') || '');
  if (!cliente) throw new Error('Informe o nome do cliente.');
  if (!adminData.addresses.some((item) => item.id === enderecoId)) throw new Error('Selecione um endereço existente.');
  const grouped = new Map();
  for (const row of form.querySelectorAll('[data-order-item]')) {
    const produtoId = row.querySelector('[name="produtoId"]').value;
    const quantidade = Number(row.querySelector('[name="quantidade"]').value);
    if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('A quantidade deve ser um inteiro maior que zero.');
    grouped.set(produtoId, (grouped.get(produtoId) || 0) + quantidade);
  }
  if (!grouped.size) throw new Error('Inclua ao menos um produto.');
  const status = String(values.get('status') || 'Pendente');
  const produtos = [];
  let valorEmCentavos = 0;
  for (const [produtoId, quantidade] of grouped) {
    const product = adminData.products.find((item) => item.id === produtoId);
    if (!product) throw new Error('Um produto selecionado não existe mais.');
    const existing = current?.produtos.some((line) => line.produtoId === produtoId);
    if (!product.disponivel && !existing) throw new Error(product.nome + ' está indisponível.');
    const reserved = adminData.orders.filter((order) => order.id !== id && order.status !== 'Cancelado').reduce((sum, order) => sum + order.produtos.filter((line) => line.produtoId === produtoId).reduce((amount, line) => amount + line.quantidade, 0), 0);
    if (status !== 'Cancelado' && quantidade + reserved > product.estoque) throw new Error('Estoque insuficiente para ' + product.nome + '.');
    produtos.push({ produtoId, quantidade, precoUnitario: product.preco });
    valorEmCentavos += cents(product.preco) * quantidade;
  }
  const payload = { id: id || newId('PED'), cliente, produtos, valorTotal: valorEmCentavos / 100, enderecoId, entregaId: current?.entregaId || null, status, dataPedido: current?.dataPedido || new Date().toISOString() };
  if (!id) {
    const deliveryId = newId('DEL');
    const now = new Date().toISOString();
    const shipped = status === 'Enviado' || status === 'Entregue';
    const delivery = {
      id: deliveryId,
      pedidoId: payload.id,
      enderecoId,
      transportadora: 'Motoboy ND Food',
      codigoRastreamento: newId('ND-RAST'),
      tipoEntrega: 'Padrão',
      valorFrete: 0,
      statusEntrega: statusForDelivery(status),
      dataEnvio: shipped ? now : null,
      previsaoEntrega: null,
      dataEntrega: status === 'Entregue' ? now : null,
    };
    payload.entregaId = deliveryId;
    await apiRequest(entityPath('deliveries'), { method: 'POST', body: JSON.stringify(delivery) });
    try {
      await apiRequest(entityPath('orders'), { method: 'POST', body: JSON.stringify(payload) });
    } catch (error) {
      try { await apiRequest(entityPath('deliveries', deliveryId), { method: 'DELETE' }); } catch {}
      throw error;
    }
    return;
  }
  const delivery = adminData.deliveries.find((item) => item.id === current?.entregaId || item.pedidoId === id);
  await apiRequest(entityPath('orders', id ? payload.id : undefined), { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
  if (delivery) {
    const now = new Date().toISOString();
    const shipped = status === 'Enviado' || status === 'Entregue';
    const updatedDelivery = {
      ...deliveryPayload(delivery),
      enderecoId,
      statusEntrega: statusForDelivery(status),
      dataEnvio: shipped ? delivery.dataEnvio || now : null,
      dataEntrega: status === 'Entregue' ? delivery.dataEntrega || now : null,
    };
    try {
      await apiRequest(entityPath('deliveries', delivery.id), { method: 'PATCH', body: JSON.stringify(updatedDelivery) });
    } catch (error) {
      try { await apiRequest(entityPath('orders', payload.id), { method: 'PATCH', body: JSON.stringify(orderPayload(current)) }); } catch {}
      throw new Error('O pedido foi revertido porque a entrega vinculada não pôde ser atualizada: ' + error.message);
    }
  }
}

async function saveDelivery(form, id) {
  const values = new FormData(form);
  const current = adminData.deliveries.find((item) => item.id === id);
  const pedidoId = current?.pedidoId || String(values.get('pedidoId') || '');
  const order = adminData.orders.find((item) => item.id === pedidoId);
  if (!order) throw new Error('Selecione um pedido existente.');
  const payload = {
    id: id || newId('DEL'),
    pedidoId,
    enderecoId: order.enderecoId,
    transportadora: String(values.get('transportadora') || '').trim(),
    codigoRastreamento: String(values.get('codigoRastreamento') || '').trim() || newId('ND-RAST'),
    tipoEntrega: String(values.get('tipoEntrega') || 'Padrão'),
    valorFrete: Number(values.get('valorFrete')),
    statusEntrega: String(values.get('statusEntrega') || 'Aguardando confirmação'),
    dataEnvio: dateToIso(String(values.get('dataEnvio') || '')),
    previsaoEntrega: dateToIso(String(values.get('previsaoEntrega') || '')),
    dataEntrega: dateToIso(String(values.get('dataEntrega') || '')),
  };
  if (!payload.transportadora || !Number.isFinite(payload.valorFrete) || payload.valorFrete < 0) throw new Error('Confira a transportadora e o valor do frete.');
  if (payload.statusEntrega === 'Entregue' && !payload.dataEntrega) payload.dataEntrega = new Date().toISOString();
  if (['Saiu para entrega', 'Em trânsito', 'Entregue'].includes(payload.statusEntrega) && !payload.dataEnvio) payload.dataEnvio = new Date().toISOString();
  if (id) {
    const oldOrder = orderPayload(order);
    await apiRequest(entityPath('deliveries', id), { method: 'PATCH', body: JSON.stringify(payload) });
    try {
      await apiRequest(entityPath('orders', order.id), { method: 'PATCH', body: JSON.stringify({ ...oldOrder, status: statusFromDelivery(payload.statusEntrega) }) });
    } catch (error) {
      try { await apiRequest(entityPath('deliveries', id), { method: 'PATCH', body: JSON.stringify(deliveryPayload(current)) }); } catch {}
      throw new Error('A alteração da entrega foi revertida porque o pedido não pôde ser atualizado: ' + error.message);
    }
    return;
  }
  const previousDelivery = adminData.deliveries.find((item) => item.id === order.entregaId || item.pedidoId === order.id);
  if (previousDelivery && ['Enviado', 'Entregue'].includes(order.status)) throw new Error('Este pedido já saiu para entrega. Preserve o histórico de rastreamento existente.');
  await apiRequest(entityPath('deliveries'), { method: 'POST', body: JSON.stringify(payload) });
  try {
    await apiRequest(entityPath('orders', order.id), { method: 'PATCH', body: JSON.stringify({ ...orderPayload(order), entregaId: payload.id, status: statusFromDelivery(payload.statusEntrega) }) });
  } catch (error) {
    try { await apiRequest(entityPath('deliveries', payload.id), { method: 'DELETE' }); } catch {}
    throw new Error('Não foi possível vincular a entrega ao pedido: ' + error.message);
  }
  if (previousDelivery) {
    try {
      await apiRequest(entityPath('deliveries', previousDelivery.id), { method: 'DELETE' });
    } catch (error) {
      try { await apiRequest(entityPath('orders', order.id), { method: 'PATCH', body: JSON.stringify(orderPayload(order)) }); } catch {}
      try { await apiRequest(entityPath('deliveries', payload.id), { method: 'DELETE' }); } catch {}
      throw new Error('A entrega anterior não pôde ser substituída: ' + error.message);
    }
  }
}

async function saveEditor(form) {
  const entity = form.dataset.entity;
  const id = form.dataset.id;
  if (entity === 'products') return saveProduct(form, id);
  if (entity === 'orders') return saveOrder(form, id);
  if (entity === 'addresses') return saveAddress(form, id);
  return saveDelivery(form, id);
}

async function deleteRecord(entity, item) {
  if (entity === 'products' && adminData.orders.some((order) => order.produtos.some((line) => line.produtoId === item.id))) throw new Error('Este produto consta em pedidos. Marque-o como indisponível para preservar o histórico.');
  if (entity === 'addresses' && (adminData.orders.some((order) => order.enderecoId === item.id) || adminData.deliveries.some((delivery) => delivery.enderecoId === item.id))) throw new Error('Este endereço está ligado a pedidos ou entregas e precisa ser mantido para preservar o histórico.');
  if (entity === 'orders') {
    const delivery = adminData.deliveries.find((record) => record.id === item.entregaId || record.pedidoId === item.id);
    if (delivery) await apiRequest(entityPath('deliveries', delivery.id), { method: 'DELETE' });
    try { await apiRequest(entityPath('orders', item.id), { method: 'DELETE' }); }
    catch (error) {
      if (delivery) try { await apiRequest(entityPath('deliveries'), { method: 'POST', body: JSON.stringify(deliveryPayload(delivery)) }); } catch {}
      throw error;
    }
    return;
  }
  if (entity === 'deliveries') {
    const order = adminData.orders.find((record) => record.id === item.pedidoId);
    if (order?.status === 'Enviado' || order?.status === 'Entregue') throw new Error('A entrega está em trânsito ou concluída. Preserve o registro de acompanhamento.');
    if (order) await apiRequest(entityPath('orders', order.id), { method: 'PATCH', body: JSON.stringify({ ...orderPayload(order), entregaId: null }) });
    try { await apiRequest(entityPath('deliveries', item.id), { method: 'DELETE' }); }
    catch (error) {
      if (order) try { await apiRequest(entityPath('orders', order.id), { method: 'PATCH', body: JSON.stringify(orderPayload(order)) }); } catch {}
      throw error;
    }
    return;
  }
  await apiRequest(entityPath(entity, item.id), { method: 'DELETE' });
}

function renderApiError(root, error) {
  root.innerHTML = '<section class="nd-admin-error"><p class="nd-admin-eyebrow">PAINEL DE GESTÃO</p><h1>Não foi possível carregar os dados.</h1><p>' + escapeHTML(error.message) + '</p><p>Abra um terminal na pasta do projeto e execute <code>npm run api</code>.</p><button class="nd-admin-primary" type="button" data-admin-retry>Tentar novamente</button><a href="#/">Voltar ao site</a></section>';
}

async function mountAdmin() {
  const root = document.querySelector('#nd-admin-root');
  if (!root) return;
  if (!readSession()) {
    adminData = null;
    root.innerHTML = '';
    renderLogin(root);
    return;
  }
  const sequence = ++renderSequence;
  root.innerHTML = '<section class="nd-admin-loading" role="status">Conectando ao banco de demonstração…</section>';
  try {
    const data = shapeData(await loadAdminData());
    if (sequence !== renderSequence || !root.isConnected) return;
    adminData = data;
    renderDashboard(root, data);
  } catch (error) {
    if (sequence !== renderSequence || !root.isConnected) return;
    renderApiError(root, error);
  }
}

function refreshAndToast(message) {
  mountAdmin().then(() => toast(message));
}

window.addEventListener('nuvora:route-rendered', mountAdmin);

document.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest('[data-create], [data-edit], [data-delete], [data-admin-logout], [data-dialog-close], [data-order-item-add], [data-order-item-remove], [data-admin-retry]');
  if (!target) return;
  if (target.matches('[data-admin-retry]')) return mountAdmin();
  if (target.matches('[data-create]')) return openEditor(target.dataset.create);
  if (target.matches('[data-edit]')) return openEditor(target.dataset.edit, target.dataset.id);
  if (target.matches('[data-order-item-add]')) {
    const dialog = target.closest('dialog');
    const holder = dialog?.querySelector('[data-order-items]');
    const product = adminData?.products.find((item) => item.disponivel && item.estoque > 0);
    if (holder && product) holder.insertAdjacentHTML('beforeend', itemRow({ produtoId: product.id, quantidade: 1 }, adminData));
    updateOrderTotal(dialog);
    return;
  }
  if (target.matches('[data-order-item-remove]')) {
    const holder = target.closest('[data-order-items]');
    if (holder?.querySelectorAll('[data-order-item]').length > 1) target.closest('[data-order-item]')?.remove();
    updateOrderTotal(target.closest('dialog'));
    return;
  }
  if (target.matches('[data-delete]')) {
    const entity = target.dataset.delete;
    const item = adminData?.[entity]?.find((record) => record.id === target.dataset.id);
    if (!item) return;
    const label = item.nome || item.cliente || item.id;
    const question = entity === 'deliveries'
      ? 'Excluir a entrega ' + item.id + '? O pedido ficará sem entrega vinculada.'
      : entity === 'orders'
        ? 'Excluir o pedido ' + item.id + ' e sua entrega vinculada, se houver?'
        : 'Excluir ' + label + '?';
    if (!window.confirm(question)) return;
    try {
      await deleteRecord(entity, item);
      refreshAndToast('Registro removido da API.');
    } catch (error) {
      toast(error.message);
    }
    return;
  }
  if (target.matches('[data-admin-logout]')) {
    sessionOpen = false;
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    location.hash = '#/admin';
    return;
  }
  if (target.matches('[data-dialog-close]')) target.closest('dialog')?.close();
});

document.addEventListener('submit', async (event) => {
  if (!(event.target instanceof Element)) return;
  const login = event.target.closest('[data-admin-login]');
  if (login) {
    event.preventDefault();
    if (!login.elements.email.value.trim() || !login.elements.password.value) {
      const feedback = login.querySelector('[data-login-feedback]');
      feedback.textContent = 'Informe seu e-mail e senha para abrir a demonstração.';
      feedback.hidden = false;
      return;
    }
    sessionOpen = true;
    try { sessionStorage.setItem(SESSION_KEY, 'open'); } catch {}
    location.hash = '#/admin/resumo';
    return;
  }
  const form = event.target.closest('[data-admin-editor]');
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  const feedback = form.querySelector('[data-editor-feedback]');
  try {
    await saveEditor(form);
    form.closest('dialog')?.close();
    refreshAndToast('Alterações gravadas no JSON Server.');
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
    button.disabled = false;
  }
});

document.addEventListener('input', (event) => {
  if (!(event.target instanceof Element)) return;
  if (event.target.matches('[data-admin-search]')) {
    const query = event.target.value.trim().toLocaleLowerCase('pt-BR');
    document.querySelectorAll('#nd-admin-root [data-searchable]').forEach((row) => { row.hidden = !row.dataset.searchable.includes(query); });
  }
  if (event.target.matches('[data-order-item] input, [data-order-item] select')) updateOrderTotal(event.target.closest('dialog'));
});

document.addEventListener('change', (event) => {
  if (event.target instanceof Element && event.target.matches('[data-order-item] input, [data-order-item] select')) updateOrderTotal(event.target.closest('dialog'));
});

document.addEventListener('keydown', (event) => {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLocaleLowerCase() !== 'k') return;
  const search = document.querySelector('#nd-admin-root [data-admin-search]');
  if (search) {
    event.preventDefault();
    search.focus();
  }
});

mountAdmin();
