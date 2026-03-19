// Static Version - Open/Closed state stored in localStorage
let is_open = localStorage.getItem('is_open') !== 'false';
const closedMessage = "Sorry bro, the barbershop is closed right now. We will be back soon!";

// Time Slots Data
const hours = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "14:00", "14:30", "15:00", 
    "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", 
    "18:30", "19:00", "19:30", "20:00"
];

function checkStatus() {
    const banner = document.getElementById('status-banner');
    const bookBtn = document.getElementById('book-btn');
    
    if (!is_open) {
        banner.style.display = 'block';
        banner.className = 'status-closed';
        banner.innerText = closedMessage;
        bookBtn.disabled = true;
        bookBtn.innerText = "SHOP CLOSED";
    } else {
        banner.style.display = 'none';
        bookBtn.disabled = false;
        bookBtn.innerText = "Confirm & Pay via QR";
    }
}

function toggleShopStatus() {
    is_open = !is_open;
    localStorage.setItem('is_open', is_open);
    checkStatus();
    alert(`Shop is now ${is_open ? 'OPEN' : 'CLOSED'}`);
}

// Generate Time Slots
function renderTimeSlots(date) {
    const grid = document.getElementById('time-grid');
    grid.innerHTML = '';
    
    // Get taken slots from local storage (or mock for now)
    const takenSlots = JSON.parse(localStorage.getItem(`taken_${date}`) || '[]');

    hours.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerText = time;
        
        if (takenSlots.includes(time)) {
            slot.classList.add('taken');
        } else {
            slot.onclick = () => selectTime(slot, time);
        }
        grid.appendChild(slot);
    });
}

function selectTime(element, time) {
    // Remove selected from others
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-time').value = time;
}

// Handle Date Change
document.getElementById('date').addEventListener('change', (e) => {
    renderTimeSlots(e.target.value);
});

// Setting default date (tomorrow)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
document.getElementById('date').valueAsDate = tomorrow;
renderTimeSlots(document.getElementById('date').value);

const form = document.getElementById('book-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('selected-time').value;
        const bank = document.getElementById('bank').value;

        if (!time) {
            alert("Please select a time slot!");
            return;
        }
        
        const bookBtn = document.getElementById('book-btn');
        bookBtn.innerText = "Processing Transaction...";
        bookBtn.disabled = true;

        // Save taken slot to simulate "taken" state locally
        const takenSlots = JSON.parse(localStorage.getItem(`taken_${date}`) || '[]');
        takenSlots.push(time);
        localStorage.setItem(`taken_${date}`, JSON.stringify(takenSlots));

        // Artificial delay for premium feel
        setTimeout(() => {
            alert(`SUCCESS! 400 SOM deducted from your ${bank.toUpperCase()} card.\n\nBooking for ${name} at ${time} on ${date} confirmed.`);
            window.location.href = `https://mock-payment-gateway.com/${bank}?amount=400&to=AminURJ&user=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;
        }, 2000);
    });
}

// Initial status check
checkStatus();
