// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-btn') || e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.addToCart(e.target);
            }
        });
    }

    addToCart(button) {
        const productCard = button.closest('.product-card');
        if (!productCard) return;

        const product = {
            id: Date.now() + Math.random(),
            image: productCard.querySelector('img').src,
            name: productCard.querySelector('.card-text')?.textContent || 'Product',
            price: productCard.querySelector('.text-danger').textContent,
            originalPrice: productCard.querySelector('.text-muted')?.textContent || '',
            quantity: 1
        };

        // Check if product already exists
        const existingItem = this.items.find(item => 
            item.image === product.image && item.price === product.price
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push(product);
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddedNotification(product.name);
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }

    updateCartCount() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    }

    showAddedNotification(productName) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>✓ ${productName} added to cart!</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace(/[₦,]/g, ''));
            return total + (price * item.quantity);
        }, 0);
    }

    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = '₦0';
            return;
        }

        cartContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <div class="price-info">
                        <span class="current-price">${item.price}</span>
                        ${item.originalPrice ? `<span class="original-price">${item.originalPrice}</span>` : ''}
                    </div>
                </div>
                <div class="quantity-controls">
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    ₦${(parseFloat(item.price.replace(/[₦,]/g, '')) * item.quantity).toLocaleString()}
                </div>
                <button class="remove-btn" onclick="cart.removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.textContent = `₦${this.getTotal().toLocaleString()}`;
        }
    }
}

// Initialize cart
const cart = new ShoppingCart();

// If we're on the cart page, render the cart
if (document.getElementById('cart-items')) {
    cart.renderCart();
}