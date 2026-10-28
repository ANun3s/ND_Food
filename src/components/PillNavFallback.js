(() => {
  const restaurantCategories = ['Todos', 'Hambúrgueres', 'Pizzas', 'Japonesa', 'Açaí', 'Sobremesas', 'Bebidas', 'Sanduíches', 'Massas', 'Saladas', 'Cafés', 'Frutos do mar', 'Comida brasileira', 'Mexicana', 'Árabe', 'Tailandesa', 'Chinesa', 'Indiana', 'Coreana', 'Vegana', 'Padarias'];
  const offerCategories = [
    { label: 'Todas', value: 'all' },
    { label: 'Cupons', value: 'coupon' },
    { label: 'Pratos em oferta', value: 'dish' },
  ];
  let nav;
  let dispose = () => {};

  const remove = () => {
    dispose();
    dispose = () => {};
    nav?.remove();
    nav = null;
  };

  const mount = () => {
    remove();
    const host = document.querySelector('#restaurant-category-nav, #offers-category-nav');
    if (!host || host.querySelector('[data-react-pill-nav]')) return;
    const offerMode = host.id === 'offers-category-nav';
    const categories = offerMode ? offerCategories.map((item) => item.label) : restaurantCategories;
    nav = document.createElement('nav');
    nav.className = 'pill-nav';
    nav.dataset.layout = 'joined';
    nav.dataset.items = 'pill';
    nav.dataset.hoverEffect = 'fill';
    nav.style.setProperty('--pn-pill', '#ed4c43');
    nav.style.setProperty('--pn-pill-ink', '#fff');
    nav.setAttribute('aria-label', offerMode ? 'Categorias de ofertas' : 'Categorias de restaurantes');
    const [routeName, routeCategory = ''] = window.location.hash.replace(/^#\/?/, '').split('/');
    let selectedCategory = 'Todos';
    if (!offerMode && routeName === 'restaurantes' && routeCategory) {
      try { selectedCategory = decodeURIComponent(routeCategory); } catch { selectedCategory = routeCategory; }
    }
    const selectedIndex = Math.max(0, categories.indexOf(selectedCategory));
    nav.innerHTML = `<div class="pill-nav__bar"><div class="pill-nav__track"><ul class="pill-nav__list">${categories.map((label, index) => `<li class="pill-nav__slot"${index === selectedIndex ? ' data-active=""' : ''}><button class="pill-nav__item" type="button" aria-pressed="${index === selectedIndex}"${index === selectedIndex ? ' aria-current="true"' : ''}><span class="pill-nav__fill" aria-hidden="true"></span><span class="pill-nav__face">${label}</span><span class="pill-nav__face-alt" aria-hidden="true">${label}</span></button></li>`).join('')}</ul><span class="pill-nav__dot" aria-hidden="true"></span></div></div>`;
    host.append(nav);

    const slots = [...nav.querySelectorAll('.pill-nav__slot')];
    const buttons = [...nav.querySelectorAll('.pill-nav__item')];
    const dot = nav.querySelector('.pill-nav__dot');
    const positionDot = (index) => {
      const track = nav.querySelector('.pill-nav__track');
      const trackRect = track.getBoundingClientRect();
      const buttonRect = buttons[index].getBoundingClientRect();
      dot.style.transform = `translate3d(${buttonRect.left - trackRect.left + buttonRect.width / 2}px,0,0)`;
      const container = host;
      const containerRect = container.getBoundingClientRect();
      if (buttonRect.left < containerRect.left) container.scrollLeft -= containerRect.left - buttonRect.left;
      else if (buttonRect.right > containerRect.right) container.scrollLeft += buttonRect.right - containerRect.right;
    };
    const resize = new ResizeObserver(() => {
      const selected = buttons.findIndex((button) => button.getAttribute('aria-pressed') === 'true');
      if (selected >= 0) positionDot(selected);
    });
    resize.observe(nav);
    dispose = () => resize.disconnect();
    positionDot(selectedIndex);

    buttons.forEach((button, index) => {
      button.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'touch') slots[index].dataset.hover = '';
      });
      button.addEventListener('pointerleave', () => {
        if (document.activeElement !== button) delete slots[index].dataset.hover;
      });
      button.addEventListener('focus', () => { slots[index].dataset.hover = ''; });
      button.addEventListener('blur', () => {
        if (!button.matches(':hover')) delete slots[index].dataset.hover;
      });
      button.addEventListener('click', () => {
        buttons.forEach((item, itemIndex) => {
          const active = itemIndex === index;
          item.setAttribute('aria-pressed', String(active));
          if (active) item.setAttribute('aria-current', 'true');
          else item.removeAttribute('aria-current');
          if (active) slots[itemIndex].setAttribute('data-active', '');
          else slots[itemIndex].removeAttribute('data-active');
        });
        positionDot(index);
        if (offerMode) {
          window.dispatchEvent(new CustomEvent('nuvora:offer-filter-change', { detail: offerCategories[index].value }));
          return;
        }
        const route = categories[index] === 'Todos'
          ? '#/restaurantes'
          : `#/restaurantes/${encodeURIComponent(categories[index])}`;
        window.history.replaceState(null, '', route);
        window.dispatchEvent(new CustomEvent('nuvora:restaurant-category-change', { detail: categories[index] }));
      });
    });
  };

  window.addEventListener('nuvora:before-route-render', remove);
  window.addEventListener('nuvora:route-rendered', mount);
  window.NuvoraPillNavFallback = { unmount: remove };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
