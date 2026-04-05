function openGate() {
    document.getElementById('gateOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeGate() {
    document.getElementById('gateOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

// Close on backdrop click
document.getElementById('gateOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeGate();
});