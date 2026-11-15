# API de demonstração ND Food

O arquivo `db.json` na raiz do projeto contém as coleções `produtos`, `pedidos`, `enderecos` e `entregas`. Os registros são fictícios. Os IDs são strings e as referências entre pedido, endereço, produto e entrega são explícitas.

## Iniciar

Use Node.js 22.12 ou superior para a versão v1 beta fixada neste projeto.

```bash
npm install
npm run api
```

O servidor fica em `http://localhost:3000`. Em outro terminal, execute `npm run dev` para abrir o site. O painel administrativo já usa essa API nas quatro páginas. Se abrir o site pelo Go Live, deixe o JSON Server rodando no mesmo computador. Para apontar o painel para outra API, configure `VITE_API_BASE_URL` no `.env` antes de iniciar o Vite.

O login do painel continua sendo apenas uma tela de demonstração: qualquer e-mail e senha válidos abrem a área administrativa. O JSON Server também não oferece autenticação, validação transacional nem persistência adequada para produção.

No painel, criar um pedido também cria e vincula uma entrega inicial. A página de entregas pode criar uma nova entrega vinculada a um pedido; se ele já tiver uma entrega em andamento, o registro novo a substitui. Remover uma entrega limpa `entregaId` do pedido. Pedidos e entregas concluídos não têm a exclusão de acompanhamento liberada.

## Rotas

```text
GET    /produtos
GET    /produtos/:id
POST   /produtos
PATCH  /produtos/:id
DELETE /produtos/:id
GET    /pedidos
GET    /pedidos/:id
POST   /pedidos
PATCH  /pedidos/:id
DELETE /pedidos/:id
GET    /enderecos
GET    /enderecos/:id
POST   /enderecos
PATCH  /enderecos/:id
DELETE /enderecos/:id
GET    /entregas
GET    /entregas/:id
POST   /entregas
PATCH  /entregas/:id
DELETE /entregas/:id
```

## Cliente REST reutilizável

```js
const API_BASE = 'http://localhost:3000';

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Falha na API (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

const listarProdutos = () => api('/produtos');
const listarPedidos = () => api('/pedidos');
const listarEnderecos = () => api('/enderecos');
const listarEntregas = () => api('/entregas');
const obterPedido = (id) => api(`/pedidos/${encodeURIComponent(id)}`);
```

Cada página pode carregar apenas sua coleção. Para exibir detalhes relacionados, carregue as coleções necessárias e resolva os IDs no cliente. O JSON Server não faz junções relacionais automaticamente.

## CREATE, UPDATE e DELETE

```js
const produtoCriado = await api('/produtos', {
  method: 'POST',
  body: JSON.stringify({
    id: `PR-${crypto.randomUUID()}`,
    nome: 'Pizza de abobrinha',
    descricao: 'Abobrinha grelhada, mozzarella e manjericão.',
    categoria: 'Pizzas',
    preco: 44.9,
    estoque: 8,
    imagem: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
    disponivel: true,
  }),
});

await api(`/produtos/${encodeURIComponent(produtoCriado.id)}`, {
  method: 'PATCH',
  body: JSON.stringify({ estoque: 7 }),
});

await api(`/produtos/${encodeURIComponent(produtoCriado.id)}`, {
  method: 'DELETE',
});
```

## Criar pedido com produtos, endereço e entrega relacionados

Os preços vêm do catálogo da API, e o total é calculado em centavos para evitar erros de arredondamento. O exemplo também cria a entrega com IDs previamente definidos para manter `pedido.entregaId` e `entrega.pedidoId` alinhados.

```js
async function criarPedido({ cliente, itens, enderecoId }) {
  if (!cliente.trim() || !itens.length) {
    throw new Error('Informe cliente e pelo menos um produto.');
  }

  const endereco = await api(`/enderecos/${encodeURIComponent(enderecoId)}`);
  const produtosPedido = await Promise.all(itens.map(async ({ produtoId, quantidade }) => {
    const produto = await api(`/produtos/${encodeURIComponent(produtoId)}`);
    const quantidadeValida = Number(quantidade);

    if (!Number.isInteger(quantidadeValida) || quantidadeValida < 1) {
      throw new Error('A quantidade deve ser um inteiro maior que zero.');
    }
    if (!produto.disponivel || produto.estoque < quantidadeValida) {
      throw new Error(`Estoque insuficiente para ${produto.nome}.`);
    }

    return {
      produtoId: produto.id,
      quantidade: quantidadeValida,
      precoUnitario: produto.preco,
    };
  }));

  const totalCentavos = produtosPedido.reduce(
    (total, item) => total + Math.round(item.precoUnitario * 100) * item.quantidade,
    0,
  );
  const pedidoId = `PED-${crypto.randomUUID()}`;
  const entregaId = `DEL-${crypto.randomUUID()}`;
  const pedido = {
    id: pedidoId,
    cliente: cliente.trim(),
    produtos: produtosPedido,
    valorTotal: totalCentavos / 100,
    enderecoId: endereco.id,
    entregaId,
    status: 'Pendente',
    dataPedido: new Date().toISOString(),
  };
  const entrega = {
    id: entregaId,
    pedidoId,
    enderecoId: endereco.id,
    transportadora: 'ND Food Entregas',
    codigoRastreamento: `ND-${crypto.randomUUID()}`,
    tipoEntrega: 'Padrão',
    valorFrete: 0,
    statusEntrega: 'Aguardando confirmação',
    dataEnvio: null,
    previsaoEntrega: null,
    dataEntrega: null,
  };

  await api('/pedidos', { method: 'POST', body: JSON.stringify(pedido) });
  try {
    await api('/entregas', { method: 'POST', body: JSON.stringify(entrega) });
  } catch (error) {
    await api(`/pedidos/${encodeURIComponent(pedidoId)}`, { method: 'DELETE' });
    throw error;
  }

  return pedido;
}
```

Uso:

```js
const pedido = await criarPedido({
  cliente: 'Cliente de demonstração',
  enderecoId: 'END-1001',
  itens: [
    { produtoId: 'PR-1001', quantidade: 2 },
    { produtoId: 'PR-1007', quantidade: 1 },
  ],
});
```

## Integridade dos relacionamentos

- Antes de salvar um pedido, confirme que `enderecoId` existe e que todo `produtoId` existe, está disponível e tem estoque suficiente.
- Recalcule `valorTotal` com os preços atuais da coleção `produtos`; não confie em totais enviados pelo formulário.
- Ao mudar `enderecoId` de um pedido, atualize também o `enderecoId` da entrega relacionada.
- Ao atualizar o status da entrega, atualize o pedido relacionado para manter a linha do tempo coerente.
- Não exclua um produto referenciado por pedidos ou um endereço referenciado por pedidos/entregas. Arquive o produto com `disponivel: false`; mantenha endereços antigos enquanto houver pedidos associados.
- Para remover um registro de demonstração relacionado, atualize ou exclua primeiro as referências dependentes e confira cada resposta HTTP antes de seguir. JSON Server não oferece chaves estrangeiras nem transações; chamadas sequenciais podem falhar parcialmente.
- Em um sistema real, essas validações e exclusões em cascata devem ocorrer no servidor dentro de transações. JSON Server é apenas uma API local de demonstração.
