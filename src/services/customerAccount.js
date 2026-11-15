const ACCOUNTS_KEY = 'ndfood-demo-accounts';
const SESSION_KEY = 'ndfood-demo-session';
const ORDERS_KEY = 'nd-food-orders';
const PASSWORD_ITERATIONS = 150000;

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return Array.isArray(accounts) ? accounts.filter((account) => account && typeof account.id === 'string') : [];
  } catch {
    return [];
  }
}

function requireCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Este navegador não permite criar uma conta demonstrativa. Abra o site por HTTPS ou localhost.');
  }
}

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  requireCrypto();
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: PASSWORD_ITERATIONS }, material, 256);
  return toHex(bits);
}

function createSalt() {
  requireCrypto();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return toHex(bytes);
}

function publicAccount(account) {
  if (!account) return null;
  const { id, name, email, cpf, address } = account;
  return { id, name, email, cpf: String(cpf || ''), address: { ...address } };
}

function readCustomerOrders(customer) {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => order && (
      order.customerId === customer.id
      || order.customer?.id === customer.id
      || order.customerEmail === customer.email
      || order.customer?.email === customer.email
    ));
  } catch {
    return [];
  }
}

function writeAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    throw new Error('Não foi possível salvar sua conta neste navegador. Verifique o espaço disponível e tente novamente.');
  }
}

function notifySession(customer) {
  window.dispatchEvent(new CustomEvent('ndfood:session', { detail: { customer } }));
  return customer;
}

export function getCurrentCustomer() {
  let id = '';
  try { id = localStorage.getItem(SESSION_KEY) || ''; } catch { return null; }
  if (!id) return null;
  const account = readAccounts().find((item) => item.id === id);
  if (!account) {
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    return null;
  }
  return publicAccount(account);
}

export function getCurrentCustomerExport() {
  const id = (() => {
    try { return localStorage.getItem(SESSION_KEY) || ''; } catch { return ''; }
  })();
  const account = readAccounts().find((item) => item.id === id);
  if (!account) throw new Error('Entre na sua conta para exportar seus dados.');
  const customer = publicAccount(account);
  return {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    account: {
      ...customer,
      createdAt: account.createdAt || null,
      updatedAt: account.updatedAt || null,
    },
    orders: readCustomerOrders(customer),
  };
}

export async function createCustomer({ name, email, cpf, password, address }) {
  const normalizedEmail = String(email || '').trim().toLocaleLowerCase('pt-BR');
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === normalizedEmail)) throw new Error('Já existe uma conta demonstrativa com este e-mail neste navegador.');
  const salt = createSalt();
  const account = {
    id: crypto.randomUUID(),
    name: String(name || '').trim(),
    email: normalizedEmail,
    cpf: String(cpf || '').replace(/\D/g, ''),
    salt,
    passwordHash: await hashPassword(password, salt),
    address: {
      cep: String(address.cep || ''),
      logradouro: String(address.logradouro || ''),
      numero: String(address.numero || ''),
      bairro: String(address.bairro || ''),
      localidade: String(address.localidade || ''),
      uf: String(address.uf || ''),
      complemento: String(address.complemento || ''),
      referencia: String(address.referencia || ''),
    },
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  try { localStorage.setItem(SESSION_KEY, account.id); }
  catch { throw new Error('A conta foi criada, mas não foi possível manter a sessão neste navegador. Entre novamente.'); }
  return notifySession(publicAccount(account));
}

export async function signInCustomer(email, password) {
  const normalizedEmail = String(email || '').trim().toLocaleLowerCase('pt-BR');
  const account = readAccounts().find((item) => item.email === normalizedEmail);
  if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
    throw new Error('E-mail ou senha incorretos para esta demonstração.');
  }
  try { localStorage.setItem(SESSION_KEY, account.id); }
  catch { throw new Error('Não foi possível manter a sessão neste navegador.'); }
  return notifySession(publicAccount(account));
}

export function updateCurrentCustomer({ name, cpf, address }) {
  const customer = getCurrentCustomer();
  if (!customer) throw new Error('Entre novamente para atualizar seu perfil.');
  const accounts = readAccounts();
  const index = accounts.findIndex((account) => account.id === customer.id);
  if (index < 0) throw new Error('Não encontrei esta conta neste navegador.');
  const previous = accounts[index];
  const nextAddress = { ...previous.address, ...address };
  const updated = {
    ...previous,
    name: String(name || '').trim(),
    cpf: String(cpf ?? previous.cpf ?? '').replace(/\D/g, ''),
    address: nextAddress,
    updatedAt: new Date().toISOString(),
  };
  accounts[index] = updated;
  writeAccounts(accounts);
  return notifySession(publicAccount(updated));
}

export function signOutCustomer() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
  notifySession(null);
}
