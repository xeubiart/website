// --- LÓGICA DO BOTÃO DE ENVIO (POST) ---
const setupButton = () => {
    const btn = document.querySelector("#appoint_visit_btn");
    if (!btn || btn.dataset.hooked === "true") return;

    // Aditional data added to the btn when the user is not logged in
    if(btn.dataset.appoint === undefined) return

    if(btn.dataset.opengate === ""){
        openGate()
    }

    btn.addEventListener("click", async () => {
        const container = document.querySelector(".date-picker");
        if (!container || !container.dataset.selectedDay || !container.dataset.selectedHour) return;

        const year = container.dataset.selectedYear;
        const month = container.dataset.selectedMonth.padStart(2, '0');
        const day = container.dataset.selectedDay.padStart(2, '0');
        const hour = container.dataset.selectedHour.padStart(2, '0');

        const scheduledTo = `${year}-${month}-${day}T${hour}:00:00`;

        try {
            const response = await fetch('/api/public/appointments/visit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduledTo: scheduledTo }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                alert("Erro ao marcar visita. Verifique se o horário ainda está disponível.");
            }
        } catch (err) {
            console.error("Erro no envio:", err);
        }
    });
    btn.dataset.hooked = "true";
};

// Garante que o botão também é configurado corretamente
document.body.addEventListener('htmx:load', setupButton);
document.addEventListener("DOMContentLoaded", setupButton);

document.addEventListener("date-picker:valid", () => {
    const btn = document.querySelector("#appoint_visit_btn");
    if (btn) btn.disabled = false;
});