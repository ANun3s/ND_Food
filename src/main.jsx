import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Dock from './components/Dock.jsx';
import GlassIcons from './components/GlassIcons.jsx';
import PillNav from './components/PillNav.jsx';
import Topography from './components/Topography.jsx';
import OfferCoupons from './components/OfferCoupons.jsx';
import RubberSegment from './components/RubberSegment.jsx';
import IPhoneShowcase from './components/AppleIPhone17ProMax.jsx';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Hamburger01Icon, Pizza01Icon, Sushi01Icon, IceCreamBowlIcon, CakeSliceIcon, SoftDrink01Icon,
  SandwichIcon, NoodlesIcon, SaladIcon, Coffee01Icon, ShrimpIcon, RiceBowl01Icon,
  Taco01Icon, ChefHatIcon, SoupIcon, RiceBowl02Icon, ChickenThighsIcon, VeganIcon, Bread01Icon,
} from '@hugeicons/core-free-icons';

window.__nuvoraReactMode = true;
window.__nuvoraStopReviewTopographyFallback?.();
const root = createRoot(document.getElementById('dock-root'));
const iphoneShowcaseHost = document.getElementById('iphone-showcase-root');
if (iphoneShowcaseHost && window.self === window.top) {
  iphoneShowcaseHost.replaceChildren();
  createRoot(iphoneShowcaseHost).render(<IPhoneShowcase />);
}
let topographyRoot = null;
let topographyHost = null;

const unmountReviewTopography = () => {
  topographyRoot?.unmount();
  topographyRoot = null;
  topographyHost = null;
};

const mountReviewTopography = () => {
  const host = document.querySelector('#reviews-topography-root');
  if (!host) return unmountReviewTopography();
  if (host === topographyHost) return;
  unmountReviewTopography();
  host.replaceChildren();
  topographyHost = host;
  topographyRoot = createRoot(host);
  topographyRoot.render(<Topography color="#ef4444" lineCount={22} lineWidth={1.2} elevation={1} foreground={0.2} tilt={32} speed={0.25} direction="forward" glow={0.6} depthOfField={0.4} fog={0.35} hoverEffect="lift" clickEffect="pulse" />);
};

window.addEventListener('nuvora:before-route-render', unmountReviewTopography);
window.addEventListener('nuvora:route-rendered', mountReviewTopography);
mountReviewTopography();

let authModeRoot = null;
let authModeHost = null;

const unmountAuthMode = () => {
  authModeRoot?.unmount();
  authModeRoot = null;
  authModeHost = null;
};

const mountAuthMode = () => {
  const host = document.getElementById('auth-mode-switch');
  if (!host) {
    unmountAuthMode();
    return;
  }
  if (host === authModeHost) return;
  unmountAuthMode();
  host.replaceChildren();
  authModeHost = host;
  authModeRoot = createRoot(host);
  authModeRoot.render(
    <RubberSegment
      items={['Entrar', 'Criar conta']}
      defaultValue={host.dataset.currentValue || 'Entrar'}
      onChange={(value, index) => {
        document.dispatchEvent(new CustomEvent('nuvora:auth-mode-change', { detail: { value, index } }));
      }}
      trackColor="#27272a"
      thumbColor="#fafafa"
      textColor="#fafafa"
      activeTextColor="#18181b"
      size="md"
      radius={10}
      inset={3}
      equalSlots
      stretch={100}
      squash={3}
      speed={1}
      glide={75}
      draggable
      ariaLabel="Alternar entre entrar e criar conta"
    />,
  );
};

window.addEventListener('nuvora:before-route-render', unmountAuthMode);
window.addEventListener('nuvora:route-rendered', mountAuthMode);
mountAuthMode();

let burgerSceneRoot = null;
let burgerSceneHost = null;

let offerCouponsRoot = null;
let offerCouponsHost = null;

const unmountOfferCoupons = () => {
  offerCouponsRoot?.unmount();
  offerCouponsRoot = null;
  offerCouponsHost = null;
};

const mountOfferCoupons = () => {
  const host = document.getElementById('offers-coupons-root');
  if (!host) {
    unmountOfferCoupons();
    return;
  }
  if (host === offerCouponsHost) return;
  unmountOfferCoupons();
  host.replaceChildren();
  offerCouponsHost = host;
  offerCouponsRoot = createRoot(host);
  offerCouponsRoot.render(<OfferCoupons />);
};

window.addEventListener('nuvora:before-route-render', unmountOfferCoupons);
window.addEventListener('nuvora:route-rendered', mountOfferCoupons);
mountOfferCoupons();

const unmountBurgerScene = () => {
  burgerSceneRoot?.unmount();
  burgerSceneRoot = null;
  burgerSceneHost = null;
};

const mountBurgerScene = () => {
  const host = document.getElementById('burger-scene-root');
  if (!host || host.closest('[hidden]')) {
    unmountBurgerScene();
    return;
  }
  if (host === burgerSceneHost) return;
  unmountBurgerScene();
  burgerSceneHost = host;
  burgerSceneRoot = createRoot(host);
  const rootForHost = burgerSceneRoot;
  import('./components/BurgerScrollScene.jsx').then(({ default: BurgerScrollScene }) => {
    if (host === burgerSceneHost && rootForHost === burgerSceneRoot) {
      rootForHost.render(<BurgerScrollScene />);
    }
  }).catch(() => {
    if (host !== burgerSceneHost || rootForHost !== burgerSceneRoot) return;
    host.classList.add('burger-webgl-fallback');
    host.closest('[data-burger-story]')?.classList.add('burger-story--static');
  });
};

window.addEventListener('nuvora:before-route-render', unmountBurgerScene);
window.addEventListener('nuvora:route-rendered', mountBurgerScene);
mountBurgerScene();

flushSync(() => root.render(
  <>
    <Dock />
  </>,
));

const restaurantCategoryItems = ['Todos', 'Hambúrgueres', 'Pizzas', 'Japonesa', 'Açaí', 'Sobremesas', 'Bebidas', 'Sanduíches', 'Massas', 'Saladas', 'Cafés', 'Frutos do mar', 'Comida brasileira', 'Mexicana', 'Árabe', 'Tailandesa', 'Chinesa', 'Indiana', 'Coreana', 'Vegana', 'Padarias']
  .map((label) => ({ label }));
let restaurantCategoryRoot = null;
let restaurantCategoryHost = null;

const unmountRestaurantCategoryNav = () => {
  restaurantCategoryRoot?.unmount();
  restaurantCategoryRoot = null;
  restaurantCategoryHost = null;
};

const mountRestaurantCategoryNav = () => {
  const host = document.getElementById('restaurant-category-nav');
  if (!host) {
    unmountRestaurantCategoryNav();
    return;
  }
  if (host === restaurantCategoryHost) return;
  unmountRestaurantCategoryNav();
  window.NuvoraPillNavFallback?.unmount?.();
  host.replaceChildren();
  restaurantCategoryHost = host;
  restaurantCategoryRoot = createRoot(host);
  const [routeName, routeCategory = ''] = window.location.hash.replace(/^#\/?/, '').split('/');
  let selectedCategory = 'Todos';
  if (routeName === 'restaurantes' && routeCategory) {
    try { selectedCategory = decodeURIComponent(routeCategory); } catch { selectedCategory = routeCategory; }
  }
  const selectedIndex = Math.max(0, restaurantCategoryItems.findIndex((item) => item.label === selectedCategory));
  restaurantCategoryRoot.render(
    <PillNav
      items={restaurantCategoryItems}
      defaultActiveIndex={selectedIndex}
      itemStyle="pill"
      hoverEffect="fill"
      indicator="dot"
      theme="light"
      layout="joined"
      surface="none"
      size="md"
      highlightColor="#ed4c43"
      highlightTextColor="#ffffff"
      onItemClick={(item, _index, event) => {
        event.preventDefault();
        const route = item.label === 'Todos'
          ? '#/restaurantes'
          : `#/restaurantes/${encodeURIComponent(item.label)}`;
        window.history.replaceState(null, '', route);
        window.dispatchEvent(new CustomEvent('nuvora:restaurant-category-change', { detail: item.label }));
      }}
      ariaLabel="Categorias de restaurantes"
    />,
  );
};

window.addEventListener('nuvora:before-route-render', unmountRestaurantCategoryNav);
window.addEventListener('nuvora:route-rendered', mountRestaurantCategoryNav);
mountRestaurantCategoryNav();

const offerCategoryItems = [
  { label: 'Todas', value: 'all' },
  { label: 'Cupons', value: 'coupon' },
  { label: 'Pratos em oferta', value: 'dish' },
];
let offerCategoryRoot = null;
let offerCategoryHost = null;

const unmountOfferCategoryNav = () => {
  offerCategoryRoot?.unmount();
  offerCategoryRoot = null;
  offerCategoryHost = null;
};

const mountOfferCategoryNav = () => {
  const host = document.getElementById('offers-category-nav');
  if (!host) {
    unmountOfferCategoryNav();
    return;
  }
  if (host === offerCategoryHost) return;
  unmountOfferCategoryNav();
  window.NuvoraPillNavFallback?.unmount?.();
  host.replaceChildren();
  offerCategoryHost = host;
  offerCategoryRoot = createRoot(host);
  offerCategoryRoot.render(
    <PillNav
      items={offerCategoryItems}
      defaultActiveIndex={0}
      itemStyle="pill"
      hoverEffect="fill"
      indicator="dot"
      theme="light"
      layout="joined"
      surface="none"
      size="md"
      highlightColor="#ed4c43"
      highlightTextColor="#ffffff"
      onItemClick={(item) => {
        window.dispatchEvent(new CustomEvent('nuvora:offer-filter-change', { detail: item.value }));
      }}
      ariaLabel="Categorias de ofertas"
    />,
  );
};

window.addEventListener('nuvora:before-route-render', unmountOfferCategoryNav);
window.addEventListener('nuvora:route-rendered', mountOfferCategoryNav);
mountOfferCategoryNav();

const categoryIcons = {
  hamburger: Hamburger01Icon,
  pizza: Pizza01Icon,
  sushi: Sushi01Icon,
  acai: IceCreamBowlIcon,
  dessert: CakeSliceIcon,
  drink: SoftDrink01Icon,
  sandwich: SandwichIcon,
  pasta: NoodlesIcon,
  salad: SaladIcon,
  coffee: Coffee01Icon,
  seafood: ShrimpIcon,
  brazilian: RiceBowl01Icon,
  mexican: Taco01Icon,
  arabic: ChefHatIcon,
  thai: SoupIcon,
  chinese: RiceBowl02Icon,
  indian: RiceBowl02Icon,
  korean: ChickenThighsIcon,
  vegan: VeganIcon,
  bakery: Bread01Icon,
};
const categoryData = JSON.parse(document.getElementById('food-categories-data').textContent);
const categoryFilters = {
  hamburger: 'Hambúrgueres',
  pizza: 'Pizzas',
  sushi: 'Japonesa',
  acai: 'Açaí',
  dessert: 'Sobremesas',
  drink: 'Bebidas',
  sandwich: 'Sanduíches',
  pasta: 'Massas',
  salad: 'Saladas',
  coffee: 'Cafés',
  seafood: 'Frutos do mar',
  brazilian: 'Comida brasileira',
  mexican: 'Mexicana',
  arabic: 'Árabe',
  thai: 'Tailandesa',
  chinese: 'Chinesa',
  indian: 'Indiana',
  korean: 'Coreana',
  vegan: 'Vegana',
  bakery: 'Padarias',
};
const categories = categoryData.map((item) => ({
  ...item,
  href: `#/restaurantes/${encodeURIComponent(categoryFilters[item.icon] || item.label)}`,
  icon: <HugeiconsIcon icon={categoryIcons[item.icon]} size="1.7em" strokeWidth={1.6} />,
}));

window.NuvoraGlassIconsFallback?.unmount?.();
const categoriesRoot = createRoot(document.getElementById('glass-icons-root'));
categoriesRoot.render(
  <GlassIcons
    items={categories}
    size={96}
    gap={26}
    columns={12}
    roundness={0.6}
    refraction={0.8}
    bevel={0.6}
    dispersion={0}
    frost={0.2}
    shine={0.85}
    tint="#dfdfdf"
    tintOpacity={0.08}
    iconColor="#ffffff"
    plate="tilt"
    tilt={30}
    spread={0.5}
    hover="press"
    parallax={1}
    labels="hover"
    intro={true}
    theme="dark"
  />,
);
