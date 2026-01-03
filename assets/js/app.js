// Swimsuit Products Data
const products = [
    {
        id: 1,
        name: "Ocean Breeze One-Piece",
        price: 89.99,
        image: "assets/images/products/ocean-breeze.svg",
        description: "Classic one-piece with elegant cutouts and UPF 50+ sun protection",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Navy", "Black", "Coral"]
    },
    {
        id: 2,
        name: "Sunset Bikini Set",
        price: 79.99,
        image: "assets/images/products/sunset-bikini.svg",
        description: "Triangle bikini top with adjustable ties and matching bottoms",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Coral", "Turquoise", "Yellow"]
    },
    {
        id: 3,
        name: "Wave Rider Sports Bikini",
        price: 94.99,
        image: "assets/images/products/wave-rider.svg",
        description: "High-support sports bikini perfect for active water sports",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Teal"]
    },
    {
        id: 4,
        name: "Tropical Paradise Tankini",
        price: 84.99,
        image: "assets/images/products/tropical-paradise.svg",
        description: "Comfortable tankini with tropical print and built-in shelf bra",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: ["Floral Blue", "Floral Pink", "Tropical Green"]
    },
    {
        id: 5,
        name: "Midnight Plunge One-Piece",
        price: 99.99,
        image: "assets/images/products/midnight-plunge.svg",
        description: "Sophisticated plunge neckline with tummy control technology",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Deep Blue", "Wine"]
    },
    {
        id: 6,
        name: "Coral Reef High-Waist Set",
        price: 74.99,
        image: "assets/images/products/coral-reef.svg",
        description: "Retro-inspired high-waist bottoms with bandeau top",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Coral", "Mint", "Lavender"]
    },
    {
        id: 7,
        name: "Azure Wave Athletic One-Piece",
        price: 109.99,
        image: "assets/images/products/azure-wave.svg",
        description: "Performance swimsuit with chlorine-resistant fabric",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Azure Blue", "Racing Red", "Electric Green"]
    },
    {
        id: 8,
        name: "Sahara Sun Bikini",
        price: 69.99,
        image: "assets/images/products/sahara-sun.svg",
        description: "Minimal coverage bikini with adjustable straps and gold hardware",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Sand", "White", "Terracotta"]
    }
];

// Cart management
let cart = JSON.parse(localStorage.getItem('swimwearCart')) || [];

// Stripe configuration (Replace with your actual publishable key)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz'; // Replace with your key
let stripe;
let elements;
let cardElement;

// Initialize Stripe
function initializeStripe() {
    try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        elements = stripe.elements();
        cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });
    } catch (error) {
        console.log('Stripe initialization: Using test mode');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeStripe();
    renderProducts();
    updateCartUI();
    setupEventListeners();
});

// Render products
function renderProducts() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl"
             onclick="openProductModal(${product.id})">
            <div class="relative overflow-hidden aspect-[3/4] image-placeholder">
                <img src="${product.image}"
                     alt="${product.name}"
                     class="w-full h-full object-cover"
                     loading="lazy">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span class="font-bold text-cyan-600">$${product.price}</span>
                </div>
            </div>
            <div class="p-6">
                <h4 class="text-xl font-bold text-gray-800 mb-2">${product.name}</h4>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex space-x-1">
                        ${product.colors.slice(0, 3).map(color => `
                            <div class="w-6 h-6 rounded-full border-2 border-gray-300"
                                 style="background: ${getColorHex(color)}"
                                 title="${color}"></div>
                        `).join('')}
                    </div>
                    <button onclick="event.stopPropagation(); quickAddToCart(${product.id})"
                            class="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition text-sm font-semibold">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Get color hex for display
function getColorHex(colorName) {
    const colorMap = {
        'Navy': '#001f3f',
        'Black': '#000000',
        'Coral': '#FF6B6B',
        'Turquoise': '#40E0D0',
        'Yellow': '#FFD700',
        'Teal': '#008080',
        'White': '#FFFFFF',
        'Sand': '#C2B280',
        'Terracotta': '#E27149',
        'Azure Blue': '#007FFF',
        'Racing Red': '#FF0000',
        'Electric Green': '#00FF00',
        'Deep Blue': '#00008B',
        'Wine': '#722F37',
        'Mint': '#98FF98',
        'Lavender': '#E6E6FA',
        'Floral Blue': '#4A90E2',
        'Floral Pink': '#FF69B4',
        'Tropical Green': '#00A86B'
    };
    return colorMap[colorName] || '#CCCCCC';
}

// Quick add to cart
function quickAddToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        addToCart({
            ...product,
            selectedSize: product.sizes[2] || product.sizes[0], // Default to medium or first size
            selectedColor: product.colors[0],
            quantity: 1
        });
    }
}

// Open product modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <div class="relative overflow-hidden rounded-xl aspect-[3/4] image-placeholder">
                <img src="${product.image}"
                     alt="${product.name}"
                     class="w-full h-full object-cover">
            </div>
            <div class="flex flex-col">
                <h3 class="text-3xl font-bold text-gray-800 mb-2">${product.name}</h3>
                <p class="text-3xl font-bold text-cyan-600 mb-4">$${product.price}</p>
                <p class="text-gray-600 mb-6">${product.description}</p>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
                    <div class="flex flex-wrap gap-2" id="sizeOptions">
                        ${product.sizes.map(size => `
                            <button class="size-option px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:border-cyan-600"
                                    data-size="${size}">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Select Color</label>
                    <div class="flex flex-wrap gap-2" id="colorOptions">
                        ${product.colors.map(color => `
                            <button class="size-option px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:border-cyan-600 flex items-center space-x-2"
                                    data-color="${color}">
                                <div class="w-4 h-4 rounded-full border border-gray-400" style="background: ${getColorHex(color)}"></div>
                                <span>${color}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <div class="flex items-center space-x-4">
                        <button onclick="adjustQuantity(-1)" class="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300">
                            -
                        </button>
                        <span id="quantityDisplay" class="text-xl font-bold">1</span>
                        <button onclick="adjustQuantity(1)" class="w-10 h-10 bg-gray-200 rounded-lg font-bold hover:bg-gray-300">
                            +
                        </button>
                    </div>
                </div>

                <button onclick="addFromModal(${product.id})"
                        class="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 mt-auto">
                    Add to Cart
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Set up size and color selection
    setTimeout(() => {
        const sizeButtons = modalContent.querySelectorAll('.size-option[data-size]');
        const colorButtons = modalContent.querySelectorAll('.size-option[data-color]');

        sizeButtons.forEach((btn, index) => {
            if (index === 2 || (index === 0 && sizeButtons.length < 3)) {
                btn.classList.add('selected');
            }
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        colorButtons.forEach((btn, index) => {
            if (index === 0) btn.classList.add('selected');
            btn.addEventListener('click', () => {
                colorButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    }, 100);
}

let currentQuantity = 1;

function adjustQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    document.getElementById('quantityDisplay').textContent = currentQuantity;
}

function addFromModal(productId) {
    const product = products.find(p => p.id === productId);
    const selectedSize = document.querySelector('.size-option[data-size].selected')?.dataset.size;
    const selectedColor = document.querySelector('.size-option[data-color].selected')?.dataset.color;

    if (!selectedSize || !selectedColor) {
        alert('Please select a size and color');
        return;
    }

    addToCart({
        ...product,
        selectedSize,
        selectedColor,
        quantity: currentQuantity
    });

    closeProductModal();
    currentQuantity = 1;
}

// Add to cart
function addToCart(item) {
    const existingItem = cart.find(
        i => i.id === item.id &&
        i.selectedSize === item.selectedSize &&
        i.selectedColor === item.selectedColor
    );

    if (existingItem) {
        existingItem.quantity += item.quantity;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
            quantity: item.quantity
        });
    }

    saveCart();
    updateCartUI();
    showCartSidebar();
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// Update cart quantity
function updateCartQuantity(index, change) {
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    saveCart();
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('swimwearCart', JSON.stringify(cart));
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                <i class="fas fa-shopping-cart text-6xl mb-4"></i>
                <p class="text-lg">Your cart is empty</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item flex space-x-4 mb-4 pb-4 border-b">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${item.name}</h4>
                    <p class="text-sm text-gray-600">${item.selectedColor} • ${item.selectedSize}</p>
                    <p class="text-cyan-600 font-bold mt-1">$${item.price}</p>
                    <div class="flex items-center space-x-2 mt-2">
                        <button onclick="updateCartQuantity(${index}, -1)"
                                class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm">-</button>
                        <span class="text-sm font-semibold">${item.quantity}</span>
                        <button onclick="updateCartQuantity(${index}, 1)"
                                class="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm">+</button>
                        <button onclick="removeFromCart(${index})"
                                class="ml-auto text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
}

// Show/hide cart sidebar
function showCartSidebar() {
    document.getElementById('cartSidebar').classList.remove('translate-x-full');
}

function hideCartSidebar() {
    document.getElementById('cartSidebar').classList.add('translate-x-full');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Open checkout
function openCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    checkoutItems.innerHTML = cart.map(item => `
        <div class="flex justify-between text-sm">
            <span>${item.name} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity}</span>
            <span class="font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    checkoutTotal.textContent = `$${totalPrice.toFixed(2)}`;

    checkoutModal.classList.remove('hidden');
    checkoutModal.classList.add('flex');
    hideCartSidebar();
}

// Close checkout
function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.add('hidden');
    document.getElementById('checkoutModal').classList.remove('flex');
    document.getElementById('stripePaymentForm').classList.add('hidden');
    document.getElementById('venmoPaymentInfo').classList.add('hidden');
}

// Show Stripe payment form
function showStripePayment() {
    const form = document.getElementById('shippingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    document.getElementById('stripePaymentForm').classList.remove('hidden');
    document.getElementById('venmoPaymentInfo').classList.add('hidden');

    if (cardElement && !cardElement._attached) {
        cardElement.mount('#card-element');
        cardElement._attached = true;

        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
}

// Show Venmo payment info
function showVenmoPayment() {
    const form = document.getElementById('shippingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    document.getElementById('venmoPaymentInfo').classList.remove('hidden');
    document.getElementById('stripePaymentForm').classList.add('hidden');

    // Generate order number
    const orderNumber = 'WW' + Date.now().toString().slice(-8);
    document.getElementById('orderNumber').textContent = orderNumber;
}

// Process Stripe payment
async function processStripePayment() {
    const form = document.getElementById('shippingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // In a real application, you would create a payment intent on your server
    // and confirm it here. This is a simplified demo.

    try {
        // Simulate payment processing
        const submitButton = document.getElementById('submitStripePayment');
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="spinner mx-auto"></div>';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, you would do:
        // const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
        //     payment_method: {
        //         card: cardElement,
        //         billing_details: { ... }
        //     }
        // });

        completeOrder();
    } catch (error) {
        alert('Payment failed. Please try again.');
        console.error(error);
        const submitButton = document.getElementById('submitStripePayment');
        submitButton.disabled = false;
        submitButton.textContent = 'Complete Payment';
    }
}

// Process Venmo payment
function processVenmoPayment() {
    // In a real application, you would verify the Venmo payment
    // This is simplified for demo purposes
    completeOrder();
}

// Complete order
function completeOrder() {
    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();

    // Close checkout
    closeCheckoutModal();

    // Show success modal
    const successModal = document.getElementById('successModal');
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');

    // Reset form
    document.getElementById('shippingForm').reset();
}

// Setup event listeners
function setupEventListeners() {
    // Cart sidebar
    document.getElementById('cartBtn').addEventListener('click', showCartSidebar);
    document.getElementById('closeCart').addEventListener('click', hideCartSidebar);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

    // Product modal
    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') closeProductModal();
    });

    // Checkout modal
    document.getElementById('closeCheckout').addEventListener('click', closeCheckoutModal);
    document.getElementById('checkoutModal').addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') closeCheckoutModal();
    });

    // Payment buttons
    document.getElementById('stripePaymentBtn').addEventListener('click', showStripePayment);
    document.getElementById('venmoPaymentBtn').addEventListener('click', showVenmoPayment);
    document.getElementById('submitStripePayment').addEventListener('click', processStripePayment);
    document.getElementById('confirmVenmoPayment').addEventListener('click', processVenmoPayment);

    // Success modal
    document.getElementById('closeSuccess').addEventListener('click', () => {
        document.getElementById('successModal').classList.add('hidden');
        document.getElementById('successModal').classList.remove('flex');
    });
}
