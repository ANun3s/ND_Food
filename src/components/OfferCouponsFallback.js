(() => {
  const coupons = [
    { code: 'BEMVINDO10', discount: 'R$ 10 OFF', detail: 'No primeiro pedido acima de R$ 39', label: 'PRIMEIRO PEDIDO', image: 'photo-1568901346375-23c9450c58cd', alt: 'Hambúrguer artesanal com queijo e salada' },
    { code: 'SABOR15', discount: '15% OFF', detail: 'Em pedidos acima de R$ 50', label: 'SEU PRÓXIMO SABOR', image: 'photo-1571407970349-bc81e7e96d47', alt: 'Pizza artesanal recém-assada' },
    { code: 'ENTREGAZERO', discount: 'FRETE GRÁTIS', detail: 'Em restaurantes selecionados', label: 'SEM TAXA DE ENTREGA', image: 'photo-1579871494447-9811cf80d66c', alt: 'Seleção de sushi e sashimi' },
    { code: 'DOCEND', discount: '20% OFF', detail: 'Para adoçar seu pedido', label: 'UM MIMO DOCE', image: 'photo-1551024506-0bccd828d307', alt: 'Sobremesa doce com cobertura' },
  ];
  let cleanup = () => {};

  const mount = () => {
    cleanup();
    const host = document.getElementById('offers-coupons-root');
    if (!host) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const used = new Set();
    host.innerHTML = coupons.map((coupon, index) => {
      const image = 'https://images.unsplash.com/' + coupon.image + '?auto=format&fit=crop&w=900&q=85';
      const rotation = index % 2 === 0 ? '2deg' : '-2deg';
      const search = [coupon.code, coupon.discount, coupon.detail, coupon.label].join(' ').toLocaleLowerCase('pt-BR');
      return '<article class="offer-coupon-fallback" data-offer-card="coupon" data-search="' + search + '" style="--ticket-image:url(\'' + image + '\');--ticket-rotate:' + rotation + '">' +
        '<div class="offer-coupon-fallback__body"><img src="' + image + '" alt="' + coupon.alt + '" />' +
        '<div class="offer-coupon-fallback__copy"><span>' + coupon.label + '</span><strong>' + coupon.discount + '</strong><p>' + coupon.detail + '</p>' +
        '<div><code>' + coupon.code + '</code><button type="button" data-copy="' + coupon.code + '" aria-label="Copiar cupom ' + coupon.code + '">Copiar código</button></div></div></div>' +
        '<span class="offer-coupon-fallback__perforation" aria-hidden="true"></span>' +
        '<span class="offer-coupon-fallback__tear-hint" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="5.5" cy="6" r="3"/><circle cx="5.5" cy="18" r="3"/><path d="m8 8 12 12M8 16 20 4m-8 4-2 2"/></svg><i>›</i></span>' +
        '<button class="offer-coupon-fallback__stub" type="button" aria-label="Arraste a aba para rasgar e resgatar o cupom ' + coupon.code + '" data-coupon="' + coupon.code + '"><span>' + coupon.label + '</span><strong>' + coupon.code + '</strong><small>PUXE PARA RASGAR</small></button></article>';
    }).join('');
    window.dispatchEvent(new Event('nuvora:offers-mounted'));

    host.addEventListener('click', async (event) => {
      const copy = event.target.closest('[data-copy]');
      if (!copy) return;
      try { await navigator.clipboard.writeText(copy.dataset.copy); } catch {}
      window.dispatchEvent(new CustomEvent('nuvora:coupon-copied', { detail: { code: copy.dataset.copy } }));
    }, options);

    host.querySelectorAll('.offer-coupon-fallback__stub').forEach((stub) => {
      let startX = 0;
      let dragging = false;
      const code = stub.dataset.coupon;
      const ticket = stub.closest('.offer-coupon-fallback');
      stub.addEventListener('pointerdown', (event) => {
        if (used.has(code) || event.button !== 0) return;
        startX = event.clientX;
        dragging = true;
        stub.setPointerCapture(event.pointerId);
        ticket.dataset.grabbing = '';
      }, options);
      stub.addEventListener('pointermove', (event) => {
        if (!dragging || used.has(code)) return;
        const distance = Math.max(0, Math.min(92, event.clientX - startX));
        stub.style.transform = 'translateX(' + distance + 'px) rotate(' + distance * 0.08 + 'deg)';
        if (distance > 56) {
          used.add(code);
          dragging = false;
          ticket.dataset.used = '';
          stub.setAttribute('aria-hidden', 'true');
          stub.tabIndex = -1;
          window.dispatchEvent(new CustomEvent('nuvora:coupon-redeemed', { detail: { code } }));
        }
      }, options);
      const finish = () => {
        dragging = false;
        delete ticket.dataset.grabbing;
        if (!used.has(code)) stub.style.transform = '';
      };
      stub.addEventListener('pointerup', finish, options);
      stub.addEventListener('pointercancel', finish, options);
      stub.addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key) || used.has(code)) return;
        event.preventDefault();
        used.add(code);
        ticket.dataset.used = '';
        stub.setAttribute('aria-hidden', 'true');
        stub.tabIndex = -1;
        window.dispatchEvent(new CustomEvent('nuvora:coupon-redeemed', { detail: { code } }));
      }, options);
    });

    cleanup = () => {
      controller.abort();
      host.replaceChildren();
      cleanup = () => {};
    };
  };

  window.addEventListener('nuvora:before-route-render', () => cleanup());
  window.addEventListener('nuvora:route-rendered', mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
