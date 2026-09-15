const SHOP_WHATSAPP = '919938087077';

const products = [
  { id: 1, name: 'Gulmohar Silk Saree', category: 'Sarees', colour: 'Rani pink · Handloom silk', price: 1899, original: 2499, discount: 24, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85' },
  { id: 2, name: 'Neelambari Cotton Saree', category: 'Sarees', colour: 'Indigo · Kota cotton', price: 1399, original: 1799, discount: 22, badge: 'New in', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85' },
  { id: 3, name: 'Mogra Wrap Dress', category: 'Dresses', colour: 'Ivory · Floral print', price: 1599, original: 2199, discount: 27, badge: 'Just dropped', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85' },
  { id: 4, name: 'Haldi Bloom Saree', category: 'Sarees', colour: 'Marigold · Chanderi', price: 2199, original: 2899, discount: 24, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85' },
  { id: 5, name: 'Genda Co-ord Set', category: 'Sets', colour: 'Ochre · Textured cotton', price: 1299, original: 1699, discount: 24, badge: 'Easy fit', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85' },
  { id: 6, name: 'Koyal Midi Dress', category: 'Dresses', colour: 'Black · Cotton satin', price: 1799, original: 2299, discount: 22, badge: 'Limited', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85' },
  { id: 7, name: 'Pattachitra Drape', category: 'Sarees', colour: 'Rust · Tussar silk', price: 2499, original: 3299, discount: 24, badge: 'Handcrafted', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85' },
  { id: 8, name: 'Champa Day Dress', category: 'Dresses', colour: 'Sage · Linen blend', price: 1499, original: 1999, discount: 25, badge: 'New in', image: 'https://images.unsplash.com/photo-1623609163859-ca93c959b98a?auto=format&fit=crop&w=800&q=85' },
  { id: 9, name: 'Aamras Linen Saree', category: 'Sarees', colour: 'Mango · Linen', price: 1699, original: 2299, discount: 26, badge: 'New in', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85' },
  { id: 10, name: 'Raat Ki Rani Set', category: 'Sets', colour: 'Plum · Rayon', price: 1899, original: 2499, discount: 24, badge: 'Best value', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=85' },
  { id: 11, name: 'Kumud Printed Dress', category: 'Dresses', colour: 'Coral · Viscose', price: 1399, original: 1899, discount: 26, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85' },
  { id: 12, name: 'Megh Malhar Saree', category: 'Sarees', colour: 'Teal · Mulmul cotton', price: 1199, original: 1599, discount: 25, badge: 'Everyday', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85' }
];

let selectedCategory = 'All';
let query = '';
let cart = JSON.parse(localStorage.getItem('vastralayam-cart') || '[]');

const money = value => `₹${value.toLocaleString('en-IN')}`;
const getVisibleProducts = () => products.filter(product => (selectedCategory === 'All' || product.category === selectedCategory) && `${product.name} ${product.colour}`.toLowerCase().includes(query.toLowerCase()));

function renderProducts() {
  const grid = document.querySelector('#productGrid');
  const empty = document.querySelector('#emptyState');
  const visible = getVisibleProducts();
  grid.innerHTML = visible.map(product => `<article class="product-card"><div class="product-image"><span class="badge">${product.badge}</span><button class="favorite" aria-label="Save ${product.name}"><i data-lucide="heart"></i></button><img loading="lazy" src="${product.image}" alt="${product.name}" /><button class="quick-add" data-add="${product.id}">Add to bag</button></div><div class="product-info"><span class="product-meta">${product.category} · ${product.colour.split(' · ')[0]}</span><h3>${product.name}</h3><div class="price-row"><span class="price">${money(product.price)}</span><span class="original-price">${money(product.original)}</span><span class="discount">${product.discount}% off</span></div></div></article>`).join('');
  empty.hidden = visible.length > 0;
  lucide.createIcons();
}

function saveCart() { localStorage.setItem('vastralayam-cart', JSON.stringify(cart)); }
function cartCount() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function getCartProduct(id) { return products.find(product => product.id === id); }
function addToCart(id) { const item = cart.find(entry => entry.id === id); if (item) item.quantity += 1; else cart.push({ id, quantity: 1 }); saveCart(); renderCart(); showToast(); }
function changeQuantity(id, amount) { const item = cart.find(entry => entry.id === id); if (!item) return; item.quantity += amount; if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id); saveCart(); renderCart(); }

function renderCart() {
  const items = document.querySelector('#cartItems');
  const empty = document.querySelector('#cartEmpty');
  const footer = document.querySelector('#cartFooter');
  const count = cartCount();
  document.querySelector('#cartCount').textContent = count;
  document.querySelector('#drawerCount').textContent = count;
  items.innerHTML = cart.map(item => { const product = getCartProduct(item.id); return `<div class="cart-line"><img src="${product.image}" alt="${product.name}" /><div class="line-info"><h3>${product.name}</h3><p>${product.colour}</p><strong class="line-price">${money(product.price)}</strong><div class="qty-controls"><button data-minus="${product.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-plus="${product.id}" aria-label="Increase quantity">+</button></div></div><button class="line-remove" data-remove="${product.id}">Remove</button></div>`; }).join('');
  const subtotal = cart.reduce((sum, item) => sum + getCartProduct(item.id).price * item.quantity, 0);
  const original = cart.reduce((sum, item) => sum + getCartProduct(item.id).original * item.quantity, 0);
  document.querySelector('#subtotal').textContent = money(subtotal);
  document.querySelector('#discount').textContent = `- ${money(original - subtotal)}`;
  document.querySelector('#total').textContent = money(subtotal);
  empty.classList.toggle('visible', cart.length === 0); footer.style.display = cart.length ? 'block' : 'none';
  lucide.createIcons();
}

function openCart() { document.querySelector('#cartDrawer').classList.add('open'); document.querySelector('#cartOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeCart() { document.querySelector('#cartDrawer').classList.remove('open'); document.querySelector('#cartOverlay').classList.remove('open'); document.body.style.overflow = ''; }
function showToast() { const toast = document.querySelector('#toast'); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); }
function checkout() { if (!cart.length) return; const lines = cart.map(item => { const product = getCartProduct(item.id); return `• ${product.name} x${item.quantity} — ${money(product.price * item.quantity)}`; }).join('\n'); const total = cart.reduce((sum, item) => sum + getCartProduct(item.id).price * item.quantity, 0); const message = `Hello Vastralayam! I would like to place an order:\n\n${lines}\n\nTotal: ${money(total)}\n\nPlease confirm availability, delivery details and send the UPI QR scanner for payment. Thank you!`; window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank'); }

function init() {
  renderProducts(); renderCart();
  document.querySelector('#productGrid').addEventListener('click', event => { const add = event.target.closest('[data-add]'); if (add) addToCart(Number(add.dataset.add)); const favorite = event.target.closest('.favorite'); if (favorite) favorite.classList.toggle('saved'); });
  document.querySelector('#cartItems').addEventListener('click', event => { const target = event.target; if (target.dataset.plus) changeQuantity(Number(target.dataset.plus), 1); if (target.dataset.minus) changeQuantity(Number(target.dataset.minus), -1); if (target.dataset.remove) { cart = cart.filter(item => item.id !== Number(target.dataset.remove)); saveCart(); renderCart(); } });
  document.querySelectorAll('.category-tabs button').forEach(button => button.addEventListener('click', () => { selectedCategory = button.dataset.category; document.querySelectorAll('.category-tabs button').forEach(tab => tab.classList.remove('active')); button.classList.add('active'); renderProducts(); }));
  document.querySelector('#searchInput').addEventListener('input', event => { query = event.target.value; renderProducts(); });
  document.querySelector('#searchButton').addEventListener('click', () => { document.querySelector('#searchBox').scrollIntoView({ behavior: 'smooth', block: 'center' }); document.querySelector('#searchInput').focus(); });
  document.querySelector('#cartButton').addEventListener('click', openCart); document.querySelector('#closeCart').addEventListener('click', closeCart); document.querySelector('#cartOverlay').addEventListener('click', closeCart); document.querySelector('#whatsappCheckout').addEventListener('click', checkout);
}

init();
