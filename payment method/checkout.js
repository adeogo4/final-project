// Checkout System JavaScript
class CheckoutSystem {
    constructor() {
        this.currentStep = 1;
        this.orderData = {
            shipping: {},
            payment: {},
            items: []
        };
        this.init();
    }

    init() {
        this.loadCartItems();
        this.bindEvents();
        this.updateOrderSummary();
    }

    bindEvents() {
        // Payment method selection
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectPaymentMethod(e.target.value);
            });
        });

        // Card number formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', this.formatCardNumber);
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', this.formatExpiryDate);
        }

        // CVV validation
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', this.formatCVV);
        }

        // Form validation
        document.getElementById('shipping-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateShippingForm();
        });
    }

    loadCartItems() {
        // Get cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.orderData.items = cartItems;
        this.displayOrderItems();
    }

    displayOrderItems() {
        const orderItemsContainer = document.getElementById('order-items');
        if (!orderItemsContainer) return;

        if (this.orderData.items.length === 0) {
            orderItemsContainer.innerHTML = '<p>No items in cart</p>';
            return;
        }

        orderItemsContainer.innerHTML = this.orderData.items.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">
                    ${item.price} × ${item.quantity}
                </div>
            </div>
        `).join('');
    }

    updateOrderSummary() {
        const subtotal = this.calculateSubtotal();
        const shipping = 2500; // Fixed shipping cost
        const total = subtotal + shipping;

        document.getElementById('subtotal').textContent = `₦${subtotal.toLocaleString()}`;
        document.getElementById('shipping-cost').textContent = `₦${shipping.toLocaleString()}`;
        document.getElementById('final-total').textContent = `₦${total.toLocaleString()}`;
    }

    calculateSubtotal() {
        return this.orderData.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace(/[₦,]/g, ''));
            return total + (price * item.quantity);
        }, 0);
    }

    selectPaymentMethod(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(detail => {
            detail.classList.remove('active');
        });

        // Remove selected class from all options
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selected class to chosen option
        const selectedOption = document.querySelector(`[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Show relevant payment details
        const detailsElement = document.getElementById(`${method}-details`);
        if (detailsElement) {
            detailsElement.classList.add('active');
        }

        this.orderData.payment.method = method;
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    }

    formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    formatCVV(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    validateShippingForm() {
        const form = document.getElementById('shipping-form');
        const formData = new FormData(form);
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state'];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            const value = formData.get(field);
            
            if (!value || value.trim() === '') {
                this.showFieldError(input, 'This field is required');
                isValid = false;
            } else {
                this.showFieldSuccess(input);
                this.orderData.shipping[field] = value;
            }
        });

        // Email validation
        const email = formData.get('email');
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(document.getElementById('email'), 'Please enter a valid email');
            isValid = false;
        }

        // Phone validation
        const phone = formData.get('phone');
        if (phone && !this.isValidPhone(phone)) {
            this.showFieldError(document.getElementById('phone'), 'Please enter a valid phone number');
            isValid = false;
        }

        if (isValid) {
            this.nextStep(2);
        }
    }

    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    showFieldSuccess(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('success');
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
    }

    nextStep(step) {
        if (step === 2 && this.currentStep === 1) {
            // Validate shipping form first
            const form = document.getElementById('shipping-form');
            if (!form.checkValidity()) {
                this.validateShippingForm();
                return;
            }
        }

        if (step === 3 && this.currentStep === 2) {
            // Validate payment method
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                alert('Please select a payment method');
                return;
            }
            this.updateReviewSummary();
        }

        this.currentStep = step;
        this.updateStepDisplay();
    }

    prevStep(step) {
        this.currentStep = step;
        this.updateStepDisplay();
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Show current step content
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    updateReviewSummary() {
        // Update shipping summary
        const shippingSummary = document.getElementById('shipping-summary');
        const shipping = this.orderData.shipping;
        shippingSummary.innerHTML = `
            <p><strong>${shipping.firstName} ${shipping.lastName}</strong></p>
            <p>${shipping.address}</p>
            <p>${shipping.city}, ${shipping.state} ${shipping.zipCode || ''}</p>
            <p>Phone: ${shipping.phone}</p>
            <p>Email: ${shipping.email}</p>
        `;

        // Update payment summary
        const paymentSummary = document.getElementById('payment-summary');
        const paymentMethod = this.orderData.payment.method;
        const paymentNames = {
            card: 'Credit/Debit Card',
            bank: 'Bank Transfer',
            paystack: 'Paystack',
            flutterwave: 'Flutterwave',
            cod: 'Cash on Delivery'
        };
        paymentSummary.innerHTML = `<p>${paymentNames[paymentMethod] || 'Not selected'}</p>`;
    }

    async placeOrder() {
        const button = document.querySelector('.btn-place-order');
        const originalText = button.textContent;
        
        // Show loading state
        button.innerHTML = '<span class="loading"></span> Processing...';
        button.disabled = true;

        try {
            // Simulate API call
            await this.processPayment();
            
            // Generate order number
            const orderNumber = 'FS' + Date.now().toString().slice(-6);
            
            // Clear cart
            localStorage.removeItem('cartItems');
            
            // Show success message
            this.showSuccessMessage(orderNumber);
            
        } catch (error) {
            alert('Payment failed. Please try again.');
            console.error('Payment error:', error);
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    async processPayment() {
        const paymentMethod = this.orderData.payment.method;
        
        switch (paymentMethod) {
            case 'card':
                return this.processCardPayment();
            case 'bank':
                return this.processBankTransfer();
            case 'paystack':
                return this.processPaystack();
            case 'flutterwave':
                return this.processFlutterwave();
            case 'cod':
                return this.processCOD();
            default:
                throw new Error('Invalid payment method');
        }
    }

    async processCardPayment() {
        // Simulate card processing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, transactionId: 'TXN' + Date.now() });
            }, 2000);
        });
    }

    async processBankTransfer() {
        // Bank transfer processing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, reference: 'BT' + Date.now() });
            }, 1500);
        });
    }

    async processPaystack() {
        // Paystack integration would go here
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, reference: 'PS' + Date.now() });
            }, 2000);
        });
    }

    async processFlutterwave() {
        // Flutterwave integration would go here
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, reference: 'FW' + Date.now() });
            }, 2000);
        });
    }

    async processCOD() {
        // Cash on delivery processing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, reference: 'COD' + Date.now() });
            }, 1000);
        });
    }

    showSuccessMessage(orderNumber) {
        const checkoutContent = document.querySelector('.checkout-content');
        checkoutContent.innerHTML = `
            <div class="success-message">
                <h2>🎉 Order Placed Successfully!</h2>
                <p>Thank you for your purchase. Your order has been confirmed.</p>
                <div class="order-number">Order Number: ${orderNumber}</div>
                <p>You will receive a confirmation email shortly.</p>
                <div style="margin-top: 30px;">
                    <a href="../index.html" class="btn-next">Continue Shopping</a>
                    <a href="../cart.html" class="btn-back" style="margin-left: 15px;">View Cart</a>
                </div>
            </div>
        `;
    }
}

// Global functions for button clicks
function nextStep(step) {
    checkout.nextStep(step);
}

function prevStep(step) {
    checkout.prevStep(step);
}

function placeOrder() {
    checkout.placeOrder();
}

// Initialize checkout system
const checkout = new CheckoutSystem();

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'inline' : 'none';
    });
});