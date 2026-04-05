function convertWeekday(weekDayNumber) {
    switch (weekDayNumber) {
        case "0": return "Domingo"
        case "1": return "Segunda"
        case "2": return "Terça"
        case "3": return "Quarta"
        case "4": return "Quinta"
        case "5": return "Sexta"
        case "6": return "Sábado"
    }
}

// Passamos a enviar o 'container' diretamente para a função
const initDatePicker = (container) => {
    // PROTEÇÃO: Evita que os eventos sejam adicionados duas vezes ao mesmo elemento
    if (!container || container.dataset.initialized === "true") return;
    container.dataset.initialized = "true"; 

    // Atualizado para ignorar também os dias marcados como "full"
    const daysEl = container.querySelectorAll(".date-picker__day:not(.date-picker__day--disabled):not(.date-picker__day--full)");
    const timeGrid = container.querySelector(".date-picker__time-grid");
    const timesEl = container.querySelectorAll(".date-picker__time");
    const dateLabel = container.querySelector(".date-picker__selected-label");
    const hintLabel = container.querySelector(".date-picker__hint");

    const busyData = JSON.parse(timeGrid.dataset.busy || "{}");

    // 1. Eventos de clique nos Dias
    daysEl.forEach(el => {
        el.addEventListener("click", () => {
            container.dispatchEvent(new CustomEvent("date-picker:day_selected", {
                detail: { selected: el }
            }));
        });
    });

    // 2. Eventos de clique nas Horas
    timesEl.forEach(el => {
        el.addEventListener("click", () => {
            if (el.classList.contains("date-picker__time--taken")) return;

            container.dispatchEvent(new CustomEvent("date-picker:time_selected", {
                detail: { selected: el }
            }));
        });
    });

    let selectedDayElement = null;
    let selectedHourElement = null;

    // 3. Lógica ao selecionar um Dia
    container.addEventListener("date-picker:day_selected", (e) => {
        const el = e.detail.selected;
        const selectedDayNumber = Number(el.dataset.day);
        const isToday = el.dataset.isToday === "true"; 

        const now = new Date();
        const currentHour = now.getHours();

        container.dataset.selectedDay = el.dataset.day;
        container.dataset.selectedHour = ""; 

        document.getElementById("date-picker__time-grid").classList.remove("date-picker__time-grid--hidden");

        if (selectedDayElement !== null) {
            selectedDayElement.classList.remove("date-picker__day--selected");
        }

        selectedDayElement = el;
        selectedDayElement.classList.add("date-picker__day--selected");

        const busyHoursForDay = busyData[selectedDayNumber] || {};

        timesEl.forEach(timeEl => {
            const hour = Number(timeEl.dataset.hour);
            timeEl.classList.remove("date-picker__time--selected");
            
            const isBusy = busyHoursForDay[hour] === true;
            const isPast = isToday && hour <= currentHour;

            if (isBusy || isPast) {
                timeEl.classList.add("date-picker__time--taken");
            } else {
                timeEl.classList.remove("date-picker__time--taken");
            }
        });

        selectedHourElement = null;
        container.classList.add("date-picker--times_visible");
        
        const monthName = container.querySelector(".date-picker__month").innerText;
        dateLabel.innerText = `${convertWeekday(el.dataset.week)}, ${el.dataset.day} de ${monthName.toLocaleLowerCase()}`;
        hintLabel.innerText = "Data selecionada — escolhe um horário";
    });

    // 4. Lógica ao selecionar uma Hora
    container.addEventListener("date-picker:time_selected", (e) => {
        const el = e.detail.selected;
        container.dataset.selectedHour = el.dataset.hour;

        if (selectedHourElement !== null) {
            selectedHourElement.classList.remove("date-picker__time--selected");
        }

        selectedHourElement = el;
        selectedHourElement.classList.add("date-picker__time--selected");

        document.dispatchEvent(new Event("date-picker:valid"));
    });
};

// --- NOVA LÓGICA DE INICIALIZAÇÃO BLINDADA ---

// O htmx:load é disparado pelo HTMX sempre que ele processa novos elementos na página 
// (tanto na carga inicial como nos swaps)
document.body.addEventListener('htmx:load', function(evt) {
    const target = evt.detail.elt;
    
    // Se o elemento carregado contiver o date-picker dentro dele
    const pickers = target.querySelectorAll('.date-picker');
    pickers.forEach(picker => initDatePicker(picker));
    
    // Se o elemento carregado for o próprio date-picker
    if (target.classList && target.classList.contains('date-picker')) {
        initDatePicker(target);
    }
});

// Fallback de segurança para garantir que corre se o HTMX falhar na inicialização primária
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.date-picker').forEach(picker => initDatePicker(picker));
});


// --- LÓGICA DO BOTÃO DE ENVIO (POST) ---
const setupButton = () => {
    const btn = document.querySelector("#appoint_visit_btn");
    if (!btn || btn.dataset.hooked === "true") return;

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