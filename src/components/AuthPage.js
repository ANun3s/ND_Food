let authPageMode = 'login';

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

function renderAuthContent(registering) {
  const action = registering ? 'Criar minha conta' : 'Entrar com Gmail';
  return [
    '<h2 id="auth-page-title" tabindex="-1">' + (registering ? 'Crie sua conta.' : 'Que bom ter você por aqui.') + '</h2>',
    '<p class="auth-page__intro">' + (registering ? 'Cadastre seu Gmail e escolha uma senha para começar.' : 'Entre com seu Gmail e continue de onde parou.') + '</p>',
    '<form class="auth-page__form" id="auth-page-form" novalidate>',
      registering ? '<label class="auth-page__field">Seu nome<input name="name" type="text" autocomplete="name" placeholder="Como podemos chamar você?" required /></label>' : '',
      '<label class="auth-page__field">Gmail<span class="auth-page__input-wrap"><span class="auth-page__input-icon" aria-hidden="true">@</span><input name="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@gmail.com" aria-describedby="auth-gmail-help" required /></span><small id="auth-gmail-help">Use um endereço terminado em @gmail.com</small></label>',
      '<label class="auth-page__field">Senha<span class="auth-page__input-wrap auth-page__input-wrap--password"><span class="auth-page__input-icon auth-page__lock-icon" aria-hidden="true">⌑</span><input id="auth-password" name="password" type="password" autocomplete="' + (registering ? 'new-password' : 'current-password') + '" placeholder="' + (registering ? 'Crie uma senha segura' : 'Digite sua senha') + '" minlength="' + (registering ? '8' : '1') + '" maxlength="64" required data-auth-password /><button type="button" class="auth-page__password-toggle" data-auth-toggle="#auth-password" aria-label="Mostrar senha">Mostrar</button></span></label>',
      registering ? '<div class="auth-page__password-rules" data-auth-rules><p>A senha precisa ter:</p><ul><li data-auth-rule="length"><span aria-hidden="true">○</span> 8 caracteres ou mais</li><li data-auth-rule="uppercase"><span aria-hidden="true">○</span> Uma letra maiúscula</li><li data-auth-rule="lowercase"><span aria-hidden="true">○</span> Uma letra minúscula</li><li data-auth-rule="number"><span aria-hidden="true">○</span> Um número</li><li data-auth-rule="special"><span aria-hidden="true">○</span> Um caractere especial</li></ul></div>' : '',
      registering ? '<label class="auth-page__field">Confirme sua senha<span class="auth-page__input-wrap"><span class="auth-page__input-icon auth-page__lock-icon" aria-hidden="true">⌑</span><input name="passwordConfirm" type="password" autocomplete="new-password" placeholder="Digite a senha novamente" minlength="8" maxlength="64" required data-auth-confirm /></span></label>' : '',
      '<p class="auth-page__feedback" data-auth-feedback role="status" aria-live="polite" hidden></p>',
      '<button class="auth-page__submit" type="submit">' + action + '<span aria-hidden="true">→</span></button>',
    '</form>',
    '<p class="auth-page__terms">Ao continuar, você concorda com os Termos de uso e a Política de privacidade da ND Food.</p>',
    '<p class="auth-page__switch-copy">' + (registering ? 'Já tem uma conta? ' : 'Ainda não tem uma conta? ') + '<button type="button" data-auth-mode="' + (registering ? 'login' : 'register') + '">' + (registering ? 'Entrar' : 'Cadastre-se') + '</button></p>',
  ].join('');
}

export function renderAuthPage() {
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

function setAuthFeedback(message) {
  const feedback = document.querySelector('[data-auth-feedback]');
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

document.addEventListener('input', (event) => {
  if (event.target.matches('#auth-page-form [name="email"]')) event.target.setCustomValidity('');
  if (event.target.matches('[data-auth-password]')) {
    event.target.setCustomValidity('');
    refreshPasswordRules();
    setAuthFeedback('');
  }
  if (event.target.matches('[data-auth-confirm]')) event.target.setCustomValidity('');
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

document.addEventListener('submit', (event) => {
  const form = event.target;
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
  }
  if (!form.reportValidity()) return;
  setAuthFeedback('A tela está pronta, mas o serviço de autenticação ainda não foi conectado. Nenhum dado foi enviado ou salvo.');
});
