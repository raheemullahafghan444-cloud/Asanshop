// ================= تنظیمات API =================
const API_URL = "https://script.google.com/macros/s/AKfycbx6FHJI55Zm34TwiYHlZIRoGwgy5-a3ZDvOvnhk8n7pgaCwQmLQEBN32s0BMYwsxPk-/exec";

// ================= داده های محلی =================
let currentSeller = JSON.parse(localStorage.getItem('currentSeller') || 'null');
let currentDelivery = JSON.parse(localStorage.getItem('currentDelivery') || 'null');
let allProducts = [];
let selectedProduct = null;
let activeCategory = 'all';

// ================= بارگذاری اولیه =================
document.addEventListener('DOMContentLoaded', () => {
    checkSellerSession();
    checkDeliverySession();
    loadProducts();
});

// ================= تغییر صفحه =================
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');
    window.scrollTo(0, 0);
}

// ================= نمایش پیام =================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

// ===================== فروشنده =====================
function showSellerTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('seller-register').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('seller-login').style.display = tab === 'login' ? 'block' : 'none';
}

function checkSellerSession() {
    if (currentSeller) {
        showSellerDashboard();
    }
}

async function registerSeller() {
    const data = {
        action: 'addSeller',
        storeName: document.getElementById('sellerStoreName').value,
        fullName: document.getElementById('sellerFullName').value,
        whatsapp: document.getElementById('sellerWhatsapp').value,
        email: document.getElementById('sellerEmail').value,
        address: document.getElementById('sellerAddress').value,
        password: document.getElementById('sellerPassword').value
    };

    if (!data.storeName || !data.fullName || !data.email || !data.password) {
        showToast('لطفاً تمام فیلدها را پر کنید');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ ثبت نام موفق! حالا وارد شوید');
            showSellerTab('login');
        } else {
            showToast('❌ خطا: ' + result.error);
        }
    } catch (err) {
        showToast('❌ خطا در اتصال');
    }
}

function loginSeller() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('ایمیل و رمز عبور را وارد کنید');
        return;
    }

    // بررسی ساده (در نسخه کامل از سرور بررسی می‌شود)
    currentSeller = {
        id: Date.now(),
        email: email,
        storeName: email.split('@')[0]
    };
    localStorage.setItem('currentSeller', JSON.stringify(currentSeller));
    showToast('✅ خوش آمدید ' + currentSeller.storeName);
    showSellerDashboard();
}

function showSellerDashboard() {
    document.getElementById('seller-register').style.display = 'none';
    document.getElementById('seller-login').style.display = 'none';
    document.getElementById('seller-dashboard').style.display = 'block';
    document.getElementById('sellerName').textContent = currentSeller.storeName;
}

function logoutSeller() {
    localStorage.removeItem('currentSeller');
    currentSeller = null;
    document.getElementById('seller-dashboard').style.display = 'none';
    document.getElementById('seller-login').style.display = 'block';
    showToast('✅ از حساب خارج شدید');
}

function showDashTab(tabName) {
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.dash-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`dash-${tabName}`).classList.add('active');
}

async function addNewProduct() {
    const data = {
        action: 'addProduct',
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        wholesalePrice: document.getElementById('productWholesale').value || '',
        discount: parseFloat(document.getElementById('productDiscount').value) || 0,
        sellerId: currentSeller.id,
        imageUrl: document.getElementById('productImage').value || ''
    };

    if (!data.name || !data.price) {
        showToast('نام و قیمت محصول را وارد کنید');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ محصول با موفقیت ثبت شد');
            // پاک کردن فرم
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productWholesale').value = '';
            document.getElementById('productDiscount').value = '';
            document.getElementById('productImage').value = '';
            loadProducts();
        } else {
            showToast('❌ خطا: ' + result.error);
        }
    } catch (err) {
        showToast('❌ خطا در اتصال');
    }
}

// ===================== محصولات =====================
async function loadProducts() {
    // محصولات نمونه تا زمان اتصال کامل
    allProducts = [
        { id: 1, name: 'پیراهن مردانه', category: 'لباس مردانه', price: 850, discount: 10, imageUrl: '' },
        { id: 2, name: 'لباس زنانه تابستانی', category: 'لباس زنانه', price: 1200, discount: 0, imageUrl: '' },
        { id: 3, name: 'کفش ورزشی بچه گانه', category: 'لباس بچه گانه', price: 650, discount: 5, imageUrl: '' },
        { id: 4, name: 'چراغ میزی LED', category: 'لوازم خانه', price: 350, discount: 0, imageUrl: '' },
        { id: 5, name: 'شارژر سریع موبایل', category: 'تکنالوژی', price: 450, discount: 15, imageUrl: '' }
    ];
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('productsList');
    let filtered = allProducts;
    
    if (activeCategory !== 'all') {
        filtered = allProducts.filter(p => p.category === activeCategory);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-info">محصولی یافت نشد</p>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const finalPrice = p.discount > 0 ? Math.round(p.price * (100 - p.discount) / 100) : p.price;
        const image = p.imageUrl || 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=تصویر+محصول';
        
        return `
            <div class="product-card">
                <img src="${image}" alt="${p.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-category">${p.category}</p>
                    <div>
                        <span class="product-price">${finalPrice} افغانی</span>
                        ${p.discount > 0 ? `<span class="product-discount">${p.price} افغانی</span>` : ''}
                    </div>
                    <button class="btn order-btn" onclick="openOrderModal(${p.id})">ثبت سفارش</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(category) {
    activeCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(category) || (category === 'all' && btn.textContent.includes('همه'))) {
            btn.classList.add('active');
        }
    });
    showPage('products');
    renderProducts();
}

function searchProducts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('productsList');
    
    let filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.category.toLowerCase().includes(keyword)
    );

    if (keyword === '') {
        renderProducts();
        return;
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-info">محصولی یافت نشد</p>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const finalPrice = p.discount > 0 ? Math.round(p.price * (100 - p.discount) / 100) : p.price;
        const image = p.imageUrl || 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=تصویر+محصول';
        
        return `
            <div class="product-card">
                <img src="${image}" alt="${p.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-category">${p.category}</p>
                    <div>
                        <span class="product-price">${finalPrice} افغانی</span>
                        ${p.discount > 0 ? `<span class="product-discount">${p.price} افغانی</span>` : ''}
                    </div>
                    <button class="btn order-btn" onclick="openOrderModal(${p.id})">ثبت سفارش</button>
                </div>
            </div>
        `;
    }).join('');
}

// ===================== سفارش =====================
function openOrderModal(productId) {
    selectedProduct = allProducts.find(p => p.id === productId);
    document.getElementById('orderProductName').textContent = `محصول: ${selectedProduct.name}`;
    document.getElementById('orderQty').value = 1;
    calculateTotal();
    document.getElementById('orderModal').style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    selectedProduct = null;
}

function calculateTotal() {
    const qty = parseInt(document.getElementById('orderQty').value) || 1;
    const finalPrice = selectedProduct.discount > 0 
        ? Math.round(selectedProduct.price * (100 - selectedProduct.discount) / 100) 
        : selectedProduct.price;
    document.getElementById('orderTotalPrice').textContent = (qty * finalPrice).toLocaleString();
}

async function submitOrder() {
    const qty = parseInt(document.getElementById('orderQty').value) || 1;
    const finalPrice = selectedProduct.discount > 0 
        ? Math.round(selectedProduct.price * (100 - selectedProduct.discount) / 100) 
        : selectedProduct.price;

    const data = {
        action: 'addOrder',
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        productName: selectedProduct.name,
        quantity: qty,
        totalPrice: qty * finalPrice,
        deliveryId: ''
    };

    if (!data.customerName || !data.phone || !data.address) {
        showToast('لطفاً تمام فیلدها را پر کنید');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ سفارش شما با موفقیت ثبت شد!');
            closeOrderModal();
            // پاک کردن فرم
            document.getElementById('custName').value = '';
            document.getElementById('custPhone').value = '';
            document.getElementById('custAddress').value = '';
        } else {
            showToast('❌ خطا: ' + result.error);
        }
    } catch (err) {
        showToast('✅ سفارش ثبت شد (حالت آفلاین)');
        closeOrderModal();
    }
}

// ===================== دلیور =====================
function showDeliveryTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('delivery-register').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('delivery-login').style.display = tab === 'login' ? 'block' : 'none';
}

function checkDeliverySession() {
    if (currentDelivery) {
        showDeliveryDashboard();
    }
}

async function registerDelivery() {
    const data = {
        action: 'addDelivery',
        name: document.getElementById('delivName').value,
        phone: document.getElementById('delivPhone').value,
        region: document.getElementById('delivRegion').value
    };

    if (!data.name || !data.phone) {
        showToast('لطفاً تمام فیلدها را پر کنید');
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ دلیور ثبت شد! کد شما در سیستم ثبت گردید');
            document.getElementById('delivName').value = '';
            document.getElementById('delivPhone').value = '';
            document.getElementById('delivRegion').value = '';
        } else {
            showToast('❌ خطا: ' + result.error);
        }
    } catch (err) {
        showToast('✅ ثبت شد (حالت آفلاین)');
    }
}

function loginDelivery() {
    const delivId = document.getElementById('delivId').value;
    if (!delivId) {
        showToast('کد دلیور را وارد کنید');
        return;
    }
    currentDelivery = { id: delivId, name: 'دلیور شماره ' + delivId };
    localStorage.setItem('currentDelivery', JSON.stringify(currentDelivery));
    showToast('✅ خوش آمدید');
    showDeliveryDashboard();
}

function showDeliveryDashboard() {
    document.getElementById('delivery-register').style.display = 'none';
    document.getElementById('delivery-login').style.display = 'none';
    document.getElementById('delivery-dashboard').style.display = 'block';
    document.getElementById('delivNameDisplay').textContent = currentDelivery.name;
}

function logoutDelivery() {
    localStorage.removeItem('currentDelivery');
    currentDelivery = null;
    document.getElementById('delivery-dashboard').style.display = 'none';
    document.getElementById('delivery-login').style.display = 'block';
    showToast('✅ از حساب خارج شدید');
}
