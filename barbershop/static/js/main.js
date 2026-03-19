async function checkStatus() {
    const response = await fetch('/api/status');
    const status = await response.json();
    const banner = document.getElementById('status-banner');
    const bookBtn = document.getElementById('book-btn');
    const bookForm = document.getElementById('book-form');
    
    if (!status.is_open) {
        banner.style.display = 'block';
        banner.className = 'status-closed';
        banner.innerText = status.closed_message;
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

async function toggleShopStatus() {
    const currentResponse = await fetch('/api/status');
    const currentStatus = await currentResponse.json();
    
    const newStatus = !currentStatus.is_open;
    const msg = newStatus ? "" : "Sorry bro, the barbershop is closed right now. We will be back soon!";
    
    await fetch('/api/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_open: newStatus, closed_message: msg })
    });
    
    checkStatus();
    alert(`Shop is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
}

const form = document.getElementById('book-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const bank = document.getElementById('bank').value;
        const service = document.getElementById('service').value;
        
        const bookBtn = document.getElementById('book-btn');
        bookBtn.innerText = "Processing Transaction...";
        bookBtn.disabled = true;

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, bank, service })
            });
            
            const result = await response.json();
            
            // Artificial delay for premium feel
            setTimeout(() => {
                alert(`SUCCESS! 400 SOM deducted from your ${bank.toUpperCase()} card. Redirecting to receipt...`);
                window.location.href = result.payment_url;
            }, 2000);
            
        } catch (error) {
            alert("Payment failed. Please try again.");
            bookBtn.innerText = "Confirm & Pay via QR";
            bookBtn.disabled = false;
        }
    });
}

// Initial status check
checkStatus();
// Polling every 30 seconds to catch master changes
setInterval(checkStatus, 30000);
