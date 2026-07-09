// ============================================================
// HORMA — app.js (Carrito completamente funcional)
// ============================================================

(function() {
    'use strict';

    // --- PRODUCTOS ---
    const products = [
        { 
            id: 1, 
            name: 'Air Jordan 1 Retro', 
            desc: 'Edición especial, cuero premium.', 
            price: 220, 
            brand: 'jordan', 
            sizes: [38,39,40,41,42,43], 
            img: 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=400' 
        },
        { 
            id: 2, 
            name: 'Nike Air Max 270', 
            desc: 'Comodidad y estilo en cada paso.', 
            price: 180, 
            brand: 'nike', 
            sizes: [39,40,41,42,43,44], 
            img: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400' 
        },
        { 
            id: 3, 
            name: 'Puma RS-X', 
            desc: 'Diseño retro-futurista, suela gruesa.', 
            price: 150, 
            brand: 'puma', 
            sizes: [38,39,40,41,42], 
            img: 'https://images.pexels.com/photos/1433321/pexels-photo-1433321.jpeg?auto=compress&cs=tinysrgb&w=400' 
        },
        { 
            id: 4, 
            name: 'Adidas Ultraboost', 
            desc: 'Tecnología Boost, máxima amortiguación.', 
            price: 200, 
            brand: 'adidas', 
            sizes: [39,40,41,42,43], 
            img: 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=400' 
        },
        { 
            id: 5, 
            name: 'Jordan Why Not?', 
            desc: 'Firma de Russell Westbrook.', 
            price: 195, 
            brand: 'jordan', 
            sizes: [40,41,42,43,44], 
            img: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=400' 
        },
        { 
            id: 6, 
            name: 'Nike Dunk Low', 
            desc: 'Clásico renovado, colores vibrantes.', 
            price: 160, 
            brand: 'nike', 
            sizes: [38,39,40,41,42], 
            img: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400' 
        }
    ];

    // --- ESTADO ---
    let cart = [];
    let selectedSizes = {};
    let currentFilter = 'all';

    // --- DOM REFS ---
    const grid = document.getElementById('product-grid');
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total-amount');
    const cartCount = document.getElementById('cart-count');
    const cartItemCountLabel = document.getElementById('cart-item-count-label');
    const toastEl = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // --- FUNCIONES ---

    /**
     * Renderiza los productos en el grid
     */
    function renderProducts(filter = 'all') {
        const filtered = filter === 'all' ? products : products.filter(p => p.brand === filter);
        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text-secondary);">
                    <p style="font-size:3rem;margin-bottom:0.5rem;">🔍</p>
                    <p style="font-size:1.2rem;font-weight:600;">No hay productos de esta marca</p>
                </div>
            `;
            return;
        }

        filtered.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'product-card animate-on-scroll';
            card.style.animationDelay = `${index * 0.08}s`;
            card.dataset.productId = p.id;

            // Generar chips de tallas
            let sizeChipsHtml = '';
            p.sizes.forEach(s => {
                const selected = selectedSizes[p.id] === s ? 'is-selected' : '';
                sizeChipsHtml += `<button class="size-chip" data-product="${p.id}" data-size="${s}">${s}</button>`;
            });

            const brandTagClass = p.brand;

            card.innerHTML = `
                <div class="brand-tag ${brandTagClass}">${p.brand}</div>
                <div class="product-image">
                    <img src="${p.img}" alt="${p.name}" loading="lazy" 
                         onerror="this.src='https://placehold.co/400x300/14142a/ffffff?text=${p.brand.toUpperCase()}'">
                </div>
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.desc}</div>
                <div class="product-price">$${p.price}</div>
                <div class="size-row">${sizeChipsHtml}</div>
                <button class="btn-add" data-product="${p.id}">Agregar al carrito</button>
            `;

            grid.appendChild(card);

            // Trigger animación
            requestAnimationFrame(() => {
                card.classList.add('visible');
            });
        });
    }

    /**
     * Agrega un producto al carrito
     */
    function addToCart(productId, size, buttonElement) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Buscar si ya existe el mismo producto con la misma talla
        const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
        
        if (existingIndex !== -1) {
            // Incrementar cantidad
            cart[existingIndex].qty += 1;
            showToast(`✅ +1 ${product.name} (talla ${size})`, 'success');
        } else {
            // Agregar nuevo item
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                brand: product.brand,
                size: size,
                qty: 1,
                img: product.img
            });
            showToast(`✅ Agregaste ${product.name} (talla ${size})`, 'success');
        }
        
        // Efecto visual en el botón
        if (buttonElement) {
            buttonElement.textContent = '✓ Agregado';
            buttonElement.classList.add('added');
            setTimeout(() => {
                buttonElement.classList.remove('added');
                const sizeSelected = selectedSizes[productId];
                buttonElement.textContent = sizeSelected ? `Agregar (talla ${sizeSelected})` : 'Agregar al carrito';
            }, 1200);
        }
        
        updateCartUI();
    }

    /**
     * Elimina un producto del carrito
     */
    function removeFromCart(index) {
        const item = cart[index];
        cart.splice(index, 1);
        updateCartUI();
        showToast(`🗑️ Eliminaste ${item.name}`, 'info');
    }

    /**
     * Actualiza la cantidad de un producto en el carrito
     */
    function updateQuantity(index, delta) {
        if (cart[index]) {
            cart[index].qty = Math.max(1, cart[index].qty + delta);
            updateCartUI();
        }
    }

    /**
     * Actualiza la UI del carrito
     */
    function updateCartUI() {
        const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
        const count = cart.reduce((acc, item) => acc + item.qty, 0);
        
        // Actualizar total y contador
        cartTotal.textContent = `$${total.toFixed(2)}`;
        cartCount.textContent = count;
        cartItemCountLabel.textContent = `(${count} ${count === 1 ? 'item' : 'items'})`;
        
        // Animación del contador
        cartCount.classList.remove('bump');
        if (count > 0) {
            requestAnimationFrame(() => {
                cartCount.classList.add('bump');
            });
        }

        // Renderizar items del carrito
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <span class="empty-icon">👟</span>
                    <div class="empty-title">Tu carrito está vacío</div>
                    <p style="font-size:0.85rem;color:var(--text-secondary);">Agregá tus zapatos favoritos</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-size">Talla ${item.size}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div class="item-qty">
                            <button class="qty-decr" data-index="${index}">−</button>
                            <span>${item.qty}</span>
                            <button class="qty-incr" data-index="${index}">+</button>
                        </div>
                        <span class="item-price">$${(item.price * item.qty).toFixed(2)}</span>
                        <button class="item-remove" data-index="${index}" title="Eliminar">✕</button>
                    </div>
                </div>
            `).join('');

            // Eventos para eliminar
            cartItems.querySelectorAll('.item-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = Number(this.dataset.index);
                    removeFromCart(idx);
                });
            });

            // Eventos para cantidad
            cartItems.querySelectorAll('.qty-incr').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = Number(this.dataset.index);
                    updateQuantity(idx, 1);
                });
            });

            cartItems.querySelectorAll('.qty-decr').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = Number(this.dataset.index);
                    updateQuantity(idx, -1);
                });
            });
        }
    }

    /**
     * Muestra un toast notification
     */
    let toastTimeout;

    function showToast(message, type = 'success') {
        const icons = {
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️',
            error: '❌'
        };
        
        toastMessage.textContent = message;
        toastEl.querySelector('.toast-icon').textContent = icons[type] || '✅';
        
        // Reiniciar barra de progreso
        const progress = toastEl.querySelector('.toast-progress');
        progress.style.animation = 'none';
        requestAnimationFrame(() => {
            progress.style.animation = 'toastProgress 2.5s linear forwards';
        });
        
        toastEl.classList.add('is-visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('is-visible');
        }, 2500);
    }

    /**
     * Abre el carrito
     */
    function openCart() {
        cartPanel.classList.add('is-open');
        cartOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el carrito
     */
    function closeCart() {
        cartPanel.classList.remove('is-open');
        cartOverlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    /**
     * Checkout por WhatsApp
     */
    function checkout() {
        if (cart.length === 0) {
            showToast('⚠️ El carrito está vacío.', 'warning');
            return;
        }
        
        const message = cart.map(item =>
            `${item.name} (talla ${item.size}) × ${item.qty} = $${(item.price * item.qty).toFixed(2)}`
        ).join('\n');
        
        const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
        const fullMsg = `🛒 *Pedido HORMA*\n\n${message}\n\n📦 *Total: $${total.toFixed(2)}*`;
        const url = `https://wa.me/50322000000?text=${encodeURIComponent(fullMsg)}`;
        window.open(url, '_blank');
    }

    // --- FILTROS ---
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderProducts(currentFilter);
        });
    });

    // --- SCROLL ANIMATION ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // --- EVENTOS PRINCIPALES ---
    document.getElementById('btn-cart').addEventListener('click', openCart);
    document.getElementById('btn-cart-close').addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    document.getElementById('btn-checkout').addEventListener('click', checkout);

    // --- DELEGACIÓN DE EVENTOS PARA PRODUCTOS (LA CLAVE) ---
    // Usamos un solo evento en el grid para manejar TODOS los clicks
    
    grid.addEventListener('click', function(e) {
        // 1. Verificar si se hizo click en un size-chip (selección de talla)
        const chip = e.target.closest('.size-chip');
        if (chip) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = parseInt(chip.dataset.product);
            const size = parseInt(chip.dataset.size);
            
            // Encontrar la tarjeta padre
            const card = chip.closest('.product-card');
            if (!card) return;
            
            // Remover selección anterior del mismo producto
            card.querySelectorAll('.size-chip').forEach(b => b.classList.remove('is-selected'));
            chip.classList.add('is-selected');
            
            // Guardar la talla seleccionada
            selectedSizes[productId] = size;
            
            // Actualizar el botón de agregar
            const addBtn = card.querySelector('.btn-add');
            if (addBtn) {
                addBtn.textContent = `Agregar (talla ${size})`;
                addBtn.disabled = false;
            }
            
            console.log(`✅ Talla ${size} seleccionada para producto ${productId}`);
            return;
        }
        
        // 2. Verificar si se hizo click en un btn-add (agregar al carrito)
        const addBtn = e.target.closest('.btn-add');
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = parseInt(addBtn.dataset.product);
            const size = selectedSizes[productId];
            
            if (!size) {
                showToast('⚠️ Seleccioná una talla primero.', 'warning');
                addBtn.classList.add('shake');
                setTimeout(() => { addBtn.classList.remove('shake'); }, 600);
                return;
            }
            
            addToCart(productId, size, addBtn);
            return;
        }
    });

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartPanel.classList.contains('is-open')) {
            closeCart();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (cartPanel.classList.contains('is-open')) {
                closeCart();
            } else {
                openCart();
            }
        }
    });

    // --- INICIALIZAR ---
    renderProducts('all');
    updateCartUI();

    // Observar elementos después de renderizar
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }, 100);

    console.log('🚀 HORMA Sneaker Store cargado correctamente');
    console.log(`📦 ${products.length} productos disponibles`);
    console.log('⌨️ Atajos: ESC para cerrar carrito, Ctrl+K para abrir/cerrar');

})();