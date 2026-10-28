import { renderAuthPage } from './src/components/AuthPage.js';
import { getRestaurantMenu } from './src/data/restaurantMenus.js';

const homePage = document.querySelector('main.page:not(.route-page)');
const routeScreen = document.querySelector('#route-screen');
const toast = document.querySelector('.toast');
const foodGridTemplate = homePage.querySelector('.food-grid').innerHTML;
const restaurantCardsTemplate = [...homePage.querySelectorAll('.restaurant-card')];
const restaurants = [
  { id: 'burger', name: 'The Burger House', category: 'Hambúrgueres', rating: 4.9, minutes: 30, free: true, product: 0, reviews: '2,4 mil avaliações', mark: 'B', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=85' },
  { id: 'forneria', name: 'Forneria da Vila', category: 'Pizzas', rating: 4.8, minutes: 40, free: false, product: 1, reviews: '1,8 mil avaliações', mark: 'F', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1200&q=85' },
  { id: 'sushi', name: 'Yū Sushi', category: 'Japonesa', rating: 4.9, minutes: 35, free: true, product: 2, reviews: '980 avaliações', mark: 'Yū', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=85' },
  { id: 'acai', name: 'Açaí & Cia', category: 'Açaí', rating: 4.7, minutes: 20, free: false, deliveryFee: 4.9, product: 3, reviews: '740 avaliações', mark: 'a.', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=85' },
  { id: 'brasa', name: 'Brasa Nobre', category: 'Hambúrgueres', rating: 4.9, minutes: 32, free: true, product: 0, reviews: '1,6 mil avaliações', mark: 'BN', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85' },
  { id: 'bella-pizza', name: 'Bella Forno', category: 'Pizzas', rating: 4.8, minutes: 38, free: false, product: 1, reviews: '1,2 mil avaliações', mark: 'BF', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85' },
  { id: 'nori-house', name: 'Nori House', category: 'Japonesa', rating: 4.8, minutes: 34, free: true, product: 2, reviews: '860 avaliações', mark: 'N', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=85' },
  { id: 'berry-bowl', name: 'Berry Bowl', category: 'Açaí', rating: 4.7, minutes: 22, free: false, product: 3, reviews: '620 avaliações', mark: 'BB', image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=85' },
  { id: 'quintal-burger', name: 'Quintal Burger', category: 'Hambúrgueres', rating: 4.8, minutes: 28, free: true, product: 0, reviews: '540 avaliações', mark: 'QB', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85' },
  { id: 'oliva-pizza', name: 'Oliva Pizzaria', category: 'Pizzas', rating: 4.7, minutes: 36, free: false, product: 1, reviews: '430 avaliações', mark: 'OP', image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85' },
  { id: 'tokyo-temaki', name: 'Tokyo Temaki', category: 'Japonesa', rating: 4.9, minutes: 32, free: true, product: 2, reviews: '710 avaliações', mark: 'TT', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1200&q=85' },
  { id: 'acai-bosque', name: 'Açaí do Bosque', category: 'Açaí', rating: 4.8, minutes: 21, free: true, product: 3, reviews: '390 avaliações', mark: 'AB', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=85' },
  { id: 'doce-nuvem', name: 'Doce Nuvem', category: 'Sobremesas', rating: 4.9, minutes: 25, free: false, product: 3, reviews: '680 avaliações', mark: 'DN', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85' },
  { id: 'cafe-bossa', name: 'Café Bossa', category: 'Bebidas', rating: 4.6, minutes: 24, free: false, product: 3, reviews: '320 avaliações', mark: 'CB', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85' },
  { id: 'taco-libre', name: 'Taco Libre', category: 'Mexicana', rating: 4.9, minutes: 29, free: true, product: 0, reviews: '860 avaliações', mark: 'TL', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=85' },
  { id: 'casa-jalapeno', name: 'Casa Jalapeño', category: 'Mexicana', rating: 4.7, minutes: 34, free: false, product: 0, reviews: '520 avaliações', mark: 'CJ', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=85' },
  { id: 'cedro-zaatar', name: 'Cedro & Zaatar', category: 'Árabe', rating: 4.9, minutes: 31, free: true, product: 0, reviews: '740 avaliações', mark: 'CZ', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=85' },
  { id: 'falafel-bairro', name: 'Falafel do Bairro', category: 'Árabe', rating: 4.8, minutes: 27, free: false, product: 3, reviews: '410 avaliações', mark: 'FB', image: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb4?auto=format&fit=crop&w=1200&q=85' },
  { id: 'bangkok-bowl', name: 'Bangkok Bowl', category: 'Tailandesa', rating: 4.9, minutes: 35, free: false, product: 2, reviews: '690 avaliações', mark: 'BB', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=85' },
  { id: 'siam-thai', name: 'Siam Thai Kitchen', category: 'Tailandesa', rating: 4.7, minutes: 38, free: true, product: 2, reviews: '380 avaliações', mark: 'ST', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1200&q=85' },
  { id: 'bao-wok', name: 'Bao & Wok', category: 'Chinesa', rating: 4.8, minutes: 30, free: true, product: 2, reviews: '620 avaliações', mark: 'BW', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=85' },
  { id: 'dragao-dourado', name: 'Dragão Dourado', category: 'Chinesa', rating: 4.6, minutes: 36, free: false, product: 2, reviews: '450 avaliações', mark: 'DD', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=1200&q=85' },
  { id: 'masala-house', name: 'Masala House', category: 'Indiana', rating: 4.9, minutes: 33, free: true, product: 2, reviews: '780 avaliações', mark: 'MH', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=85' },
  { id: 'curry-cia', name: 'Curry & Cia', category: 'Indiana', rating: 4.7, minutes: 37, free: false, product: 2, reviews: '390 avaliações', mark: 'CC', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=85' },
  { id: 'seoul-table', name: 'Seoul Table', category: 'Coreana', rating: 4.9, minutes: 32, free: false, product: 0, reviews: '830 avaliações', mark: 'ST', image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=85' },
  { id: 'kimchi-house', name: 'Kimchi House', category: 'Coreana', rating: 4.8, minutes: 35, free: true, product: 0, reviews: '570 avaliações', mark: 'KH', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=85' },
  { id: 'verde-raiz', name: 'Verde Raiz', category: 'Vegana', rating: 4.9, minutes: 26, free: true, product: 3, reviews: '710 avaliações', mark: 'VR', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85' },
  { id: 'grao-vivo', name: 'Grão Vivo', category: 'Vegana', rating: 4.7, minutes: 28, free: false, product: 3, reviews: '360 avaliações', mark: 'GV', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85' },
  { id: 'pao-afeto', name: 'Pão de Afeto', category: 'Padarias', rating: 4.9, minutes: 22, free: false, product: 3, reviews: '640 avaliações', mark: 'PA', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85' },
  { id: 'forno-casa', name: 'Forno de Casa', category: 'Padarias', rating: 4.8, minutes: 24, free: true, product: 3, reviews: '480 avaliações', mark: 'FC', image: 'https://images.unsplash.com/photo-1608198093002-ad4e0054845b?auto=format&fit=crop&w=1200&q=85' },
  { id: 'pao-companhia', name: 'Pão & Companhia', category: 'Sanduíches', rating: 4.8, minutes: 27, free: true, product: 0, reviews: '520 avaliações', mark: 'PC', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=85' },
  { id: 'central-sanduba', name: 'Central do Sanduba', category: 'Sanduíches', rating: 4.7, minutes: 30, free: false, product: 0, reviews: '390 avaliações', mark: 'CS', image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=1200&q=85' },
  { id: 'massa-nonna', name: 'Massa da Nonna', category: 'Massas', rating: 4.9, minutes: 36, free: true, product: 1, reviews: '810 avaliações', mark: 'MN', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85' },
  { id: 'trattoria-primavera', name: 'Trattoria Primavera', category: 'Massas', rating: 4.8, minutes: 39, free: false, product: 1, reviews: '470 avaliações', mark: 'TP', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=85' },
  { id: 'folha-viva', name: 'Folha Viva', category: 'Saladas', rating: 4.9, minutes: 24, free: true, product: 3, reviews: '610 avaliações', mark: 'FV', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85' },
  { id: 'verde-grao', name: 'Verde & Grão', category: 'Saladas', rating: 4.7, minutes: 27, free: false, product: 3, reviews: '350 avaliações', mark: 'VG', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85' },
  { id: 'cafe-aurora', name: 'Café Aurora', category: 'Cafés', rating: 4.9, minutes: 23, free: true, product: 3, reviews: '720 avaliações', mark: 'CA', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85' },
  { id: 'grao-vila', name: 'Grão da Vila', category: 'Cafés', rating: 4.8, minutes: 25, free: false, product: 3, reviews: '440 avaliações', mark: 'GV', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=85' },
  { id: 'mare-alta', name: 'Maré Alta', category: 'Frutos do mar', rating: 4.9, minutes: 42, free: true, product: 2, reviews: '930 avaliações', mark: 'MA', image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=85' },
  { id: 'porto-peixe', name: 'Porto do Peixe', category: 'Frutos do mar', rating: 4.7, minutes: 45, free: false, product: 2, reviews: '510 avaliações', mark: 'PP', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=85' },
  { id: 'tempero-roca', name: 'Tempero da Roça', category: 'Comida brasileira', rating: 4.9, minutes: 34, free: true, product: 3, reviews: '1,1 mil avaliações', mark: 'TR', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85' },
  { id: 'casa-brasil', name: 'Casa do Brasil', category: 'Comida brasileira', rating: 4.8, minutes: 37, free: false, product: 3, reviews: '690 avaliações', mark: 'CB', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85' },
];
const featuredRestaurantIds = new Set(['burger', 'sushi', 'forneria', 'brasa', 'nori-house']);
const restaurantCategoryImages = (() => {
  try {
    const categories = JSON.parse(document.querySelector('#food-categories-data')?.textContent || '[]');
    return new Map(categories.map((category) => [category.label === 'Comida japonesa' ? 'Japonesa' : category.label, category.image]));
  } catch {
    return new Map();
  }
})();
const restaurantFoodMarks = {
  'Hambúrgueres': ['🍔', '#bd5a38', '#f2c17b'], Pizzas: ['🍕', '#d9804c', '#f5c28a'], Japonesa: ['🍣', '#546f82', '#b8d1c9'],
  'Açaí': ['🍇', '#6d5b8e', '#c0a1d5'], Sobremesas: ['🍰', '#bd6d7b', '#f1c5b4'], Bebidas: ['🥤', '#58939a', '#b4d9cb'],
  'Sanduíches': ['🥪', '#b67a43', '#eacb8c'], Massas: ['🍝', '#c56a40', '#f2b179'], Saladas: ['🥗', '#62916b', '#c4d5a2'],
  'Cafés': ['☕', '#806651', '#d3b88f'], 'Frutos do mar': ['🦐', '#4f8490', '#acd2d1'], 'Comida brasileira': ['🍲', '#66845a', '#e3c27c'],
  Mexicana: ['🌮', '#c76f3d', '#efbd70'], 'Árabe': ['🧆', '#9a7651', '#e0bd85'], Tailandesa: ['🍜', '#6b8561', '#e4c27d'],
  Chinesa: ['🥡', '#b65345', '#edbd7f'], Indiana: ['🍛', '#ba7042', '#e8be75'], Coreana: ['🍱', '#74615f', '#deb4a3'],
  Vegana: ['🥑', '#5d8966', '#bed29a'], Padarias: ['🥐', '#a96f43', '#e9bf82'],
};
const defaultRestaurantImage = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=85';

function getRestaurantImageSources(restaurant) {
  const categoryImage = restaurantCategoryImages.get(restaurant.category);
  const [emoji, deepColor, lightColor] = restaurantFoodMarks[restaurant.category] || ['🍽️', '#927d69', '#e2cbaa'];
  const svgName = restaurant.name.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${deepColor}"/><stop offset="1" stop-color="${lightColor}"/></linearGradient></defs><rect width="900" height="560" fill="url(#g)"/><circle cx="450" cy="250" r="150" fill="#ffffff" fill-opacity=".16"/><text x="450" y="290" text-anchor="middle" font-size="150">${emoji}</text><text x="450" y="465" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="36" font-weight="700">${svgName}</text><text x="450" y="510" text-anchor="middle" fill="#fff" fill-opacity=".82" font-family="Arial,sans-serif" font-size="19">${restaurant.category}</text></svg>`;
  const localFallback = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvg)}`;
  return [...new Set([restaurant.image, categoryImage, defaultRestaurantImage, localFallback].filter(Boolean))];
}

function setRestaurantImage(image, restaurant) {
  const sources = getRestaurantImageSources(restaurant);
  image.dataset.restaurantImage = restaurant.id;
  image.dataset.imageFallbackAttempt = '0';
  image.src = sources[0];
}

function recoverRestaurantImage(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const restaurantId = image.dataset.restaurantImage || image.closest('[data-restaurant]')?.dataset.restaurant;
  if (!restaurantId) return;
  const restaurant = restaurants.find((item) => item.id === restaurantId);
  if (!restaurant) return;
  image.dataset.restaurantImage = restaurant.id;
  const sources = getRestaurantImageSources(restaurant);
  const attempt = Number(image.dataset.imageFallbackAttempt || 0);
  if (attempt + 1 < sources.length) {
    image.dataset.imageFallbackAttempt = String(attempt + 1);
    image.src = sources[attempt + 1];
  } else {
    image.removeAttribute('src');
    image.classList.add('restaurant-image-unavailable');
  }
}

document.addEventListener('error', recoverRestaurantImage, true);
document.querySelectorAll('.restaurant-card[data-restaurant] img').forEach((image) => {
  image.dataset.restaurantImage = image.closest('.restaurant-card').dataset.restaurant;
  image.dataset.imageFallbackAttempt = '0';
  if (image.complete && image.naturalWidth === 0) recoverRestaurantImage({ target: image });
});
const productDetails = [
  { name: 'Smash da casa', price: '29,90', oldPrice: '36,90' },
  { name: 'Pizza Margherita', price: '49,90', oldPrice: '59,90' },
  { name: 'Combo Sushi Lovers', price: '64,90', oldPrice: '79,90' },
  { name: 'Açaí do seu jeito', price: '22,90', oldPrice: '27,90' },
];
const productCards = [...homePage.querySelectorAll('.food-card')];
const cartStorageKey = 'nuvora-cart';
const favoritesStorageKey = 'nd-food-favorites';
const addressSessionStorageKey = 'nd-food-address';
const ordersStorageKey = 'nd-food-orders';
const couponSessionStorageKey = 'nd-food-coupon';
const cart = readStoredCart();
const favoriteDetails = new Map();
const favorites = readStoredFavorites();
const couponRules = {
  BEMVINDO10: { type: 'fixed', value: 10, minimum: 39 },
  SABOR15: { type: 'percent', value: 0.15, minimum: 50 },
  ENTREGAZERO: { type: 'delivery', value: 0, minimum: 0 },
  DOCEND: { type: 'percent', value: 0.2, minimum: 20 },
};
let activeCoupon = readSessionValue(couponSessionStorageKey)?.toUpperCase() || '';
let toastTimer;
let reviewTopographyFallbackCleanup = () => {};
let selectedCategory = 'Todos';
let selectedOfferType = 'all';
let currentRestaurant = restaurants[0];
let modalOpener = null;
let pendingCheckout = false;

function readStoredCart() {
  try {
    const items = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    const validItems = Array.isArray(items)
      ? items.filter(([key, item]) => typeof key === 'string' && item && Number(item.quantity) > 0)
      : [];
    return new Map(validItems);
  } catch {
    return new Map();
  }
}

function readStoredFavorites() {
  try {
    const items = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]');
    if (!Array.isArray(items)) return new Set();
    const keys = items.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item.key === 'string') {
        favoriteDetails.set(item.key, item);
        return item.key;
      }
      return null;
    }).filter(Boolean);
    return new Set(keys);
  } catch {
    return new Set();
  }
}

function readSessionValue(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function saveSessionValue(key, value) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ordersStorageKey) || '[]');
    return Array.isArray(orders) ? orders.filter((order) => order && Array.isArray(order.items)) : [];
  } catch {
    return [];
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
}

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const formatPrice = (value) => Number(value).toFixed(2).replace('.', ',');
const formatCurrency = (value) => `R$ ${formatPrice(value)}`;
const slug = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function getCartTotals(items = [...cart.values()]) {
  const subtotal = items.reduce((sum, item) => sum + Number(String(item.price).replace(',', '.')) * Number(item.quantity || 0), 0);
  const selectedRestaurants = [...new Map(items.map((item) => restaurants.find((restaurant) => restaurant.name === item.restaurant)).filter(Boolean).map((restaurant) => [restaurant.id, restaurant])).values()];
  let delivery = items.length
    ? (selectedRestaurants.length ? selectedRestaurants.reduce((sum, restaurant) => sum + (restaurant.free ? 0 : Number(restaurant.deliveryFee ?? 5.9)), 0) : 5.9)
    : 0;
  let discount = 0;
  const coupon = couponRules[activeCoupon];
  if (coupon && subtotal >= coupon.minimum) {
    if (coupon.type === 'delivery') {
      discount = delivery;
      delivery = 0;
    } else if (coupon.type === 'fixed') discount = coupon.value;
    else discount = subtotal * coupon.value;
  }
  discount = Math.min(subtotal + delivery, discount);
  return { subtotal, delivery, discount, total: Math.max(0, subtotal + delivery - discount) };
}

function getDeliveryWindow(items = [...cart.values()]) {
  const selected = items.map((item) => restaurants.find((restaurant) => restaurant.name === item.restaurant)).filter(Boolean);
  if (!selected.length) return '30–45 min';
  const fastest = Math.min(...selected.map((restaurant) => restaurant.minutes));
  const slowest = Math.max(...selected.map((restaurant) => restaurant.minutes)) + 10;
  return `${fastest}–${slowest} min`;
}

function favoriteKeyFor(button) {
  if (button.dataset.favoriteKey) return button.dataset.favoriteKey;
  const card = button.closest('.food-card, .restaurant-card');
  const restaurantCard = card?.classList.contains('restaurant-card');
  if (restaurantCard) return `restaurant:${card.dataset.restaurant || slug(card.querySelector('h3')?.textContent || 'restaurante')}`;
  const restaurantName = card?.dataset.restaurantName || card?.querySelector('.restaurant-name')?.textContent.trim() || '';
  const restaurant = restaurants.find((item) => item.name === restaurantName);
  const restaurantId = restaurant?.id || slug(restaurantName || 'nd-food');
  const itemName = card?.querySelector('h3')?.textContent.trim() || 'prato';
  return `product:${restaurantId}:${slug(itemName)}`;
}

function syncFavoriteButtons(root = document) {
  root.querySelectorAll('.favorite').forEach((button) => {
    const saved = favorites.has(favoriteKeyFor(button));
    const name = button.closest('.food-card, .restaurant-card')?.querySelector('h3')?.textContent.trim() || 'item';
    button.type = 'button';
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remover' : 'Favoritar'} ${name} ${saved ? 'dos favoritos' : ''}`.trim());
    button.textContent = saved ? '♥' : '♡';
  });
  const count = document.querySelector('[data-favorite-count]');
  if (count) count.textContent = String(favorites.size);
}

function saveFavorites() {
  try {
    const values = [...favorites].map((key) => favoriteDetails.get(key) || key);
    localStorage.setItem(favoritesStorageKey, JSON.stringify(values));
    return true;
  } catch {
    return false;
  }
}

function setAddressButton(address) {
  const button = document.querySelector('.location-button');
  if (!button) return;
  const label = button.querySelector('.dock-label');
  const normalized = address?.trim();
  button.setAttribute('aria-label', normalized ? `Alterar endereço de entrega: ${normalized}` : 'Adicionar endereço de entrega');
  button.title = normalized ? `Endereço de entrega: ${normalized}` : 'Adicionar endereço de entrega';
  if (label) label.textContent = normalized ? 'Endereço salvo' : 'Adicionar endereço';
}

function savedAddress() {
  return readSessionValue(addressSessionStorageKey)?.trim() || '';
}

function updateCartCount() {
  const count = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  const countElement = document.querySelector('#cart-count');
  if (countElement) countElement.textContent = count;
  document.querySelector('.cart-button').setAttribute('aria-label', `Sacola, ${count} ${count === 1 ? 'item' : 'itens'}`);
  window.dispatchEvent(new CustomEvent('nuvora:cart-change', { detail: { count } }));
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify([...cart.entries()]));
  } catch {
    // The cart remains usable for the current session if storage is unavailable.
  }
}

function addProduct(name, trigger = null) {
  const card = trigger?.closest('.food-card') || productCards.find((item) => item.querySelector('h3')?.textContent.trim() === name);
  if (!card) return;
  const title = name;
  const detail = productDetails.find((item) => item.name === title);
  const rawPrice = trigger?.dataset.productPrice;
  const price = detail?.price || (rawPrice ? formatPrice(rawPrice) : null);
  const image = card.querySelector('img')?.src;
  if (!price || !image) return;
  const key = trigger?.dataset.productKey || title;
  const restaurantName = card.dataset.restaurantName || card.querySelector('.restaurant-name')?.textContent.trim() || '';
  const existing = cart.get(key);
  cart.set(key, { name: title, restaurant: restaurantName, price, image, quantity: (existing?.quantity ?? 0) + 1 });
  updateCartCount();
  showToast(`${title} adicionado à sacola`);
  if (getRoute().name === 'sacola') renderRoute();
}

function getRestaurantCards(restaurantList = restaurants) {
  return restaurantList.map((restaurant) => {
    const template = restaurantCardsTemplate[restaurant.product] || restaurantCardsTemplate[0];
    const card = template.cloneNode(true);
    const image = card.querySelector('.restaurant-photo img');
    setRestaurantImage(image, restaurant);
    image.alt = `Pratos do ${restaurant.name}`;
    const mark = card.querySelector('.restaurant-mark');
    mark.textContent = restaurant.mark;
    card.querySelector('.restaurant-main h3').textContent = restaurant.name;
    card.querySelector('.restaurant-main p').textContent = restaurant.category;
    card.querySelector('.free-delivery')?.remove();
    card.querySelector('.restaurant-meta span').textContent = `${restaurant.minutes}–${restaurant.minutes + 10} min`;
    card.querySelector('.restaurant-meta strong').textContent = restaurant.free ? 'Entrega grátis' : `Frete R$ ${formatPrice(restaurant.deliveryFee ?? 5.9)}`;
    card.dataset.restaurant = restaurant.id;
    card.dataset.category = restaurant.category;
    const favoriteButton = card.querySelector('.favorite');
    if (favoriteButton) favoriteButton.dataset.favoriteKey = `restaurant:${restaurant.id}`;
    card.dataset.search = `${restaurant.name} ${restaurant.category}`.toLocaleLowerCase('pt-BR');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver cardápio do ${restaurant.name}`);
    return card.outerHTML;
  }).join('');
}

function getFeaturedRestaurants(category = 'Todos') {
  if (category === 'Todos') return restaurants.filter((restaurant) => featuredRestaurantIds.has(restaurant.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return restaurants
    .filter((restaurant) => restaurant.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 6);
}

function getFeaturedRestaurantCards(category = 'Todos') {
  const featured = getFeaturedRestaurants(category);
  return featured.map((restaurant, index) => {
    const category = restaurant.category;
    return `<article class="famous-stack__card" data-restaurant="${restaurant.id}" data-category="${category}" data-search="${`${restaurant.name} ${category}`.toLocaleLowerCase('pt-BR')}" aria-roledescription="restaurante">
      <img class="famous-stack__image" data-restaurant-image="${restaurant.id}" src="${getRestaurantImageSources(restaurant)[0]}" alt="Pratos do ${restaurant.name}" />
      <div class="famous-stack__shade"></div>
      <span class="famous-stack__position">${String(index + 1).padStart(2, '0')} / ${String(featured.length).padStart(2, '0')}</span>
      <div class="famous-stack__content"><p class="famous-stack__eyebrow">ESCOLHA DA ND FOOD</p><h3>${restaurant.name}</h3><p>${category}</p><a href="#/restaurante/${restaurant.id}" aria-label="Ver cardápio do ${restaurant.name}">Ver cardápio <span aria-hidden="true">→</span></a></div>
    </article>`;
  }).join('');
}

function getRoute() {
  if (!location.hash.startsWith('#/')) return { name: 'inicio', id: '' };
  const [name = '', id = ''] = location.hash.slice(2).split('/');
  let decodedId = id;
  try { decodedId = decodeURIComponent(id); } catch { /* Keep malformed fragments usable as plain route IDs. */ }
  return { name: name || 'inicio', id: decodedId };
}

function sectionHeading(eyebrow, title, description) {
  return `<header class="route-heading"><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1">${title}</h1><p>${description}</p></header>`;
}

function renderRestaurantsPage() {
  const featured = getFeaturedRestaurants(selectedCategory);
  const categoryTitle = selectedCategory === 'Todos' ? 'Para inspirar sua escolha' : `Para descobrir · ${selectedCategory}`;
  const categoryDescription = selectedCategory === 'Todos'
    ? 'Restaurantes queridos, sabores novos e entrega no seu endereço.'
    : `Os melhores pedidos de ${selectedCategory}, preparados na hora.`;
  return `${sectionHeading('SEU PRÓXIMO FAVORITO', 'Comida boa, pronta para descobrir.', 'Escolha seu restaurante e receba seus pratos favoritos em casa.')}
    <section class="famous-stack-section" aria-labelledby="famous-restaurants-title">
      <div class="famous-stack-toolbar">
        <div class="famous-stack-heading"><p class="eyebrow">SABORES PARA EXPLORAR</p><h2 id="famous-restaurants-title">${categoryTitle}</h2><p>${categoryDescription}</p></div>
        <div class="famous-carousel-controls" role="group" aria-label="Navegar pelos restaurantes em destaque">
          <button class="famous-carousel-arrow" type="button" data-famous-direction="previous" aria-label="Restaurantes anteriores" disabled><span aria-hidden="true">←</span></button>
          <button class="famous-carousel-arrow" type="button" data-famous-direction="next" aria-label="Próximos restaurantes"><span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div class="famous-stack" id="famous-restaurant-stack" aria-label="Restaurantes em destaque"><div class="famous-horizontal-viewport"><div class="famous-horizontal-track">${getFeaturedRestaurantCards(selectedCategory)}</div></div><div class="famous-stack__progress" aria-hidden="true"><span><i></i></span><b>01 / ${String(featured.length).padStart(2, '0')}</b></div></div>
    </section>
    <section class="listing-tools" aria-label="Filtros de restaurantes">
      <label class="listing-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input class="route-search" type="search" placeholder="Busque um restaurante ou tipo de comida" aria-label="Busque um restaurante ou tipo de comida" /></label>
      <label class="sort-control"><span>Ordenar por</span><select class="restaurant-sort" aria-label="Ordenar restaurantes"><option>Nome A–Z</option><option>Nome Z–A</option></select></label>
    </section>
    <a class="favorites-shortcut" href="#/favoritos">♡ Seus favoritos <span data-favorite-count>${favorites.size}</span></a>
    <div class="restaurant-category-nav" id="restaurant-category-nav" aria-label="Categorias de restaurantes"></div>
    <header class="standard-restaurants-heading"><h2>Continue descobrindo</h2><p>Tem sempre um novo favorito esperando por você.</p></header>
    <div class="restaurant-grid route-restaurant-grid">${getRestaurantCards(restaurants)}</div>
    <p class="empty-results" hidden>Nenhum restaurante encontrado. Tente outra busca.</p>`;
}

function renderOffersPage() {
  return `${sectionHeading('SEU MOMENTO DE ECONOMIZAR', 'Um prato cheio de ofertas.', 'Aproveite vantagens especiais para deixar seu próximo pedido ainda melhor.')}
    <section class="offers-coupons offers-coupons--featured" id="offers-coupons-section" aria-labelledby="offers-coupons-title">
      <header class="offers-featured-heading">
        <div><p class="eyebrow">VANTAGENS PARA VOCÊ</p><h2 id="offers-coupons-title">Uma ideia para o próximo pedido</h2><p>Resgate seu cupom e aplique o código na sacola.</p></div>
        <span class="offers-active-count"><i aria-hidden="true"></i> 4 ofertas</span>
      </header>
      <div class="offer-coupon-grid" id="offers-coupons-root" aria-live="polite"></div>
    </section>
    <section class="offers-browse" aria-labelledby="offers-browse-title">
      <header class="standard-restaurants-heading"><h2 id="offers-browse-title">Mais ofertas para descobrir</h2><p>Encontre seu próximo prato especial.</p></header>
    <section class="listing-tools" aria-label="Buscar e ordenar ofertas">
      <label class="listing-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input class="route-search" type="search" placeholder="Busque por cupom, prato ou restaurante" aria-label="Busque por cupom, prato ou restaurante" /></label>
      <label class="sort-control"><span>Ordenar pratos por</span><select class="offer-sort" aria-label="Ordenar pratos em oferta"><option value="featured">Em destaque</option><option value="price-ascending">Menor preço</option><option value="price-descending">Maior preço</option></select></label>
    </section>
    <div class="restaurant-category-nav offers-category-nav" id="offers-category-nav" aria-label="Categorias de ofertas"></div>
    <section class="food-section route-food-section offers-food-section" id="offers-food-section" aria-labelledby="offers-food-title">
      <header class="standard-restaurants-heading"><h2 id="offers-food-title">Pratos em oferta</h2><p>Escolhas da casa com preços especiais para hoje.</p></header>
      <div class="food-grid route-food-grid">${foodGridTemplate}</div>
    </section>
    <p class="empty-results offers-empty-results" hidden>Nenhuma oferta encontrada. Tente outra busca ou filtro.</p>
    </section>`;
}

function renderOrdersPage() {
  const orders = readOrders();
  if (!orders.length) {
    return `${sectionHeading('ACOMPANHE POR AQUI', 'Seu próximo sabor está esperando.', 'Quando você fizer um pedido, todos os detalhes e atualizações aparecem nesta página.')}
      <section class="empty-state orders-empty"><div class="empty-illustration order-illustration" aria-hidden="true"><span>✦</span><div class="plate"><i></i><i></i><i></i></div></div><h2>Você ainda não fez seu primeiro pedido.</h2><p>Explore os restaurantes e escolha algo especial para hoje.</p><a class="button button-primary" href="#/restaurantes">Ver restaurantes <span>→</span></a></section>`;
  }
  const cards = orders.map((order) => {
    const rows = order.items.map((item) => `<article class="cart-row"><div class="cart-row-copy"><h3>${escapeHTML(item.name)}</h3>${item.restaurant ? `<p>${escapeHTML(item.restaurant)}</p>` : ''}<strong>${escapeHTML(item.quantity)} × R$ ${escapeHTML(item.price)}</strong></div></article>`).join('');
    const date = new Date(order.createdAt);
    const placedAt = Number.isNaN(date.getTime()) ? 'Hoje' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    return `<article class="order-preview customer-order" aria-label="Pedido ${escapeHTML(order.id)}">
      <header class="order-preview__header customer-order__header"><div><span class="customer-order__status">${escapeHTML(order.status || 'EM PREPARAÇÃO')}</span><h2>Pedido ${escapeHTML(order.id)}</h2><time datetime="${escapeHTML(order.createdAt || '')}">${placedAt}</time></div><strong>Chega em ${escapeHTML(order.eta || '30–45 min')}</strong></header>
      <div class="cart-items">${rows}</div>
      <div class="order-preview__summary"><p><span>Subtotal</span><strong>${formatCurrency(order.subtotal)}</strong></p><p><span>Entrega</span><strong>${order.delivery ? formatCurrency(order.delivery) : 'Grátis'}</strong></p>${order.discount ? `<p><span>Desconto ${escapeHTML(order.coupon || '')}</span><strong>− ${formatCurrency(order.discount)}</strong></p>` : ''}<p><span>Total do pedido</span><strong>${formatCurrency(order.total)}</strong></p><p><span>Endereço de entrega</span><strong>${escapeHTML(order.address)}</strong></p><p><span>Pagamento</span><strong>${escapeHTML(order.payment || 'Na entrega')}</strong></p></div>
    </article>`;
  }).join('');
  return `${sectionHeading('ACOMPANHE POR AQUI', 'Seus pedidos.', 'Veja o que está a caminho e relembre seus pedidos anteriores.')}
    <section class="customer-orders" aria-label="Histórico de pedidos">${cards}</section>
    <a class="button button-primary customer-orders__more" href="#/restaurantes">Fazer novo pedido <span>→</span></a>`;
}

const internationalReviews = [
  { id: 'br', flag: '🇧🇷', country: 'Brasil', locale: 'Português', city: 'São Paulo, Brasil', name: 'Marina Costa', initials: 'MC', rating: '5,0', text: 'O pedido chegou quentinho e muito bem embalado. Já encontrei meu novo lugar favorito!', short: 'SP' },
  { id: 'us', flag: '🇺🇸', country: 'United States', locale: 'English', city: 'New York, United States', name: 'Jordan Miller', initials: 'JM', rating: '5.0', text: 'Everything arrived hot and right on time. Finding a new favorite has never been this easy!', short: 'US' },
  { id: 'mx', flag: '🇲🇽', country: 'México', locale: 'Español', city: 'Ciudad de México, México', name: 'Valentina Reyes', initials: 'VR', rating: '4,9', text: '¡Todo llegó delicioso y muy rápido! Ya encontré mi nuevo lugar favorito.', short: 'MX' },
  { id: 'fr', flag: '🇫🇷', country: 'France', locale: 'Français', city: 'Paris, France', name: 'Camille Laurent', initials: 'CL', rating: '5,0', text: 'Tout était délicieux et livré encore chaud. Je recommande vivement !', short: 'FR' },
  { id: 'jp', flag: '🇯🇵', country: '日本', locale: '日本語', city: '東京、日本', name: '佐藤 美咲', initials: '美咲', rating: '5.0', text: '料理がとても美味しく、配達も早かったです。また利用します！', short: 'JP' },
  { id: 'it', flag: '🇮🇹', country: 'Italia', locale: 'Italiano', city: 'Roma, Italia', name: 'Giulia Romano', initials: 'GR', rating: '4,9', text: 'Tutto buonissimo e arrivato ancora caldo. Ordinerò di nuovo!', short: 'IT' },
];

const brazilReviews = [
  { name: 'Ana Clara', initials: 'AC', city: 'Salvador, BA', rating: '5,0', text: 'Chegou tudo quentinho e a embalagem veio impecável. Vou pedir de novo!' },
  { name: 'Pedro Henrique', initials: 'PH', city: 'Recife, PE', rating: '5,0', text: 'Foi fácil escolher, o pedido chegou rápido e estava uma delícia.' },
  { name: 'Beatriz Lima', initials: 'BL', city: 'Belo Horizonte, MG', rating: '4,9', text: 'Adorei conhecer restaurantes novos por aqui. Experiência muito boa.' },
  { name: 'Rafael Martins', initials: 'RM', city: 'Curitiba, PR', rating: '5,0', text: 'Tudo certo do começo ao fim: pedir foi simples e a comida chegou ótima.' },
];

function renderReviewsPage() {
  return `${sectionHeading('UMA MESA, MUITOS SOTAQUES', 'Sabores que conectam o mundo.', 'Veja o que clientes de diferentes países estão dizendo sobre seus pedidos.')}
    <section class="reviews-world reviews-world--globe" aria-label="Globo 3D com rotas de avaliações internacionais">
      <div class="reviews-globe-stage" data-reviews-globe>
        <canvas class="reviews-globe-canvas" data-globe-surface aria-label="Globo 3D com fronteiras dos países e rotas de avaliações"></canvas>
        <canvas class="reviews-globe-overlay" data-globe-overlay aria-hidden="true"></canvas>
        <div class="globe-loading" data-globe-loading><span></span>Carregando mapa mundial…</div>
        <div class="globe-error" data-globe-error hidden>Não foi possível carregar as fronteiras. Verifique sua conexão e recarregue a página.</div>
        <div class="globe-caption"><span class="globe-caption__live"></span> ROTAS DE AVALIAÇÕES <span class="globe-caption__separator">·</span> GIRO LENTO</div>
        ${internationalReviews.map((review, index) => `<button class="review-bubble${index === 0 ? ' is-active' : ''}" type="button" data-review-country="${review.id}" data-globe-bubble="${review.id}" aria-pressed="${index === 0}" aria-label="${review.flag} ${review.country}: ${review.text}"><span class="review-bubble__heading"><span class="review-bubble__flag">${review.flag}</span><span class="review-bubble__country">${review.city}</span><span class="review-bubble__stars">★ ${review.rating}</span></span><span class="review-bubble__quote">“${review.text}”</span><span class="review-bubble__author">${review.name} <small>· ${review.locale}</small></span></button>`).join('')}
      </div>
      <div class="review-country-picker" role="group" aria-label="Escolha um país para ver as avaliações">${internationalReviews.map((review, index) => `<button class="review-country${index === 0 ? ' is-active' : ''}" type="button" data-review-country="${review.id}" aria-pressed="${index === 0}"><span>${review.flag}</span><span>${review.country}</span><small>${review.locale}</small></button>`).join('')}</div>
    </section>
    <section class="brazil-reviews" aria-labelledby="brazil-reviews-title">
      <div class="brazil-reviews__heading"><div><span class="brazil-reviews__eyebrow">🇧🇷 VOZES DO BRASIL</span><h2 id="brazil-reviews-title">Mais avaliações por aqui.</h2><p>Veja as experiências de quem pediu em diferentes cidades brasileiras.</p></div><span class="brazil-reviews__count">${brazilReviews.length} AVALIAÇÕES</span></div>
      <div class="brazil-reviews__grid">${brazilReviews.map((review) => `<article class="brazil-review-card"><div class="brazil-review-card__top"><span class="brazil-review-card__avatar" aria-hidden="true">${review.initials}</span><span class="brazil-review-card__person"><strong>${review.name}</strong><small>${review.city}</small></span><span class="brazil-review-card__rating" aria-label="Nota ${review.rating} de 5">★ ${review.rating}</span></div><blockquote>“${review.text}”</blockquote></article>`).join('')}</div>
    </section>`;
}

function startReviewTopographyFallback() {
  reviewTopographyFallbackCleanup();
  const host = document.querySelector('#reviews-topography-root');
  if (!host || window.__nuvoraReactMode) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'topography-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 1;
  let height = 1;
  let frame = 0;
  let pointer = { x: 0.5, y: 0.5, active: false };
  const resize = () => {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const onMove = (event) => {
    const rect = host.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  };
  const onLeave = () => { pointer.active = false; };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);
  const draw = (now) => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(0.56);
    for (let line = 0; line < 22; line += 1) {
      const radius = 18 + line * Math.hypot(width, height) / 35;
      ctx.beginPath();
      for (let point = 0; point <= 160; point += 1) {
        const angle = (point / 160) * Math.PI * 2;
        const wave = Math.sin(angle * 3 + now / 2400 + line * 0.12) * 12 + Math.sin(angle * 5 - now / 3500) * 7;
        let x = Math.cos(angle) * (radius + wave) * 1.15;
        let y = Math.sin(angle) * (radius + wave) * 0.62;
        if (pointer.active) y -= Math.exp(-((x - (pointer.x - width / 2)) ** 2 + (y - (pointer.y - height / 2)) ** 2) / 23000) * 16;
        if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.09 + (line / 22) * 0.08;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 3;
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
  reviewTopographyFallbackCleanup = () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    if (canvas.parentNode === host) canvas.remove();
  };
  window.__nuvoraStopReviewTopographyFallback = reviewTopographyFallbackCleanup;
}

function renderCartPage() {
  const entries = [...cart.values()];
  if (!entries.length) {
    return `<div class="cart-page cart-page--empty">
      <header class="cart-page-heading">
        <div><p class="eyebrow">SUA SELEÇÃO · ND FOOD</p><h1 tabindex="-1">Sua sacola de felicidade.</h1><p>Os seus próximos sabores começam por aqui.</p></div>
        <span class="cart-page-count"><strong>0</strong><span>itens na sacola</span></span>
      </header>
      <section class="cart-content cart-page-content" aria-label="Sua sacola">
        <div class="cart-page-list cart-page-empty-list">
          <div class="cart-list-heading"><div><p class="eyebrow">ESCOLHAS DA CASA</p><h2>Itens na sacola</h2></div><span>0 itens</span></div>
          <div class="cart-page-empty-state">
            <div class="empty-illustration bag-illustration" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M17 24h30l4 31H13l4-31Z"/><path d="M23 25v-7a9 9 0 0 1 18 0v7"/></svg></div>
            <div><span class="cart-item-kicker">UM BOM PEDIDO COMEÇA COM UMA ESCOLHA</span><h2>Sua sacola está esperando um sabor.</h2><p>Explore os restaurantes e encontre algo delicioso para começar.</p><a class="button button-primary" href="#/restaurantes">Explorar restaurantes <span>→</span></a></div>
          </div>
        </div>
        <aside class="cart-summary cart-page-summary" aria-labelledby="cart-summary-title">
          <div class="cart-summary__heading"><p class="eyebrow">VISÃO DA SELEÇÃO</p><h2 id="cart-summary-title">Resumo</h2></div>
          <div class="cart-page-summary-lines">
            <p class="cart-page-summary-line"><span>Itens selecionados</span><strong>0 itens</strong></p>
            <p class="cart-page-summary-line"><span>Subtotal</span><strong>—</strong></p>
            <p class="cart-page-summary-line"><span>Entrega</span><strong>A partir de R$ 5,90</strong></p>
          </div>
          <div class="cart-page-total"><span>Total</span><strong>—</strong><small>Adicione seus pratos para ver o valor completo.</small></div>
          <a class="button button-primary" href="#/restaurantes">Encontrar meu próximo prato <span>→</span></a>
        </aside>
      </section>
    </div>`;
  }
  const totalQuantity = entries.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemCount = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'itens'}`;
  const totals = getCartTotals(entries);
  const deliveryWindow = getDeliveryWindow(entries);
  const coupon = couponRules[activeCoupon];
  const couponHint = coupon
    ? (totals.subtotal >= coupon.minimum ? `${activeCoupon} aplicado ao seu pedido.` : `Adicione ${formatCurrency(coupon.minimum - totals.subtotal)} para usar ${activeCoupon}.`)
    : 'Use BEMVINDO10 e ganhe R$ 10 no primeiro pedido acima de R$ 39.';
  const rows = [...cart.entries()].map(([key, item]) => {
    const quantity = Number(item.quantity) || 0;
    const name = escapeHTML(item.name);
    return `<article class="cart-row cart-page-item">
      <img src="${escapeHTML(item.image)}" alt="" loading="lazy" />
      <div class="cart-row-copy">
        <h2>${name}</h2>
        ${item.restaurant ? `<p>${escapeHTML(item.restaurant)}</p>` : ''}
        <div class="cart-row-price"><strong>R$ ${escapeHTML(item.price)}</strong><span>por unidade</span></div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-control" role="group" aria-label="Quantidade de ${name}">
          <button type="button" data-cart-change="-1" data-product="${escapeHTML(key)}" aria-label="${quantity === 1 ? 'Remover' : 'Diminuir quantidade de'} ${name}">−</button>
          <span aria-live="polite">${quantity}</span>
          <button type="button" data-cart-change="1" data-product="${escapeHTML(key)}" aria-label="Adicionar mais um ${name}">+</button>
        </div>
        <button type="button" class="cart-remove" data-cart-change="-${quantity}" data-product="${escapeHTML(key)}" aria-label="Remover ${name} da sacola" title="Remover da sacola">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg><span>Remover</span>
        </button>
      </div>
    </article>`;
  }).join('');
  const address = savedAddress();
  return `<div class="cart-page">
    <header class="cart-page-heading">
      <div><p class="eyebrow">SUA SELEÇÃO · ND FOOD</p><h1 tabindex="-1">Sua sacola de felicidade.</h1><p>Confira os sabores escolhidos antes de continuar.</p></div>
      <span class="cart-page-count"><strong>${totalQuantity}</strong><span>${totalQuantity === 1 ? 'item' : 'itens'} na sacola</span></span>
    </header>
    <section class="cart-content cart-page-content" aria-label="Sua sacola">
      <div class="cart-page-list">
        <div class="cart-list-heading"><div><p class="eyebrow">ESCOLHAS DA CASA</p><h2>Itens na sacola</h2></div><span>${itemCount}</span></div>
        <div class="cart-items">${rows}</div>
      </div>
      <aside class="cart-summary cart-page-summary" aria-labelledby="cart-summary-title">
        <div class="cart-summary__heading"><p class="eyebrow">VISÃO DA SELEÇÃO</p><h2 id="cart-summary-title">Resumo</h2></div>
        <div class="cart-page-summary-lines">
          <p class="cart-page-summary-line"><span>Itens selecionados</span><strong>${itemCount}</strong></p>
          <p class="cart-page-summary-line"><span>Subtotal</span><strong>${formatCurrency(totals.subtotal)}</strong></p>
          <p class="cart-page-summary-line"><span>Entrega</span><strong>${totals.delivery ? formatCurrency(totals.delivery) : 'Grátis'}</strong></p>
          ${totals.discount ? `<p class="cart-page-summary-line cart-page-discount"><span>Desconto ${escapeHTML(activeCoupon)}</span><strong>− ${formatCurrency(totals.discount)}</strong></p>` : ''}
          <p class="cart-page-summary-line"><span>Chega em</span><strong>${deliveryWindow}</strong></p>
        </div>
        <div class="cart-page-total"><span>Total</span><strong>${formatCurrency(totals.total)}</strong><small>Pagamento na entrega.</small></div>
        <div class="cart-promo-form">
          <label for="cart-coupon-code">Tem um cupom?</label>
          <div><input id="cart-coupon-code" type="text" value="${escapeHTML(activeCoupon)}" placeholder="Digite seu código" autocomplete="off" /><button type="button" data-apply-coupon>Aplicar</button></div>
          <p aria-live="polite">${couponHint}${coupon ? ' <button type="button" data-remove-coupon>Remover</button>' : ''}</p>
        </div>
        <div class="cart-address cart-page-address"><div><span>Endereço de entrega</span><strong>${escapeHTML(address || 'Adicione seu endereço')}</strong></div><button type="button" data-edit-address>${address ? 'Alterar' : 'Adicionar'}</button></div>
        <button class="button button-primary" type="button" data-checkout>Ir para revisão do pedido <span>→</span></button>
        <a class="cart-page-more" href="#/restaurantes">Adicionar mais sabores <span aria-hidden="true">↗</span></a>
      </aside>
    </section>
  </div>`;
}

function renderReviewPage() {
  const entries = [...cart.entries()];
  if (!entries.length) {
    return `${sectionHeading('REVISÃO DO PEDIDO', 'Sua sacola está vazia.', 'Escolha seus pratos favoritos para continuar.')}
      <section class="empty-state"><h2>Vamos escolher alguns sabores?</h2><a class="button button-primary" href="#/restaurantes">Ver restaurantes <span>→</span></a></section>`;
  }
  const items = entries.map(([, item]) => ({ name: item.name, restaurant: item.restaurant || '', price: item.price, quantity: item.quantity }));
  const rows = items.map((item) => `<article class="cart-row"><div class="cart-row-copy"><h2>${escapeHTML(item.name)}</h2>${item.restaurant ? `<p>${escapeHTML(item.restaurant)}</p>` : ''}<strong>${item.quantity} × R$ ${escapeHTML(item.price)}</strong></div></article>`).join('');
  const totals = getCartTotals(items);
  const deliveryWindow = getDeliveryWindow(items);
  const address = savedAddress();
  return `${sectionHeading('QUASE LÁ', 'Revise seu pedido.', 'Confira os itens, o endereço e o prazo antes de confirmar.')}
    <section class="review-content"><div class="cart-items">${rows}</div><aside class="cart-summary"><h2>Resumo do pedido</h2><div class="cart-address"><div><span>Endereço de entrega</span><strong>${escapeHTML(address || 'Adicione seu endereço')}</strong></div><button type="button" data-edit-address>${address ? 'Alterar' : 'Adicionar'}</button></div><p><span>Subtotal</span><strong>${formatCurrency(totals.subtotal)}</strong></p><p><span>Entrega</span><strong>${totals.delivery ? formatCurrency(totals.delivery) : 'Grátis'}</strong></p>${totals.discount ? `<p><span>Desconto ${escapeHTML(activeCoupon)}</span><strong>− ${formatCurrency(totals.discount)}</strong></p>` : ''}<p><span>Chega em</span><strong>${deliveryWindow}</strong></p><p><span>Total</span><strong>${formatCurrency(totals.total)}</strong></p><p><span>Pagamento</span><strong>Na entrega</strong></p><button class="button button-primary" type="button" data-place-order${address ? '' : ' disabled'}>Confirmar pedido <span>→</span></button><a href="#/sacola">Voltar à sacola</a></aside></section>`;
}

function renderDishCard(restaurant, product, favoriteKey = `product:${restaurant.id}:${slug(product.name)}`) {
  return `<article class="food-card" data-restaurant-name="${escapeHTML(restaurant.name)}"><div class="food-photo"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" /><span class="badge">${escapeHTML(product.badge || 'MAIS PEDIDO')}</span><button class="favorite" type="button" data-favorite-key="${escapeHTML(favoriteKey)}" aria-label="Favoritar ${escapeHTML(product.name)}" aria-pressed="false">♡</button></div><div class="food-info"><p class="restaurant-name">${escapeHTML(restaurant.name)}</p><h3>${escapeHTML(product.name)}</h3><p class="food-description">${escapeHTML(product.description || 'Preparado na hora com ingredientes selecionados.')}</p><div class="price-row"><div>${product.oldPrice ? `<del>R$ ${formatPrice(product.oldPrice)}</del>` : ''}<strong>R$ ${formatPrice(product.price)}</strong></div><button class="add-button" type="button" data-add="${escapeHTML(product.name)}" data-product-key="${escapeHTML(favoriteKey)}" data-product-price="${Number(product.price)}" aria-label="Adicionar ${escapeHTML(product.name)} à sacola">+</button></div></div></article>`;
}

function renderFavoriteSnapshotCard(key) {
  const saved = favoriteDetails.get(key);
  if (!saved || saved.type !== 'product') return '';
  return `<article class="food-card" data-restaurant-name="${escapeHTML(saved.restaurantName || '')}"><div class="food-photo"><img src="${escapeHTML(saved.image || '')}" alt="${escapeHTML(saved.name)}" loading="lazy" /><span class="badge">${escapeHTML(saved.badge || 'MAIS PEDIDO')}</span><button class="favorite" type="button" data-favorite-key="${escapeHTML(key)}" aria-label="Remover ${escapeHTML(saved.name)} dos favoritos" aria-pressed="true">♥</button></div><div class="food-info"><p class="restaurant-name">${escapeHTML(saved.restaurantName || 'ND Food')}</p><h3>${escapeHTML(saved.name)}</h3><p class="food-description">${escapeHTML(saved.description || 'Preparado na hora com ingredientes selecionados.')}</p><div class="price-row"><div>${saved.oldPrice ? `<del>R$ ${escapeHTML(saved.oldPrice)}</del>` : ''}<strong>R$ ${escapeHTML(saved.price || '0,00')}</strong></div><button class="add-button" type="button" data-add="${escapeHTML(saved.name)}" data-product-key="${escapeHTML(key)}" data-product-price="${Number(saved.priceValue || 0)}" aria-label="Adicionar ${escapeHTML(saved.name)} à sacola">+</button></div></div></article>`;
}

function renderFavoritesPage() {
  const restaurantIds = [...favorites].filter((key) => key.startsWith('restaurant:')).map((key) => key.slice('restaurant:'.length));
  const savedRestaurants = restaurants.filter((restaurant) => restaurantIds.includes(restaurant.id));
  const savedProducts = [...favorites].filter((key) => key.startsWith('product:')).map(renderFavoriteSnapshotCard).filter(Boolean).join('');
  const hasFavorites = savedRestaurants.length || savedProducts;
  return `${sectionHeading('SUA LISTA PESSOAL', 'Seus favoritos.', 'Acesse de novo os restaurantes e pratos que você salvou.')}
    ${hasFavorites ? `${savedRestaurants.length ? `<section class="favorite-section"><header class="standard-restaurants-heading"><h2>Restaurantes</h2></header><div class="restaurant-grid">${getRestaurantCards(savedRestaurants)}</div></section>` : ''}${savedProducts ? `<section class="favorite-section"><header class="standard-restaurants-heading"><h2>Pratos</h2></header><div class="food-grid">${savedProducts}</div></section>` : ''}` : '<section class="empty-state"><h2>Você ainda não salvou favoritos.</h2><p>Toque no coração de um restaurante ou prato para encontrá-lo aqui.</p><a class="button button-primary" href="#/restaurantes">Ver restaurantes <span>→</span></a></section>'}`;
}

function renderRestaurantDetail(id) {
  const restaurant = restaurants.find((item) => item.id === id) || restaurants[0];
  currentRestaurant = restaurant;
  const cover = getRestaurantImageSources(restaurant)[0];
  const products = getRestaurantMenu(restaurant);
  const productCardsHTML = products.map((product) => renderDishCard(restaurant, product)).join('');
  return `<a class="back-link" href="#/restaurantes">← Voltar para restaurantes</a>
    <section class="detail-hero"><div class="detail-cover"><img data-restaurant-image="${restaurant.id}" src="${escapeHTML(cover)}" alt="Pratos do ${escapeHTML(restaurant.name)}" /><span class="detail-open">ABERTO AGORA</span></div><div class="detail-info"><p class="eyebrow">UMA IDEIA PARA SEU PRÓXIMO SABOR</p><h1>${escapeHTML(restaurant.name)}</h1><p class="detail-summary">${escapeHTML(restaurant.category)} preparados com ingredientes frescos e muito sabor.</p><div class="detail-stats"><span class="rating">★ ${restaurant.rating} · ${escapeHTML(restaurant.reviews)}</span><span>Entrega em ${restaurant.minutes}–${restaurant.minutes + 10} min</span></div><span class="detail-tag">${restaurant.free ? 'ENTREGA GRÁTIS' : `FRETE R$ ${formatPrice(restaurant.deliveryFee ?? 5.9)}`}</span></div></section>
    <section class="detail-menu-section"><div class="section-heading"><div><h2>Cardápio · ${escapeHTML(restaurant.name)}</h2><p>Escolha seus favoritos, preparados na hora.</p></div><a class="favorites-shortcut" href="#/favoritos">♡ Seus favoritos <span data-favorite-count>${favorites.size}</span></a></div><div class="food-grid detail-menu-grid">${productCardsHTML}</div></section>
    <div class="detail-cart-bar"><span>Seu próximo prato favorito está a um toque.</span><a class="button button-primary" href="#/sacola">Ver sacola <span>→</span></a></div>`;
}

function updateNavigation(routeName) {
  const activeRoute = routeName === 'restaurante' ? 'restaurantes' : routeName;
  document.querySelectorAll('.dock-panel .dock-item[href^="#/"]').forEach((link) => {
    const route = link.getAttribute('href').replace(/^#\/?/, '') || 'inicio';
    const action = link.matches('.location-button, .dock-search-toggle');
    const active = !action && route === activeRoute;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function renderRoute() {
  reviewTopographyFallbackCleanup();
  window.dispatchEvent(new Event('nuvora:before-route-render'));
  const route = getRoute();
  const home = route.name === 'inicio' || !['restaurantes', 'ofertas', 'pedidos', 'avaliacoes', 'sacola', 'revisao', 'favoritos', 'restaurante', 'entrar'].includes(route.name);
  const siteFooter = document.querySelector('.site-footer');
  if (siteFooter) siteFooter.hidden = route.name === 'entrar';
  homePage.hidden = !home;
  routeScreen.hidden = home;
  document.querySelector('.skip-link').setAttribute('href', home ? '#inicio' : '#route-screen');
  updateNavigation(home ? 'inicio' : route.name);
  if (home) {
    routeScreen.replaceChildren();
    syncFavoriteButtons(homePage);
    document.title = 'ND Food — Seu próximo sabor favorito';
    window.dispatchEvent(new Event('nuvora:route-rendered'));
    return;
  }
  selectedCategory = route.name === 'restaurantes' && route.id ? route.id : 'Todos';
  if (route.name === 'restaurantes') {
    routeScreen.innerHTML = renderRestaurantsPage();
    document.title = 'Restaurantes — ND Food';
  } else if (route.name === 'ofertas') {
    selectedOfferType = 'all';
    routeScreen.innerHTML = renderOffersPage();
    document.title = 'Ofertas — ND Food';
  } else if (route.name === 'pedidos') {
    routeScreen.innerHTML = renderOrdersPage();
    document.title = 'Meus Pedidos — ND Food';
  } else if (route.name === 'entrar') {
    routeScreen.innerHTML = renderAuthPage();
    document.title = 'Entrar ou criar conta — ND Food';
  } else if (route.name === 'avaliacoes') {
    routeScreen.innerHTML = renderReviewsPage();
    document.title = 'Avaliações — ND Food';
  } else if (route.name === 'restaurante') {
    routeScreen.innerHTML = renderRestaurantDetail(route.id);
    document.title = `${currentRestaurant.name} — ND Food`;
  } else if (route.name === 'revisao') {
    routeScreen.innerHTML = renderReviewPage();
    document.title = 'Revisão do pedido — ND Food';
  } else if (route.name === 'favoritos') {
    routeScreen.innerHTML = renderFavoritesPage();
    document.title = 'Favoritos — ND Food';
  } else {
    routeScreen.innerHTML = renderCartPage();
    document.title = 'Sacola — ND Food';
  }
  syncFavoriteButtons(document);
  applyRouteFilters();
  window.dispatchEvent(new Event('nuvora:route-rendered'));
  startReviewTopographyFallback();
  routeScreen.querySelector('h1')?.focus({ preventScroll: true });
}

function applyRouteFilters() {
  const route = getRoute();
  if (route.name === 'restaurantes') {
    const query = (routeScreen.querySelector('.route-search')?.value ?? document.querySelector('#search')?.value ?? '').trim().toLocaleLowerCase('pt-BR');
    const cards = [...routeScreen.querySelectorAll('.famous-stack__card, .route-restaurant-grid .restaurant-card')];
    cards.forEach((card) => {
      const matchesCategory = selectedCategory === 'Todos' || card.dataset.category === selectedCategory;
      const matchesQuery = !query || card.dataset.search.includes(query);
      card.hidden = !matchesCategory || !matchesQuery;
    });
    routeScreen.querySelector('.empty-results').hidden = cards.some((card) => !card.hidden);
    window.dispatchEvent(new Event('nuvora:restaurant-filters-applied'));
  }
  if (route.name === 'ofertas') {
    const query = (routeScreen.querySelector('.route-search')?.value ?? document.querySelector('#search')?.value ?? '').trim().toLocaleLowerCase('pt-BR');
    const coupons = [...routeScreen.querySelectorAll('[data-offer-card="coupon"]')];
    const dishes = [...routeScreen.querySelectorAll('.route-food-grid .food-card')];
    const cards = [...coupons, ...dishes];
    cards.forEach((card) => {
      const isCoupon = card.dataset.offerCard === 'coupon';
      const matchesType = selectedOfferType === 'all' || (selectedOfferType === 'coupon' ? isCoupon : !isCoupon);
      const matchesQuery = !query || (card.dataset.search || '').toLocaleLowerCase('pt-BR').includes(query);
      card.hidden = !matchesType || !matchesQuery;
    });
    routeScreen.querySelector('#offers-coupons-section').hidden = selectedOfferType === 'dish';
    routeScreen.querySelector('#offers-food-section').hidden = selectedOfferType === 'coupon';
    routeScreen.querySelector('.offers-empty-results').hidden = cards.some((card) => !card.hidden);
  }
}

function sortOfferDishes(sortBy) {
  const grid = routeScreen.querySelector('.route-food-grid');
  if (!grid) return;
  const cards = [...grid.children];
  if (sortBy === 'price-ascending' || sortBy === 'price-descending') {
    const direction = sortBy === 'price-ascending' ? 1 : -1;
    cards.sort((a, b) => {
      const price = (card) => Number((card.querySelector('.price-row strong')?.textContent || '0').replace(/[^\d,]/g, '').replace(',', '.'));
      return (price(a) - price(b)) * direction;
    });
  }
  cards.forEach((card) => grid.append(card));
}

function updateFeaturedCategory(category) {
  const featured = getFeaturedRestaurants(category);
  const track = routeScreen.querySelector('.famous-horizontal-track');
  const grid = routeScreen.querySelector('.route-restaurant-grid');
  if (!track || !grid) return;
  track.innerHTML = getFeaturedRestaurantCards(category);
  grid.innerHTML = getRestaurantCards(restaurants);
  syncFavoriteButtons(grid);

  const title = routeScreen.querySelector('#famous-restaurants-title');
  const description = routeScreen.querySelector('.famous-stack-heading > p:last-child');
  const stack = routeScreen.querySelector('#famous-restaurant-stack');
  const count = routeScreen.querySelector('.famous-stack__progress b');
  if (title) title.textContent = category === 'Todos' ? 'Para inspirar sua escolha' : `Para descobrir · ${category}`;
  if (description) description.textContent = category === 'Todos'
    ? 'Restaurantes queridos, sabores novos e entrega no seu endereço.'
    : `Os melhores pedidos de ${category}, preparados na hora.`;
  stack?.setAttribute('aria-label', category === 'Todos' ? 'Restaurantes em destaque' : `Restaurantes de ${category}`);
  if (count) count.textContent = featured.length ? `01 / ${String(featured.length).padStart(2, '0')}` : '00 / 00';
}

function sortRestaurants(sortBy) {
  const grid = routeScreen.querySelector('.route-restaurant-grid');
  if (!grid) return;
  const cards = [...grid.children];
  cards.sort((a, b) => {
    const aName = a.querySelector('h3')?.textContent || '';
    const bName = b.querySelector('h3')?.textContent || '';
    const direction = sortBy === 'Nome Z–A' ? -1 : 1;
    return aName.localeCompare(bName, 'pt-BR') * direction;
  }).forEach((card) => grid.append(card));
}

function openModal(modalId) {
  const modal = document.querySelector(`#${modalId}`);
  modalOpener = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  [document.querySelector('.site-header'), homePage, routeScreen, document.querySelector('.site-footer')].forEach((item) => { item.inert = true; });
  const addressInput = modal.querySelector('input[name="address"]');
  if (addressInput) addressInput.value = savedAddress();
  addressInput?.focus();
}

function closeModal(modal) {
  if (modal?.id === 'address-modal') pendingCheckout = false;
  modal.hidden = true;
  if (![...document.querySelectorAll('.auth-overlay')].some((item) => !item.hidden)) {
    document.body.classList.remove('modal-open');
    [document.querySelector('.site-header'), homePage, routeScreen, document.querySelector('.site-footer')].forEach((item) => { item.inert = false; });
    modalOpener?.focus();
    modalOpener = null;
  }
}

function openRestaurant(card) {
  const restaurant = card.dataset.restaurant || restaurants.find((item) => item.name === card.querySelector('h3')?.textContent.trim())?.id || 'burger';
  location.hash = `#/restaurante/${restaurant}`;
}

document.addEventListener('input', (event) => {
  if (event.target.matches('#search')) {
    const query = event.target.value.trim().toLocaleLowerCase('pt-BR');
    if (getRoute().name === 'inicio') {
      homePage.querySelectorAll('.food-card').forEach((card) => { card.hidden = Boolean(query) && !card.dataset.search.toLocaleLowerCase('pt-BR').includes(query); });
    } else {
      const routeSearch = routeScreen.querySelector('.route-search');
      if (routeSearch) routeSearch.value = event.target.value;
      applyRouteFilters();
    }
  }
  if (event.target.matches('.route-search')) applyRouteFilters();
});

document.addEventListener('change', (event) => {
  if (event.target.matches('.restaurant-sort')) sortRestaurants(event.target.value);
  if (event.target.matches('.offer-sort')) sortOfferDishes(event.target.value);
});

window.addEventListener('nuvora:restaurant-category-change', (event) => {
  selectedCategory = event.detail;
  updateFeaturedCategory(selectedCategory);
  applyRouteFilters();
});

window.addEventListener('nuvora:offers-mounted', applyRouteFilters);
window.addEventListener('nuvora:offer-filter-change', (event) => {
  selectedOfferType = event.detail;
  applyRouteFilters();
});

document.addEventListener('click', async (event) => {
  const target = event.target;
  const modalButton = target.closest('.location-button');
  if (modalButton) {
    event.preventDefault();
    openModal('address-modal');
    return;
  }
  const reviewCountry = target.closest('[data-review-country]');
  if (reviewCountry) {
    const review = internationalReviews.find((item) => item.id === reviewCountry.dataset.reviewCountry);
    if (!review) return;
    document.querySelectorAll('[data-review-country]').forEach((button) => {
      const active = button.dataset.reviewCountry === review.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    window.dispatchEvent(new CustomEvent('nuvora:review-country-change', { detail: { id: review.id } }));
    return;
  }

  const add = target.closest('[data-add]');
  if (add) {
    addProduct(add.dataset.add, add);
    return;
  }

  const favorite = target.closest('.favorite');
  if (favorite) {
    const key = favoriteKeyFor(favorite);
    const saved = !favorites.has(key);
    const card = favorite.closest('.food-card, .restaurant-card');
    const itemName = card?.querySelector('h3')?.textContent.trim() || 'item';
    if (saved) {
      favorites.add(key);
      if (card?.classList.contains('restaurant-card')) {
        favoriteDetails.set(key, { key, type: 'restaurant', name: itemName, restaurantId: card.dataset.restaurant || '' });
      } else {
        const restaurantName = card?.dataset.restaurantName || card?.querySelector('.restaurant-name')?.textContent.trim() || '';
        const restaurantId = restaurants.find((item) => item.name === restaurantName)?.id || slug(restaurantName || 'nd-food');
        const priceText = card?.querySelector('.price-row strong')?.textContent.replace(/[^\d,]/g, '').replace(',', '.') || '0';
        const oldPriceText = card?.querySelector('.price-row del')?.textContent.replace(/[^\d,]/g, '') || '';
        favoriteDetails.set(key, {
          key,
          type: 'product',
          name: itemName,
          restaurantName,
          restaurantId,
          description: card?.querySelector('.food-description')?.textContent.trim() || '',
          image: card?.querySelector('.food-photo img')?.src || '',
          badge: card?.querySelector('.badge')?.textContent.trim() || 'MAIS PEDIDO',
          price: formatPrice(Number(priceText)),
          priceValue: Number(priceText),
          oldPrice: oldPriceText,
        });
      }
    } else {
      favorites.delete(key);
      favoriteDetails.delete(key);
    }
    const persisted = saveFavorites();
    syncFavoriteButtons(document);
    showToast(saved ? (persisted ? 'Adicionado aos favoritos' : 'Não foi possível salvar o favorito') : 'Removido dos favoritos');
    if (getRoute().name === 'favoritos') renderRoute();
    return;
  }

  const coupon = target.closest('.coupon-code');
  if (coupon) {
    try {
      await navigator.clipboard.writeText(coupon.dataset.copy);
      showToast(`Cupom copiado: ${coupon.dataset.copy}`);
    } catch {
      showToast(`Seu cupom: ${coupon.dataset.copy}`);
    }
    return;
  }

  const change = target.closest('[data-cart-change]');
  if (change) {
    const item = cart.get(change.dataset.product);
    if (item) {
      item.quantity += Number(change.dataset.cartChange);
      if (item.quantity <= 0) cart.delete(change.dataset.product);
      else cart.set(change.dataset.product, item);
      updateCartCount();
      renderRoute();
    }
    return;
  }

  const card = target.closest('.restaurant-card');
  if (card && !target.closest('button')) {
    openRestaurant(card);
    return;
  }

  if (target.matches('[data-close-modal]')) {
    closeModal(target.closest('.auth-overlay'));
    return;
  }

  if (target.matches('.auth-overlay')) closeModal(target);
  if (target.closest('[data-edit-address]')) {
    pendingCheckout = false;
    openModal('address-modal');
    return;
  }
  if (target.closest('[data-checkout]')) {
    if (!savedAddress()) {
      pendingCheckout = true;
      openModal('address-modal');
    } else {
      location.hash = '#/revisao';
    }
    return;
  }
  if (target.closest('[data-place-order]')) {
    if (!savedAddress()) {
      pendingCheckout = true;
      openModal('address-modal');
      return;
    }
    const items = [...cart.values()].map((item) => ({ name: item.name, restaurant: item.restaurant || '', price: item.price, quantity: item.quantity }));
    const totals = getCartTotals(items);
    const order = {
      id: `ND-${String(Date.now()).slice(-7)}`,
      createdAt: new Date().toISOString(),
      items,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      discount: totals.discount,
      coupon: totals.discount ? activeCoupon : '',
      total: totals.total,
      address: savedAddress(),
      eta: getDeliveryWindow(items),
      payment: 'Na entrega',
      status: 'EM PREPARAÇÃO',
    };
    try {
      localStorage.setItem(ordersStorageKey, JSON.stringify([order, ...readOrders()]));
      cart.clear();
      updateCartCount();
      activeCoupon = '';
      saveSessionValue(couponSessionStorageKey, '');
      showToast('Pedido confirmado! Já estamos preparando.');
      location.hash = '#/pedidos';
    } catch {
      showToast('Não foi possível confirmar o pedido. Tente novamente.');
    }
    return;
  }
  if (target.closest('[data-apply-coupon]')) {
    const code = routeScreen.querySelector('#cart-coupon-code')?.value.trim().toUpperCase() || '';
    const rule = couponRules[code];
    if (!rule) {
      showToast('Não encontramos esse cupom. Confira o código.');
      return;
    }
    const { subtotal } = getCartTotals();
    if (subtotal < rule.minimum) {
      showToast(`Esse cupom vale a partir de ${formatCurrency(rule.minimum)}.`);
      return;
    }
    activeCoupon = code;
    saveSessionValue(couponSessionStorageKey, code);
    renderRoute();
    showToast(`Cupom ${code} aplicado!`);
    return;
  }
  if (target.closest('[data-remove-coupon]')) {
    activeCoupon = '';
    saveSessionValue(couponSessionStorageKey, '');
    renderRoute();
    showToast('Cupom removido');
  }
});

window.addEventListener('nuvora:coupon-redeemed', (event) => {
  const code = String(event.detail?.code || '').toUpperCase();
  if (couponRules[code]) {
    activeCoupon = code;
    saveSessionValue(couponSessionStorageKey, code);
  }
  if (getRoute().name === 'sacola') renderRoute();
  showToast(`Cupom ${code} guardado para seu próximo pedido.`);
});

window.addEventListener('nuvora:coupon-copied', (event) => {
  showToast(`Cupom copiado: ${event.detail?.code || ''}`);
});

document.addEventListener('keydown', (event) => {
  const openDialog = document.querySelector('.auth-overlay:not([hidden])');
  if (event.key === 'Escape') document.querySelectorAll('.auth-overlay:not([hidden])').forEach(closeModal);
  if (event.key === 'Tab' && openDialog) {
    const focusable = [...openDialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')].filter((item) => !item.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  const card = event.target.closest?.('.restaurant-card[role="link"]');
  if (card && event.target === card && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    openRestaurant(card);
  }
});

document.querySelector('#address-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const address = String(new FormData(event.currentTarget).get('address') || '').trim();
  const continueToReview = pendingCheckout && cart.size > 0;
  try {
    sessionStorage.setItem(addressSessionStorageKey, address);
  } catch {
    showToast('Não foi possível salvar o endereço. Tente novamente.');
    return;
  }
  setAddressButton(address);
  closeModal(document.querySelector('#address-modal'));
  if (continueToReview) {
    pendingCheckout = false;
    location.hash = '#/revisao';
    return;
  }
  if (['sacola', 'revisao'].includes(getRoute().name)) {
    renderRoute();
    showToast('Endereço de entrega salvo');
    return;
  }
  showToast('Endereço de entrega salvo');
});

window.addEventListener('hashchange', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (location.hash.startsWith('#/')) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    root.style.scrollBehavior = previousScrollBehavior;
    renderRoute();
    return;
  }
  renderRoute();
  const anchor = decodeURIComponent(location.hash.slice(1));
  if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
});

setAddressButton(savedAddress());
syncFavoriteButtons(homePage);
updateCartCount();
renderRoute();
