const normalize = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

function recentOrderAnswer() {
  try {
    const orders = JSON.parse(localStorage.getItem('nd-food-orders') || '[]');
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order || !Array.isArray(order.items)) return 'Ainda não encontrei pedidos no histórico deste navegador. Você pode consultar a demonstração em Meus pedidos: #/pedidos.';
    const orderId = typeof order.id === 'string' && /^ND-[\w-]{3,20}$/i.test(order.id) ? order.id : 'mais recente';
    const status = typeof order.status === 'string' ? order.status.slice(0, 48) : 'em preparação';
    const eta = typeof order.eta === 'string' ? order.eta.slice(0, 24) : '';
    return `No histórico deste navegador, o pedido ${orderId} está ${status}${eta ? ` (estimativa exibida: ${eta})` : ''}. Esse registro é demonstrativo e não acompanha uma entrega real. Veja os detalhes em Meus pedidos: #/pedidos.`;
  } catch {
    return 'Não consegui abrir o histórico local. Você pode consultar a demonstração em Meus pedidos: #/pedidos.';
  }
}

function presetAnswer(message) {
  const text = normalize(message);
  if (/^(oi|ola|bom dia|boa tarde|boa noite|opa|e ai)[!. ,?]*$/.test(text)) {
    return 'Oi! Posso ajudar com seu pedido, prazo, pagamento ou cupons. O que você precisa?';
  }
  if (/\b(cupom|cupons|desconto|promocao|promocoes|codigo promocional)\b/.test(text)) {
    return 'Temos estes cupons de demonstração: BEMVINDO10 (R$ 10 a partir de R$ 39), SABOR15 (15% a partir de R$ 50), ENTREGAZERO (zera a entrega) e DOCEND (20% a partir de R$ 20). Digite o código na sacola para conferir as regras.';
  }
  if (/\b(pagamento|pagar|pix|cartao|credito|debito|dinheiro|troco)\b/.test(text)) {
    return 'Na demonstração, a revisão do pedido indica pagamento na entrega. Não há cobrança real nem processamento de cartão ou Pix pelo site.';
  }
  if (/\b(pedido|acompanhar|rastreamento|rastrear|entregador|motoboy|atrasad[oa]|cad[eê] meu)\b/.test(text)) {
    return recentOrderAnswer();
  }
  if (/\b(entrega|entregam|prazo|demora|tempo|frete|taxa|gr[aá]tis)\b/.test(text)) {
    return 'O prazo e a taxa dependem do restaurante; confira os dados no card e na revisão da sacola. A estimativa mostrada é apenas parte da demonstração e não representa uma entrega real.';
  }
  if (/\b(cancelar|cancelamento|estornar|reembolso)\b/.test(text)) {
    return 'Como os pedidos desta demonstração são salvos apenas neste navegador, não há uma operação real para cancelar ou estornar. Você pode conferir ou limpar o registro na página Meus pedidos.';
  }
  if (/\b(alergia|al[eé]rgic|gl[uú]ten|lactose|amendoim|ingredientes|contamin[aã]c[aã]o cruzada)\b/.test(text)) {
    return 'As informações do cardápio são demonstrativas e podem não cobrir todos os ingredientes ou contato cruzado. Se houver alergia, confirme diretamente com o restaurante antes de consumir.';
  }
  if (/\b(restaurante|comida|prato|pizza|hamb[uú]rguer|sushi|a[cç]a[ií]|salada|massa)\b/.test(text) && /\b(onde|qual|como|encontr|ver|escolh|quero|tem)\b/.test(text)) {
    return 'Você pode explorar as opções em Restaurantes, filtrar por categoria e abrir um restaurante para ver os pratos. Os dados desta vitrine são demonstrativos.';
  }
  if (/\b(ajuda|suporte|atendente|falar com algu[eé]m|contato)\b/.test(text)) {
    return 'Posso orientar pelo próprio site: veja Restaurantes, Ofertas, Sacola e Meus pedidos no menu. Este projeto é uma demonstração e não tem atendimento operacional conectado.';
  }
  return null;
}

function supportApiUrl(path) {
  const hostname = window.location.hostname;
  const isLocalPage = ['localhost', '127.0.0.1', '::1'].includes(hostname);
  const isLiveServer = isLocalPage && window.location.port && !['5173', '4173'].includes(window.location.port);
  const base = isLiveServer ? `${window.location.protocol}//${hostname}:5173` : window.location.origin;
  return new URL(path, base).toString();
}

function mountSupportChat() {
  if (document.querySelector('[data-support-chat]')) return;

  const root = document.createElement('div');
  root.className = 'nd-support-chat';
  root.dataset.supportChat = '';
  root.innerHTML = `
    <section class="nd-chat-panel" id="nd-chat-panel" aria-labelledby="nd-chat-title" hidden>
      <header class="nd-chat-header">
        <span class="nd-chat-avatar" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 18.5 3.5 21l4.2-1.3a8 8 0 1 0-2.7-1.2Z"/><path d="M8 10h8M8 14h5"/></svg></span>
        <div class="nd-chat-heading"><strong id="nd-chat-title">Nani <span>ND Food</span></strong><small data-chat-status>Respostas rápidas disponíveis</small></div>
        <button class="nd-chat-close" type="button" data-chat-close aria-label="Fechar ajuda">×</button>
      </header>
      <div class="nd-chat-privacy">Ao usar a IA, sua mensagem vai para o Gemini. Não envie dados pessoais ou de pagamento.</div>
      <div class="nd-chat-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversa com a assistente">
        <div class="nd-chat-message nd-chat-message--assistant">Oi! Eu sou a Nani, assistente da ND Food. Posso ajudar com seu pedido, entrega, pagamento ou cupons.</div>
      </div>
      <div class="nd-chat-quick" aria-label="Perguntas frequentes">
        <button type="button" data-chat-prompt="Como acompanho meu pedido?">Acompanhar pedido</button>
        <button type="button" data-chat-prompt="Quais formas de pagamento?">Pagamento</button>
        <button type="button" data-chat-prompt="Qual o prazo e a taxa de entrega?">Entrega</button>
        <button type="button" data-chat-prompt="Quais cupons estão disponíveis?">Cupons</button>
      </div>
      <form class="nd-chat-form" data-chat-form>
        <label class="nd-chat-sr-only" for="nd-chat-input">Escreva sua dúvida</label>
        <input id="nd-chat-input" type="text" name="message" maxlength="1000" autocomplete="off" placeholder="Escreva sua dúvida…" required />
        <button type="submit" aria-label="Enviar mensagem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.2 18-3.9-7.9L2 9.2 21 3Z"/><path d="M10 13 21 3"/></svg></button>
      </form>
      <p class="nd-chat-footnote">Demonstração escolar · IA Gemini quando disponível</p>
    </section>
    <button class="nd-chat-launcher" type="button" aria-controls="nd-chat-panel" aria-expanded="false" aria-label="Abrir ajuda ND Food" data-chat-open>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5 3.5 21l4.2-1.3a8 8 0 1 0-2.7-1.2Z"/><path d="M8 10h8M8 14h5"/></svg><span>Ajuda</span>
    </button>`;
  document.body.append(root);

  const panel = root.querySelector('#nd-chat-panel');
  const launcher = root.querySelector('[data-chat-open]');
  const input = root.querySelector('#nd-chat-input');
  const form = root.querySelector('[data-chat-form]');
  const messageList = root.querySelector('.nd-chat-messages');
  const status = root.querySelector('[data-chat-status]');
  const quickButtons = [...root.querySelectorAll('[data-chat-prompt]')];
  const history = [];
  let configured = false;
  let statusPromise = null;
  let busy = false;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Fechar ajuda ND Food' : 'Abrir ajuda ND Food');
    if (open) {
      checkAvailability();
      input.focus({ preventScroll: true });
    } else launcher.focus({ preventScroll: true });
  }

  async function checkAvailability() {
    if (statusPromise) return statusPromise;
    statusPromise = (async () => {
      try {
        const response = await fetch(supportApiUrl('/api/chat/health'), { headers: { Accept: 'application/json' } });
        const data = await response.json();
        configured = Boolean(response.ok && data.configured);
        status.textContent = configured ? 'Gemini conectado · pronto para ajudar' : 'Respostas rápidas disponíveis';
      } catch {
        configured = false;
        status.textContent = 'Respostas rápidas disponíveis';
      } finally {
        statusPromise = null;
      }
    })();
    return statusPromise;
  }

  function addMessage(text, sender, pending = false) {
    const bubble = document.createElement('div');
    bubble.className = `nd-chat-message nd-chat-message--${sender}${pending ? ' is-pending' : ''}`;
    if (pending) {
      bubble.setAttribute('role', 'status');
      bubble.innerHTML = '<span>Nani está pensando</span><span class="nd-chat-thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
    } else {
      bubble.textContent = text;
    }
    messageList.append(bubble);
    messageList.scrollTop = messageList.scrollHeight;
    return bubble;
  }

  function setBusy(value) {
    busy = value;
    form.querySelector('button[type="submit"]').disabled = value;
    input.disabled = value;
    quickButtons.forEach((button) => { button.disabled = value; });
  }

  async function askGemini(message) {
    const waiting = addMessage('Nani está pensando…', 'assistant', true);
    setBusy(true);
    status.textContent = 'Preparando sua resposta…';
    try {
      const response = await fetch(supportApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: message }].slice(-10) }),
      });
      const result = await response.json();
      waiting.remove();
      if (!response.ok || !result.text) throw new Error(result.error || 'A IA está indisponível neste momento.');
      const answer = String(result.text).slice(0, 2200);
      history.push({ role: 'user', content: message });
      history.push({ role: 'model', content: answer });
      addMessage(answer, 'assistant');
    } catch {
      waiting.remove();
      addMessage('A IA não está disponível neste momento. As respostas rápidas continuam aqui; você também pode navegar por Restaurantes, Ofertas, Sacola e Meus pedidos.', 'assistant');
    } finally {
      setBusy(false);
      status.textContent = configured ? 'Gemini conectado · pronto para ajudar' : 'Respostas rápidas disponíveis';
      input.focus({ preventScroll: true });
    }
  }

  async function sendMessage(rawMessage) {
    const message = rawMessage.trim();
    if (!message || busy) return;
    addMessage(message, 'user');
    input.value = '';
    const answer = presetAnswer(message);
    if (answer) {
      addMessage(answer, 'assistant');
      return;
    }
    if (!configured) await checkAvailability();
    if (configured) await askGemini(message);
    else addMessage('Ainda não consigo consultar a IA agora. As respostas rápidas acima continuam disponíveis; tente perguntar sobre cupons, entrega, pagamento ou pedidos.', 'assistant');
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('[data-chat-close]').addEventListener('click', () => setOpen(false));
  root.addEventListener('click', (event) => {
    const prompt = event.target.closest('[data-chat-prompt]');
    if (prompt) sendMessage(prompt.dataset.chatPrompt);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
  checkAvailability();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSupportChat, { once: true });
else mountSupportChat();
