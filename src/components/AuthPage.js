import {
  createCustomer,
  getCurrentCustomer,
  getCurrentCustomerExport,
  signInCustomer,
  signOutCustomer,
  updateCurrentCustomer,
} from '../services/customerAccount.js';

let authPageMode = 'login';
const cepRequests = new WeakMap();
const lastCepLookup = new WeakMap();

const authStoryImages = {
  login: {
    src: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1400&q=85',
    alt: 'Hambúrguer artesanal preparado na hora',
  },
  register: {
    src: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1400&q=85',
    alt: 'Pizza artesanal com ingredientes frescos',
  },
};

const passwordRules = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatCpf(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function isValidCpf(value) {
  const cpf = String(value || '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length) => {
    const sum = cpf.slice(0, length).split('').reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

function addressLookupUrl(cep) {
  const hostname = window.location.hostname;
  const isLocalPage = ['localhost', '127.0.0.1', '::1'].includes(hostname);
  const isLiveServer = isLocalPage && window.location.port && !['5173', '4173'].includes(window.location.port);
  const host = hostname === '::1' ? '[::1]' : hostname;
  const base = isLiveServer ? `${window.location.protocol}//${host}:5173` : window.location.origin;
  const url = new URL('/api/cep', base);
  url.searchParams.set('cep', cep);
  return url.toString();
}

function renderAddressFields(address = {}, prefix = 'auth') {
  const value = (key) => escapeHTML(address[key] || '');
  const cepHelp = `${prefix}-cep-feedback`;
  return [
    '<section class="auth-page__address-section" aria-labelledby="' + prefix + '-address-title">',
      '<div class="auth-page__address-heading"><div><p class="auth-page__address-kicker">ENTREGA NO SEU ENDEREÇO</p><h3 id="' + prefix + '-address-title">Onde você recebe?</h3></div><span aria-hidden="true">⌖</span></div>',
      '<div class="auth-page__address-grid">',
        '<label class="auth-page__field auth-page__field--cep">CEP<input name="cep" type="text" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" value="' + value('cep') + '" aria-describedby="' + cepHelp + '" required data-cep-input /></label>',
        '<label class="auth-page__field auth-page__field--street">Endereço<input name="logradouro" type="text" autocomplete="address-line1" placeholder="Rua, avenida..." value="' + value('logradouro') + '" required data-address-field /></label>',
        '<label class="auth-page__field auth-page__field--number">Número<input name="numero" type="text" inputmode="numeric" autocomplete="address-line2" placeholder="Nº" value="' + value('numero') + '" required data-address-field /></label>',
        '<label class="auth-page__field">Bairro<input name="bairro" type="text" autocomplete="address-level3" placeholder="Seu bairro" value="' + value('bairro') + '" required data-address-field /></label>',
        '<label class="auth-page__field auth-page__field--city">Cidade<input name="localidade" type="text" autocomplete="address-level2" placeholder="Sua cidade" value="' + value('localidade') + '" required data-address-field /></label>',
        '<label class="auth-page__field auth-page__field--state">Estado<input name="uf" type="text" autocomplete="address-level1" placeholder="UF" maxlength="2" value="' + value('uf') + '" required data-address-field /></label>',
        '<label class="auth-page__field auth-page__field--wide">Complemento <span class="auth-page__optional">opcional</span><input name="complemento" type="text" autocomplete="address-line2" placeholder="Apto, bloco, casa..." value="' + value('complemento') + '" data-address-field /></label>',
        '<label class="auth-page__field auth-page__field--wide">Informações para entrega <span class="auth-page__optional">opcional</span><input name="referencia" type="text" placeholder="Ponto de referência ou instrução" value="' + value('referencia') + '" data-address-field /></label>',
      '</div>',
      '<p class="auth-page__cep-feedback" id="' + cepHelp + '" role="status" aria-live="polite">Digite seu CEP para preencher rua, bairro, cidade e estado automaticamente.</p>',
    '</section>',
  ].join('');
}

function renderAuthContent(registering) {
  const action = registering ? 'Criar minha conta' : 'Entrar';
  return [
    '<h2 id="auth-page-title" tabindex="-1">' + (registering ? 'Crie sua conta.' : 'Que bom ter você por aqui.') + '</h2>',
    '<p class="auth-page__intro">' + (registering ? 'Seus sabores favoritos e seus pedidos, no mesmo lugar.' : 'Entre com seu e-mail e continue de onde parou.') + '</p>',
    '<form class="auth-page__form" id="auth-page-form" novalidate>',
      registering ? '<label class="auth-page__field">Seu nome<input name="name" type="text" autocomplete="name" placeholder="Como podemos chamar você?" required maxlength="100" /></label>' : '',
      '<label class="auth-page__field">E-mail<span class="auth-page__input-wrap"><span class="auth-page__input-icon" aria-hidden="true">@</span><input name="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@gmail.com" aria-describedby="auth-gmail-help" required maxlength="190" /></span><small id="auth-gmail-help">' + (registering ? 'Use um endereço terminado em @gmail.com' : 'Informe o e-mail usado no cadastro neste navegador') + '</small></label>',
      registering ? '<label class="auth-page__field">CPF<input name="cpf" type="text" inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" maxlength="14" required data-cpf-input /><small>Use um CPF fictício nesta demonstração.</small></label>' : '',
      registering ? renderAddressFields({}, 'auth') : '',
      '<label class="auth-page__field">Senha<span class="auth-page__input-wrap auth-page__input-wrap--password"><span class="auth-page__input-icon auth-page__lock-icon" aria-hidden="true">⌑</span><input id="auth-password" name="password" type="password" autocomplete="' + (registering ? 'new-password' : 'current-password') + '" placeholder="' + (registering ? 'Crie uma senha segura' : 'Digite sua senha') + '" minlength="' + (registering ? '8' : '1') + '" maxlength="64" required data-auth-password /><button type="button" class="auth-page__password-toggle" data-auth-toggle="#auth-password" aria-label="Mostrar senha">Mostrar</button></span></label>',
      registering ? '<div class="auth-page__password-rules" data-auth-rules><p>A senha precisa ter:</p><ul><li data-auth-rule="length"><span aria-hidden="true">○</span> 8 caracteres ou mais</li><li data-auth-rule="uppercase"><span aria-hidden="true">○</span> Uma letra maiúscula</li><li data-auth-rule="lowercase"><span aria-hidden="true">○</span> Uma letra minúscula</li><li data-auth-rule="number"><span aria-hidden="true">○</span> Um número</li><li data-auth-rule="special"><span aria-hidden="true">○</span> Um caractere especial</li></ul></div>' : '',
      registering ? '<label class="auth-page__field">Confirme sua senha<span class="auth-page__input-wrap"><span class="auth-page__input-icon auth-page__lock-icon" aria-hidden="true">⌑</span><input name="passwordConfirm" type="password" autocomplete="new-password" placeholder="Digite a senha novamente" minlength="8" maxlength="64" required data-auth-confirm /></span></label>' : '',
      '<p class="auth-page__feedback" data-auth-feedback role="status" aria-live="polite" hidden></p>',
      '<button class="auth-page__submit" type="submit">' + action + '<span aria-hidden="true">→</span></button>',
    '</form>',
    '<p class="auth-page__terms">Conta demonstrativa: os dados ficam salvos somente neste navegador. Não use uma senha real.</p>',
    '<p class="auth-page__switch-copy">' + (registering ? 'Já tem uma conta? ' : 'Ainda não tem uma conta? ') + '<button type="button" data-auth-mode="' + (registering ? 'login' : 'register') + '">' + (registering ? 'Entrar' : 'Cadastre-se') + '</button></p>',
  ].join('');
}

export function renderAuthPage() {
  const customer = getCurrentCustomer();
  if (customer) {
    return '<section class="auth-page auth-page--connected"><div class="profile-page__card"><p class="auth-page__eyebrow auth-page__eyebrow--light"><i></i> ND FOOD</p><h1 id="auth-page-title" tabindex="-1">Você já está conectado, ' + escapeHTML(customer.name.split(' ')[0]) + '.</h1><p class="auth-page__intro">Seus dados e endereço de entrega estão no perfil.</p><a class="auth-page__submit profile-page__action" href="#/perfil">Abrir meu perfil <span aria-hidden="true">→</span></a></div></section>';
  }
  const storyImage = authStoryImages[authPageMode];
  return [
    '<section class="auth-page" aria-labelledby="auth-page-title">',
      '<a class="auth-page__back" href="#/" aria-label="Voltar para o início"><span aria-hidden="true">←</span> Voltar para a ND Food</a>',
      '<div class="auth-page__layout">',
        '<aside class="auth-page__story">',
          '<img class="auth-page__photo" data-auth-story-image src="' + storyImage.src.replace(/&/g, '&amp;') + '" alt="' + storyImage.alt + '" />',
          '<div class="auth-page__story-shade"></div>',
          '<a class="auth-page__brand" href="#/" aria-label="ND Food, página inicial"><span class="auth-page__brand-icon" aria-hidden="true">n.</span><span>ND<small>Food.</small></span></a>',
          '<div class="auth-page__story-copy"><p class="auth-page__eyebrow"><i></i> SEU MOMENTO COMEÇA AQUI</p><h1>Comida boa.<br /><em>Momentos melhores.</em></h1><p>Entre na sua conta para encontrar seus sabores favoritos e acompanhar cada pedido.</p></div>',
          '<span class="auth-page__story-note"><span aria-hidden="true">✦</span> Seu próximo sabor está perto.</span>',
        '</aside>',
        '<div class="auth-page__content">',
          '<div class="auth-page__form-wrap">',
            '<p class="auth-page__eyebrow auth-page__eyebrow--light"><i></i> BEM-VINDO À ND FOOD</p>',
            '<div class="auth-page__segment-wrap"><div id="auth-mode-switch" data-current-value="' + (authPageMode === 'register' ? 'Criar conta' : 'Entrar') + '" aria-label="Alternar entre entrar e criar conta"></div></div>',
            '<div data-auth-content>' + renderAuthContent(authPageMode === 'register') + '</div>',
          '</div>',
        '</div>',
      '</div>',
    '</section>',
  ].join('');
}

export function renderProfilePage() {
  const customer = getCurrentCustomer();
  if (!customer) return '<section class="profile-page"><h1 tabindex="-1">Entre na sua conta para abrir o perfil.</h1><a class="button button-primary" href="#/entrar">Entrar</a></section>';
  const firstName = customer.name.split(' ')[0] || customer.name;
  const initials = customer.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
  return [
    '<section class="profile-page" aria-labelledby="profile-title">',
      '<a class="auth-page__back" href="#/" aria-label="Voltar para o início"><span aria-hidden="true">←</span> Voltar para a ND Food</a>',
      '<header class="profile-page__hero">',
        '<div class="profile-page__avatar" aria-hidden="true">' + escapeHTML(initials) + '</div>',
        '<div><p class="auth-page__eyebrow auth-page__eyebrow--light"><i></i> SUA CONTA ND FOOD</p><h1 id="profile-title" tabindex="-1">Olá, ' + escapeHTML(firstName) + '.</h1><p>Confira e atualize seus dados e endereço de entrega.</p></div>',
        '<span class="profile-page__demo-pill">Conta demonstrativa</span>',
      '</header>',
      '<div class="profile-page__card">',
        '<div class="profile-page__section-heading"><div><p class="profile-page__eyebrow">SEUS DADOS</p><h2>Informações da conta</h2></div><span aria-hidden="true">✦</span></div>',
        '<form id="profile-form" class="profile-page__form" novalidate>',
          '<div class="profile-page__identity-grid">',
            '<label class="auth-page__field">Seu nome<input name="name" type="text" autocomplete="name" value="' + escapeHTML(customer.name) + '" maxlength="100" required /></label>',
            '<label class="auth-page__field">CPF<input name="cpf" type="text" inputmode="numeric" autocomplete="off" value="' + escapeHTML(formatCpf(customer.cpf)) + '" placeholder="000.000.000-00" maxlength="14" required data-cpf-input /></label>',
            '<div class="profile-page__email"><span>E-mail</span><strong>' + escapeHTML(customer.email) + '</strong><small>O e-mail desta conta não pode ser alterado.</small></div>',
          '</div>',
          renderAddressFields(customer.address, 'profile'),
          '<p class="auth-page__feedback" data-profile-feedback role="status" aria-live="polite" hidden></p>',
          '<div class="profile-page__actions"><button class="auth-page__submit" type="submit">Salvar alterações <span aria-hidden="true">→</span></button><button class="profile-page__export" type="button" data-profile-export>Exportar meus dados <span aria-hidden="true">↓</span></button><button class="profile-page__signout" type="button" data-profile-signout>Sair da conta</button></div>',
        '</form>',
        '<p class="profile-page__privacy">A conta e os pedidos desta demonstração ficam neste navegador. O JSON exportado inclui CPF e endereço; guarde o arquivo com cuidado e use dados fictícios.</p>',
      '</div>',
    '</section>',
  ].join('');
}

function refreshPasswordRules() {
  const input = document.querySelector('[data-auth-password]');
  const list = document.querySelector('[data-auth-rules]');
  if (!input || !list) return;
  const rules = passwordRules(input.value);
  Object.entries(rules).forEach(([rule, isMet]) => {
    const item = list.querySelector('[data-auth-rule="' + rule + '"]');
    if (!item) return;
    item.classList.toggle('is-met', isMet);
    item.querySelector('span').textContent = isMet ? '✓' : '○';
  });
}

function setFeedback(selector, message) {
  const feedback = document.querySelector(selector);
  if (!feedback) return;
  feedback.hidden = !message;
  feedback.textContent = message;
}

function setAuthMode(mode, { focus = true } = {}) {
  if (!['login', 'register'].includes(mode)) return;
  const routeScreen = document.querySelector('#route-screen');
  const content = routeScreen?.querySelector('[data-auth-content]');
  if (!content) return;
  const email = routeScreen.querySelector('#auth-page-form [name="email"]')?.value || '';
  authPageMode = mode;
  content.innerHTML = renderAuthContent(mode === 'register');
  const storyPhoto = routeScreen.querySelector('[data-auth-story-image]');
  const storyImage = authStoryImages[mode];
  if (storyPhoto && storyImage) {
    storyPhoto.src = storyImage.src;
    storyPhoto.alt = storyImage.alt;
  }
  const emailInput = content.querySelector('#auth-page-form [name="email"]');
  if (emailInput) emailInput.value = email;
  const switchHost = routeScreen.querySelector('#auth-mode-switch');
  if (switchHost) switchHost.dataset.currentValue = mode === 'register' ? 'Criar conta' : 'Entrar';
  if (focus) routeScreen.querySelector('#auth-page-title')?.focus({ preventScroll: true });
}

async function lookupCep(input) {
  const form = input.form;
  const digits = input.value.replace(/\D/g, '');
  const feedback = form?.querySelector('.auth-page__cep-feedback');
  if (!form || digits.length !== 8) return;
  if (lastCepLookup.get(form) === digits) return;
  lastCepLookup.set(form, digits);
  cepRequests.get(form)?.abort();
  const controller = new AbortController();
  cepRequests.set(form, controller);
  if (feedback) {
    feedback.textContent = 'Buscando endereço pelo CEP…';
    feedback.classList.remove('is-error');
  }
  try {
    const response = await fetch(addressLookupUrl(digits), { headers: { Accept: 'application/json' }, signal: controller.signal });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não foi possível localizar este CEP.');
    if (input.value.replace(/\D/g, '') !== digits) return;
    const fields = { logradouro: result.logradouro, bairro: result.bairro, localidade: result.localidade, uf: result.uf };
    Object.entries(fields).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field && value) field.value = value;
    });
    if (feedback) feedback.textContent = 'Endereço encontrado. Confira os dados e complete o número e o complemento.';
  } catch (error) {
    if (error.name === 'AbortError') return;
    lastCepLookup.delete(form);
    if (feedback) {
      feedback.textContent = error.message.includes('não foi possível localizar') || error.message.includes('CEP')
        ? 'Não encontramos esse CEP. Confira os dígitos ou preencha o endereço manualmente.'
        : 'O preenchimento automático está indisponível agora. Você pode completar o endereço manualmente.';
      feedback.classList.add('is-error');
    }
  }
}

function getAddressFromForm(form) {
  const value = (name) => String(form.elements[name]?.value || '').trim();
  return {
    cep: value('cep').replace(/\D/g, ''),
    logradouro: value('logradouro'),
    numero: value('numero'),
    bairro: value('bairro'),
    localidade: value('localidade'),
    uf: value('uf').toLocaleUpperCase('pt-BR'),
    complemento: value('complemento'),
    referencia: value('referencia'),
  };
}

function validateAddress(form) {
  const cep = form.elements.cep;
  if (cep) cep.setCustomValidity(cep.value.replace(/\D/g, '').length === 8 ? '' : 'Informe um CEP com 8 dígitos.');
  const state = form.elements.uf;
  if (state) state.setCustomValidity(/^[A-Za-z]{2}$/.test(state.value.trim()) ? '' : 'Informe a sigla do estado, com duas letras.');
}

function validateCpf(form) {
  const cpf = form.elements.cpf;
  if (cpf) cpf.setCustomValidity(isValidCpf(cpf.value) ? '' : 'Informe um CPF válido com 11 dígitos.');
}

function downloadCustomerData() {
  const data = getCurrentCustomerExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nd-food-dados-da-conta-${new Date().toISOString().slice(0, 10)}.json`;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function refreshBusy(button, busy) {
  if (!button) return;
  if (busy) {
    button.dataset.originalLabel = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.innerHTML = 'Salvando…';
  } else {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (button.dataset.originalLabel) button.innerHTML = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
}

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches('#auth-page-form [name="email"]')) target.setCustomValidity('');
  if (target.matches('[data-auth-password]')) {
    target.setCustomValidity('');
    refreshPasswordRules();
    setFeedback('[data-auth-feedback]', '');
  }
  if (target.matches('[data-auth-confirm]')) target.setCustomValidity('');
  if (target.matches('[data-cpf-input]')) {
    target.value = formatCpf(target.value);
    target.setCustomValidity(isValidCpf(target.value) ? '' : 'Informe um CPF válido com 11 dígitos.');
  }
  if (target.matches('[data-cep-input]')) {
    const digits = target.value.replace(/\D/g, '').slice(0, 8);
    target.value = digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
    target.setCustomValidity(digits.length === 8 ? '' : 'Informe um CEP com 8 dígitos.');
    if (digits.length < 8) {
      lastCepLookup.delete(target.form);
      const feedback = target.form?.querySelector('.auth-page__cep-feedback');
      if (feedback) {
        feedback.textContent = 'Digite seu CEP para preencher rua, bairro, cidade e estado automaticamente.';
        feedback.classList.remove('is-error');
      }
    } else lookupCep(target);
  }
  if (target.matches('[data-address-field]')) target.setCustomValidity('');
  if (target.matches('#profile-form [name="name"]')) target.setCustomValidity('');
});

document.addEventListener('nuvora:auth-mode-change', (event) => {
  const value = event.detail?.value;
  setAuthMode(value === 'Criar conta' ? 'register' : value === 'Entrar' ? 'login' : value, { focus: false });
});

document.addEventListener('click', (event) => {
  const target = event.target;
  const modeButton = target.closest('[data-auth-mode]');
  if (modeButton) {
    const value = modeButton.dataset.authMode === 'register' ? 'Criar conta' : 'Entrar';
    window.dispatchEvent(new CustomEvent('nuvora:auth-mode-sync', { detail: { value } }));
    return;
  }
  if (target.closest('[data-profile-signout]')) {
    signOutCustomer();
    window.location.hash = '#/';
    return;
  }
  if (target.closest('[data-profile-export]')) {
    try {
      downloadCustomerData();
      setFeedback('[data-profile-feedback]', 'Arquivo JSON exportado com seus dados e pedidos desta conta.');
    } catch (error) {
      setFeedback('[data-profile-feedback]', error.message || 'Não foi possível exportar seus dados.');
    }
    return;
  }
  const toggle = target.closest('[data-auth-toggle]');
  if (toggle) {
    const input = document.querySelector(toggle.dataset.authToggle);
    if (!input) return;
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? 'Ocultar' : 'Mostrar';
    toggle.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
    input.focus();
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.matches('#profile-form')) {
    event.preventDefault();
    validateCpf(form);
    validateAddress(form);
    if (!form.reportValidity()) return;
    const button = form.querySelector('[type="submit"]');
    refreshBusy(button, true);
    try {
      updateCurrentCustomer({ name: form.elements.name.value.trim(), cpf: form.elements.cpf.value, address: getAddressFromForm(form) });
      setFeedback('[data-profile-feedback]', 'Seu perfil foi atualizado neste navegador.');
    } catch (error) {
      setFeedback('[data-profile-feedback]', error.message || 'Não foi possível atualizar seu perfil.');
    } finally { refreshBusy(button, false); }
    return;
  }
  if (!form.matches('#auth-page-form')) return;
  event.preventDefault();
  const registering = authPageMode === 'register';
  const email = form.elements.email;
  const password = form.elements.password;
  email.setCustomValidity(/^[^\s@]+@gmail\.com$/i.test(email.value.trim()) ? '' : 'Use um endereço Gmail válido, como voce@gmail.com.');
  if (registering) {
    const failedRule = Object.values(passwordRules(password.value)).some((isMet) => !isMet);
    password.setCustomValidity(failedRule ? 'Sua senha precisa cumprir todos os requisitos exibidos.' : '');
    const confirmation = form.elements.passwordConfirm;
    confirmation.setCustomValidity(confirmation.value === password.value ? '' : 'As senhas não coincidem.');
    validateCpf(form);
    validateAddress(form);
  }
  if (!form.reportValidity()) return;
  const button = form.querySelector('[type="submit"]');
  refreshBusy(button, true);
  setFeedback('[data-auth-feedback]', '');
  try {
    if (registering) {
      await createCustomer({
        name: form.elements.name.value.trim(),
        email: email.value.trim(),
        cpf: form.elements.cpf.value,
        password: password.value,
        address: getAddressFromForm(form),
      });
    } else {
      await signInCustomer(email.value.trim(), password.value);
    }
    authPageMode = 'login';
    window.location.hash = '#/perfil';
  } catch (error) {
    setFeedback('[data-auth-feedback]', error.message || 'Não foi possível entrar agora. Tente novamente.');
  } finally { refreshBusy(button, false); }
});
