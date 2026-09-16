const tokenKey = 'vastralayam-admin-token';
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
let products = [];
let adminToken = sessionStorage.getItem(tokenKey) || '';

const byId = id => document.getElementById(id);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function setView(isLoggedIn) {
  byId('loginView').hidden = isLoggedIn;
  byId('dashboardView').hidden = !isLoggedIn;
}

function setStatus(message, isError = false) {
  const element = byId('statusMessage');
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function resetForm() {
  byId('productForm').reset();
  byId('productId').value = '';
  byId('editorTitle').textContent = 'Add a product';
  byId('imagePreview').innerHTML = '<span>Image preview</span>';
  byId('saveError').textContent = '';
}

function fillForm(product) {
  byId('productId').value = product.id;
  byId('productName').value = product.name;
  byId('productCategory').value = product.category;
  byId('productColour').value = product.colour;
  byId('productPrice').value = product.price;
  byId('productOriginal').value = product.original;
  byId('productDiscount').value = product.discount;
  byId('productBadge').value = product.badge || '';
  byId('productImage').value = product.image;
  byId('editorTitle').textContent = 'Edit product';
  updatePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePreview() {
  const image = byId('productImage').value.trim();
  byId('imagePreview').innerHTML = image ? `<img src="${escapeHtml(image)}" alt="Preview" onerror="this.replaceWith(document.createTextNode('Could not load this image'))" />` : '<span>Image preview</span>';
}

function renderProducts() {
  byId('productCount').textContent = products.length;
  byId('productList').innerHTML = products.map(product => `<article class="product-row"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" /><div><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.category)} - ${money(product.price)}</span><span>${escapeHtml(product.colour)}</span></div><div class="row-actions"><button type="button" data-edit="${product.id}">Edit</button><button type="button" data-delete="${product.id}" class="danger">Delete</button></div></article>`).join('');
}

async function requestCatalog(options = {}) {
  const response = await fetch('/api/products', { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${adminToken}` } });
  if (response.status === 401) throw new Error('Your session has expired. Please sign in again.');
  if (!response.ok) throw new Error('Could not load the catalog.');
  return response.json();
}

async function loadCatalog() {
  setStatus('Loading catalog...');
  try {
    products = await requestCatalog();
    renderProducts();
    setStatus(`${products.length} products published`);
  } catch (error) {
    if (error.message.includes('session has expired')) logout(error.message);
    else setStatus(error.message, true);
  }
}

async function login(event) {
  event.preventDefault();
  const errorElement = byId('loginError');
  errorElement.textContent = '';
  try {
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: byId('username').value, password: byId('password').value }) });
    if (!response.ok) throw new Error('Incorrect username or password.');
    adminToken = (await response.json()).token;
    sessionStorage.setItem(tokenKey, adminToken);
    byId('loginForm').reset();
    setView(true);
    await loadCatalog();
  } catch (error) {
    errorElement.textContent = error.message === 'Failed to fetch' ? 'Start the Vastram server to sign in.' : error.message;
  }
}

function logout(message = '') {
  adminToken = '';
  sessionStorage.removeItem(tokenKey);
  setView(false);
  byId('loginError').textContent = message;
}

async function saveProduct(event) {
  event.preventDefault();
  byId('saveError').textContent = '';
  const id = Number(byId('productId').value || 0);
  const product = { id: id || Date.now(), name: byId('productName').value.trim(), category: byId('productCategory').value, colour: byId('productColour').value.trim(), price: Number(byId('productPrice').value), original: Number(byId('productOriginal').value), discount: Number(byId('productDiscount').value), badge: byId('productBadge').value.trim() || 'New in', image: byId('productImage').value.trim() };
  if (!product.name || !product.colour || !product.image) { byId('saveError').textContent = 'Name, colour, and image are required.'; return; }
  const index = products.findIndex(item => item.id === product.id);
  if (index >= 0) products[index] = product;
  else products.unshift(product);
  try {
    await requestCatalog({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(products) });
    renderProducts();
    resetForm();
    setStatus('Catalog saved');
  } catch (error) {
    byId('saveError').textContent = error.message;
    if (error.message.includes('session has expired')) logout(error.message);
  }
}

async function deleteProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product || !window.confirm(`Delete ${product.name}?`)) return;
  products = products.filter(item => item.id !== id);
  try {
    await requestCatalog({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(products) });
    renderProducts();
    setStatus('Product deleted');
  } catch (error) {
    setStatus(error.message, true);
    if (error.message.includes('session has expired')) logout(error.message);
  }
}

function init() {
  byId('loginForm').addEventListener('submit', login);
  byId('productForm').addEventListener('submit', saveProduct);
  byId('productImage').addEventListener('input', updatePreview);
  byId('newProductButton').addEventListener('click', resetForm);
  byId('resetButton').addEventListener('click', resetForm);
  byId('refreshButton').addEventListener('click', loadCatalog);
  byId('logoutButton').addEventListener('click', () => logout());
  byId('productList').addEventListener('click', event => {
    const edit = event.target.closest('[data-edit]');
    const remove = event.target.closest('[data-delete]');
    if (edit) fillForm(products.find(product => product.id === Number(edit.dataset.edit)));
    if (remove) deleteProduct(Number(remove.dataset.delete));
  });
  if (adminToken) { setView(true); loadCatalog(); }
}

init();
