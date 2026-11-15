const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const entityPaths = {
  products: 'produtos',
  orders: 'pedidos',
  addresses: 'enderecos',
  deliveries: 'entregas',
};

export function entityPath(entity, id) {
  const collection = entityPaths[entity];
  if (!collection) throw new Error('Coleção inválida.');
  return '/' + collection + (id === undefined ? '' : '/' + encodeURIComponent(id));
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível acessar o JSON Server. Inicie a API com npm run api.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'A API respondeu com erro HTTP ' + response.status + '.');
  }

  if (response.status === 204) return null;
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

export async function loadAdminData() {
  const [products, orders, addresses, deliveries] = await Promise.all([
    apiRequest(entityPath('products')),
    apiRequest(entityPath('orders')),
    apiRequest(entityPath('addresses')),
    apiRequest(entityPath('deliveries')),
  ]);
  return { products, orders, addresses, deliveries };
}
