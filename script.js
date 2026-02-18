

        // Cart Data Structure
        let cart = [];
        let orderMethod = 'whatsapp'; // Default order method
      
        
        // Function to load products from API
        async function loadProductsFromAPI() {
            try {
                const response = await fetch(`${API_URL}/products`);
                if (response.ok) {
                    allProductsCache = await response.json();
                    return allProductsCache;
                }
            } catch (error) {
                console.warn('Could not load from API, using fallback:', error);
            }
            return [];
        }
        
        // Function to get products by category
        async function getProductsByCategory(category) {
            if (allProductsCache.length === 0) {
                await loadProductsFromAPI();
            }
            
            // Map section IDs to category values
            const categoryMap = {
                'snacks': 'snacks',
                'kota-chips': 'kota',
                'drinks': 'drinks',
                'burger': 'burger',
                'pizza': 'pizza'
            };
            
            const categoryValue = categoryMap[category] || category;
            return allProductsCache.filter(product => product.category === categoryValue);
        }
        
        // DOM Elements
        const cartIcon = document.getElementById('cart-icon');
        const cartModal = document.getElementById('cart-modal');
        const closeCart = document.getElementById('close-cart');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const cartCountElement = document.querySelector('.cart-count');
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        const clearCartButton = document.getElementById('clear-cart');
        const checkoutButton = document.getElementById('checkout-btn');
        const orderModal = document.getElementById('order-modal');
        const orderForm = document.getElementById('order-form');
        const orderItemsList = document.getElementById('order-items-list');
        const orderSummaryTotal = document.getElementById('order-summary-total');
        const successMessage = document.getElementById('success-message');
        const successMessageText = document.getElementById('success-message-text');
        const floatingWhatsApp = document.getElementById('floating-whatsapp');
        const orderNowButton = document.getElementById('order-now-btn');
        const heroOrderButton = document.getElementById('hero-order-btn');
        
        // Email and WhatsApp details
        const businessEmail = 'morganfrans6@gmail.com';
        const businessWhatsApp = '27609050450'; // South Africa format with country code
        
        // Initialize Cart
        function initCart() {
            const savedCart = localStorage.getItem('errolKotasCart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                updateCartDisplay();
            }
        }
        
        // Save Cart to Local Storage
        function saveCart() {
            localStorage.setItem('errolKotasCart', JSON.stringify(cart));
        }
        
        // Update Cart Display
        function updateCartDisplay() {
            // Update cart count
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            
            // Update cart items
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart-message" style="text-align: center; padding: 40px 20px; color: #777;">
                        <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                        <h3>Your cart is empty</h3>
                        <p>Add some delicious items from our menu!</p>
                    </div>
                `;
            } else {
                cartItemsContainer.innerHTML = '';
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-img">
                            <i class="fas fa-${getProductIcon(item.id)}"></i>
                        </div>
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">R${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                });
                
                // Add event listeners to new buttons
                document.querySelectorAll('.decrease-quantity').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        updateQuantity(id, -1);
                    });
                });
                
                document.querySelectorAll('.increase-quantity').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        updateQuantity(id, 1);
                    });
                });
                
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        removeFromCart(id);
                    });
                });
            }
            
            // Update cart total
            const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            cartTotalElement.textContent = `R${cartTotal.toFixed(2)}`;
            
            // Save cart to localStorage
            saveCart();
        }
        
        // Get product icon based on ID
        function getProductIcon(id) {
            const iconMap = {
                '1': 'hotdog',
                '2': 'drumstick-bite',
                '3': 'cheese',
                '4': 'pepper-hot',
                '5': 'wine-bottle',
                '6': 'glass-water',
                '7': 'ice-cream',
                '8': 'leaf',
                '9': 'hamburger',
                '10': 'bacon',
                '11': 'drumstick-bite',
                '12': 'pizza-slice',
                '13': 'pizza-slice',
                '14': 'leaf',
                '15': 'mushroom',
                '16': 'fire',
                '17': 'cookie',
                '18': 'ring',
                '19': 'shrimp',
                '20': 'star'
            };
            return iconMap[id] || 'hamburger';
        }
        
        // Add to Cart
        function addToCart(productId, productName, productPrice) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: parseFloat(productPrice),
                    quantity: 1
                });
            }
            
            updateCartDisplay();
            showSuccessMessage(`${productName} added to cart!`);
        }
        
        // Update Quantity
        function updateQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            
            if (item) {
                item.quantity += change;
                
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    updateCartDisplay();
                }
            }
        }
        
        // Remove from Cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartDisplay();
            showSuccessMessage('Item removed from cart');
        }
        
        // Clear Cart
        function clearCart() {
            cart = [];
            updateCartDisplay();
            showSuccessMessage('Cart cleared');
        }
        
        // Show Success Message
        function showSuccessMessage(message) {
            successMessageText.textContent = message;
            successMessage.classList.add('show');
            
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000);
        }
        
        // Open Cart Modal
        function openCartModal() {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Close Cart Modal
        function closeCartModal() {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Open Order Modal
        function openOrderModal() {
            if (cart.length === 0) {
                showSuccessMessage('Please add items to your cart first');
                openCartModal();
                return;
            }
            
            // Close cart modal if open
            closeCartModal();
            
            // Update order summary
            updateOrderSummary();
            
            // Open order modal
            orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Update Order Summary
        function updateOrderSummary() {
            orderItemsList.innerHTML = '';
            let orderTotal = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                orderTotal += itemTotal;
                
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <span>${item.name} x ${item.quantity}</span>
                    <span>R${itemTotal.toFixed(2)}</span>
                `;
                orderItemsList.appendChild(orderItem);
            });
            
            orderSummaryTotal.textContent = `Total: R${orderTotal.toFixed(2)}`;
        }
        
        // Close Order Modal
        function closeOrderModal() {
            orderModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Set Order Method
        function setOrderMethod(method) {
            orderMethod = method;
            
            // Update UI
            document.querySelectorAll('.order-method').forEach(el => {
                el.classList.remove('active');
            });
            
            document.querySelector(`.order-method[data-method="${method}"]`).classList.add('active');
        }
        
        // Generate Order Message
        function generateOrderMessage(customerData) {
            let message = `*NEW ORDER - Errol Kotas*\n\n`;
            message += `*Customer Details:*\n`;
            message += `Name: ${customerData.name}\n`;
            message += `Phone: ${customerData.phone}\n`;
            message += `Email: ${customerData.email}\n`;
            message += `Address: ${customerData.address}\n`;
            message += `Delivery Time: ${customerData.deliveryTime}\n\n`;
            
            message += `*Order Items:*\n`;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                message += `${item.name} x ${item.quantity} - R${itemTotal.toFixed(2)}\n`;
            });
            
            const orderTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            message += `\n*Order Total: R${orderTotal.toFixed(2)}*\n\n`;
            message += `*Order Time:* ${new Date().toLocaleString()}\n`;
            message += `Thank you for your order!`;
            
            return message;
        }
        
        // Submit Order
        function submitOrder(customerData) {
            const orderMessage = generateOrderMessage(customerData);
            
            if (orderMethod === 'whatsapp') {
                // Send via WhatsApp
                const whatsappUrl = `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent(orderMessage)}`;
                window.open(whatsappUrl, '_blank');
                showSuccessMessage('Opening WhatsApp to send your order...');
            } else {
                // Send via Email
                const subject = `New Order from ${customerData.name} - Errol Kotas`;
                const mailtoLink = `mailto:${businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderMessage)}`;
                window.location.href = mailtoLink;
                showSuccessMessage('Opening email client to send your order...');
            }
            
            // Clear cart after order
            clearCart();
            
            // Close order modal
            closeOrderModal();
        }
        
        // Event Listeners
        cartIcon.addEventListener('click', openCartModal);
        closeCart.addEventListener('click', closeCartModal);
        
        // Close modals when clicking outside
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
        
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeOrderModal();
            }
        });
        
        // Add to Cart buttons
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const price = this.getAttribute('data-price');
                addToCart(id, name, price);
            });
        });
        
        // Clear Cart button
        clearCartButton.addEventListener('click', clearCart);
        
        // Checkout button
        checkoutButton.addEventListener('click', openOrderModal);
        
        // Order Now buttons
        orderNowButton.addEventListener('click', openOrderModal);
        heroOrderButton.addEventListener('click', function(e) {
            e.preventDefault();
            openOrderModal();
        });
        
        // Floating WhatsApp button
        floatingWhatsApp.addEventListener('click', function() {
            if (cart.length === 0) {
                showSuccessMessage('Please add items to your cart first');
                openCartModal();
            } else {
                openOrderModal();
            }
        });
        
        // Order Method Selection
        document.querySelectorAll('.order-method').forEach(method => {
            method.addEventListener('click', function() {
                const methodValue = this.getAttribute('data-method');
                setOrderMethod(methodValue);
            });
        });
        
        // Order Form Submission
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const customerData = {
                name: document.getElementById('customer-name').value,
                phone: document.getElementById('customer-phone').value,
                email: document.getElementById('customer-email').value,
                address: document.getElementById('customer-address').value,
                deliveryTime: document.getElementById('delivery-time').value
            };
            
            submitOrder(customerData);
        });
        
        // Navigation functionality
        const navLinks = document.querySelectorAll('.nav-links a');
        const categoryItems = document.querySelectorAll('.category-item');
        
        function setActiveLink(links, targetId) {
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === targetId) {
                    link.classList.add('active');
                }
            });
        }
        
        // Handle main nav clicks
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                setActiveLink(navLinks, targetId);
                setActiveLink(categoryItems, targetId);
                
                const targetSection = document.querySelector(targetId);
                if(targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 150,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Handle category nav clicks
        categoryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                setActiveLink(categoryItems, targetId);
                setActiveLink(navLinks, targetId);
                
                const targetSection = document.querySelector(targetId);
                if(targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 150,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Initialize the website
        document.addEventListener('DOMContentLoaded', function() {
            initCart();
            loadDynamicProducts();
            console.log("Errol Kotas Website Loaded!");
            console.log("Order System Ready - Email: morganfrans6@gmail.com | WhatsApp: 0609050450");
            console.log("Admin Panel: admin.html (Demo: admin/admin)");
            
            // Show welcome message
            setTimeout(() => {
                showSuccessMessage('Welcome to Errol Kotas! Start adding items to your cart.');
            }, 1000);
            
            // Add keyboard navigation
            document.addEventListener('keydown', function(e) {
                // Press 'C' to open cart
                if (e.key === 'c' || e.key === 'C') {
                    if (!orderModal.classList.contains('active')) {
                        openCartModal();
                    }
                }
                // Press 'Escape' to close modals
                if (e.key === 'Escape') {
                    closeCartModal();
                    closeOrderModal();
                }
            });
            
            // Add scroll animations for sections
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            // Observe all product cards and other elements
            document.querySelectorAll('.product-card, .testimonial-card, .feature').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(el);
            });
            
            // Add product search functionality
            const addSearchBar = document.createElement('div');
            addSearchBar.innerHTML = `
                <div id="search-bar" style="background-color: var(--kfc-gray); padding: 20px 0; margin-bottom: 30px; display: none;">
                    <div class="container">
                        <input type="text" id="search-input" placeholder="🔍 Search for products... (press / to search)" 
                            style="width: 100%; padding: 12px 20px; border: 2px solid var(--kfc-red); border-radius: 50px; font-size: 1rem;">
                    </div>
                </div>
            `;
            document.querySelector('.hero').insertAdjacentHTML('afterend', addSearchBar.innerHTML);
            
            // Search functionality
            const searchInput = document.getElementById('search-input');
            const searchBar = document.getElementById('search-bar');
            
            // Press '/' to focus search
            document.addEventListener('keydown', function(e) {
                if (e.key === '/') {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
            
            // Close search results when clicking elsewhere
            document.addEventListener('click', function(e) {
                if (!e.target.matches('#search-input')) {
                    // Hide search bar on click outside
                }
            });
            
            // Add active state indicators
            updateActiveNavigation();
            window.addEventListener('scroll', updateActiveNavigation);
        });
        
        // Load Products Dynamically
        async function loadDynamicProducts() {
            // Load products from API
            const products = await loadProductsFromAPI();
            
            // Load products for each section
            await loadSectionProducts('kota-chips');
            await loadSectionProducts('drinks');
            await loadSectionProducts('burger');
            await loadSectionProducts('pizza');
            await loadSectionProducts('snacks');
            
            // Re-attach event listeners to dynamically added buttons
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
            addToCartButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const name = this.getAttribute('data-name');
                    const price = this.getAttribute('data-price');
                    addToCart(id, name, price);
                });
            });
        }
        
        // Load Products for a Section
        async function loadSectionProducts(sectionId) {
            const products = await getProductsByCategory(sectionId);
            const gridContainer = document.querySelector(`#${sectionId} .products-grid`);
            
            if (!gridContainer) return;
            
            // If no products, show empty message
            if (products.length === 0) {
                gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;"><p>No products available yet. Check back soon!</p></div>';
                return;
            }
            
            // Clear existing products and rebuild
            gridContainer.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-img">
                        ${product.image ? 
                            `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `<i class="fas fa-${getProductIcon(product.id)}"></i>`
                        }
                        ${product.badge ? `<div class="product-badge">${product.badge.toUpperCase()}</div>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">
                            <span class="price">R${parseFloat(product.price).toFixed(2)}</span>
                            <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                                <i class="fas fa-cart-plus"></i>
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Re-attach event listeners for newly added buttons
            gridContainer.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const name = this.getAttribute('data-name');
                    const price = this.getAttribute('data-price');
                    addToCart(id, name, price);
                });
            });
        }
        
        // Update active navigation based on scroll position
        function updateActiveNavigation() {
            const sections = document.querySelectorAll('.products-section, .testimonials-section');
            const navLinks = document.querySelectorAll('.nav-links a, .category-item');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 200;
                const sectionBottom = sectionTop + section.offsetHeight;
                const scrollPosition = window.scrollY;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const sectionId = '#' + section.id;
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
        
        // Add smooth scroll behavior
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
   

