// Static Version - Open/Closed state stored in localStorage
let is_open = localStorage.getItem('is_open') !== 'false';
const closedMessage = "Sorry bro, the barbershop is closed right now. We will be back soon!";

function checkStatus() {
    const banner = document.getElementById('status-banner');
    const bookBtn = document.getElementById('book-btn');
    
    if (!is_open) {
        banner.style.display = 'block';
        banner.className = 'status-closed';
        banner.innerText = closedMessage;
        bookBtn.disabled = true;
        bookBtn.innerText = "SHOP CLOSED";
        bookBtn.style.opacity = "0.5";
        bookBtn.style.cursor = "not-allowed";
    } else {
        banner.style.display = 'none';
        bookBtn.disabled = false;
        bookBtn.innerText = "Confirm & Pay via QR";
        bookBtn.style.opacity = "1";
        bookBtn.style.cursor = "pointer";
    }
}

function toggleShopStatus() {
    is_open = !is_open;
    localStorage.setItem('is_open', is_open);
    checkStatus();
    alert(`Shop is now ${is_open ? 'OPEN' : 'CLOSED'}`);
}

const form = document.getElementById('book-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const bank = document.getElementById('bank').value;
        
        const bookBtn = document.getElementById('book-btn');
        bookBtn.innerText = "Processing Transaction...";
        bookBtn.disabled = true;

        // Artificial delay for premium feel
        setTimeout(() => {
            alert(`SUCCESS! 400 SOM deducted from your ${bank.toUpperCase()} card. Redirecting to receipt...`);
            window.location.href = `https://mock-payment-gateway.com/${bank}?amount=400&to=AminURJ&user=${encodeURIComponent(name)}`;
        }, 2000);
    });
}

// Initial status check
checkStatus();
