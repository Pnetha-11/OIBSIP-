let display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;

// Create floating particles
function createParticles() {
    const particles = document.querySelector('.particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particles.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// Update display
function updateDisplay() {
    display.value = currentInput;
    display.classList.add('animate');
    setTimeout(() => display.classList.remove('animate'), 500);
}

// Append to display
function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        currentInput += value;
    }
    
    updateDisplay();
    createRippleEffect(event.target);
}

// Clear display
function clearDisplay() {
    currentInput = '0';
    updateDisplay();
    createRippleEffect(event.target);
}

// Delete last character
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
    createRippleEffect(event.target);
}

// Calculate result
function calculateResult() {
    try {
        // Replace display symbols with actual operators
        let expression = currentInput
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Evaluate the expression
        let result = eval(expression);
        
        if (result === Infinity || result === -Infinity) {
            currentInput = 'Error';
        } else if (isNaN(result)) {
            currentInput = 'Error';
        } else {
            currentInput = result.toString();
        }
        
        shouldResetDisplay = true;
        updateDisplay();
        
        // Special animation for calculation
        display.style.background = 'linear-gradient(145deg, #d5f4e6, #c8e6c9)';
        setTimeout(() => {
            display.style.background = 'linear-gradient(145deg, #ffffff, #f0f2f5)';
        }, 1000);
        
    } catch (error) {
        currentInput = 'Error';
        shouldResetDisplay = true;
        updateDisplay();
    }
    
    createRippleEffect(event.target);
}

// Create ripple effect
function createRippleEffect(button) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    
    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault();
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize display
updateDisplay();