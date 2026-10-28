import './theme.js';
// Shared runtime for Live Server and Vite. Keep navigation available before
// mounting enhancements; React replaces the static fallbacks when available.
import '../app.js';
import './components/ReviewsGlobe.js';
import './components/SignatureFooter.js';
import './components/RestaurantCardMotion.js';
import './components/DockFallback.js';
import './components/GlassIconsFallback.js';
import './components/PillNavFallback.js';
import './components/FamousRestaurantCarousel.js';
import './components/BurgerScrollFallback.js';
import './components/PizzaKitchen.js';
import './components/SupportChat.js';

if (import.meta.env) import('./main.jsx');
else import('./components/OfferCouponsFallback.js');
