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

// Dynamic Slot Generation Logic
function getSlotsForService(service) {
    if (service === 'haircut') {
        // Haircut: 10:00, 11:30, 14:00, 15:30 (1.5h blocks, lunch skip)
        return ["10:00", "11:30", "14:00", "15:30"];
    } else {
        // Beard Trim: 30min blocks, skip 13:00-14:00 lunch
        const slots = [];
        for (let h = 10; h < 17; h++) {
            if (h === 13) continue; // Lunch
            slots.push(`${h}:00`, `${h}:30`);
        }
        return slots;
    }
}

function renderTimeSlots() {
    const service = document.getElementById('service').value;
    const dateStr = document.getElementById('date').value;
    const grid = document.getElementById('time-grid');
    grid.innerHTML = '';
    
    if (!dateStr) return;

    const selectedDate = new Date(dateStr);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    const slots = getSlotsForService(service);
    const takenSlots = JSON.parse(localStorage.getItem(`taken_${dateStr}`) || '[]');

    slots.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hour, minute, 0, 0);

        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerText = time;
        
        // Disable slots that are in the past (if today) or taken
        if (takenSlots.includes(time) || (isToday && slotDate < now)) {
            slot.classList.add('taken');
        } else {
            slot.onclick = () => selectTime(slot, time);
        }
        grid.appendChild(slot);
    });
}

function selectTime(element, time) {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-time').value = time;
}

// Initial Setup
const dateInput = document.getElementById('date');
const serviceInput = document.getElementById('service');

// Block past dates
const todayStr = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', todayStr);
dateInput.value = todayStr;

dateInput.addEventListener('change', renderTimeSlots);
serviceInput.addEventListener('change', renderTimeSlots);

renderTimeSlots();

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

        // Persistence
        const takenSlots = JSON.parse(localStorage.getItem(`taken_${date}`) || '[]');
        takenSlots.push(time);
        localStorage.setItem(`taken_${date}`, JSON.stringify(takenSlots));

        setTimeout(() => {
            alert(`SUCCESS! 400 SOM deducted from your ${bank.toUpperCase()} card.\nBooking confirmed for ${time}.`);
            window.location.href = `https://mock-payment-gateway.com/${bank}?amount=400&to=AminURJ&user=${encodeURIComponent(name)}`;
        }, 2000);
    });
}

checkStatus();
