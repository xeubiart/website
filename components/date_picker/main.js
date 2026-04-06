const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Global Utility: Extracts appointment data from a container
 * Can be called from anywhere: const data = window.GetAppointmentData(el);
 */
window.GetAppointmentData = (container) => {
    if (!container) return null;
    return {
        year: container.dataset.selectedYear,
        month: container.dataset.selectedMonth,
        weekText: container.dataset.selectedWeekDay, 
        day: container.dataset.selectedDay,
        hour: container.dataset.selectedHour,
        hourFormatted: container.dataset.selectedHourFormated 
    };
};

const initDatePicker = (container) => {
    if (!container || container.dataset.initialized === "true") return;
    container.dataset.initialized = "true";

    // --- Selectors ---
    const timeGrid = container.querySelector(".date-picker__time-grid");
    const timesEl = container.querySelectorAll(".date-picker__time");
    const dateLabel = container.querySelector(".date-picker__selected-label");
    const hintLabel = container.querySelector(".date-picker__hint");
    const monthElement = container.querySelector(".date-picker__month");
    const monthName = monthElement ? monthElement.innerText.toLowerCase() : "";
    
    const busyData = JSON.parse(timeGrid?.dataset.busy || "{}");

    // --- State Helpers ---
    const updateTimeSlots = (selectedDayNum, isToday) => {
        const currentHour = new Date().getHours();
        const busyHours = busyData[selectedDayNum] || {};

        timesEl.forEach(el => {
            const hour = Number(el.dataset.hour);
            const isBusy = busyHours[hour] === true;
            const isPast = isToday && hour <= currentHour;
            
            el.classList.toggle("date-picker__time--taken", isBusy || isPast);
            el.classList.remove("date-picker__time--selected");
        });
    };

    // --- Sub-Handlers ---
    const handleDayClick = (el) => {
        container.querySelectorAll(".date-picker__day--selected").forEach(d => d.classList.remove("date-picker__day--selected"));
        el.classList.add("date-picker__day--selected");

        // Sync State to Dataset
        container.dataset.selectedDay = el.dataset.day;
        container.dataset.selectedHour = "";
        container.dataset.selectedWeek = el.dataset.week;
        container.dataset.selectedWeekDay = WEEKDAYS[el.dataset.week];
        
        timeGrid?.classList.remove("date-picker__time-grid--hidden");
        container.classList.add("date-picker--times_visible");
        
        updateTimeSlots(Number(el.dataset.day), el.dataset.isToday === "true");

        if (dateLabel) dateLabel.innerText = `${WEEKDAYS[el.dataset.week]}, ${el.dataset.day} de ${monthName}`;
        if (hintLabel) hintLabel.innerText = "Data selecionada — escolhe um horário";
    };

    const handleTimeClick = (el) => {
        container.querySelectorAll(".date-picker__time--selected").forEach(t => t.classList.remove("date-picker__time--selected"));
        el.classList.add("date-picker__time--selected");
        
        const formattedHour = el.dataset.hour.padStart(2, '0') + ":00";
        
        container.dataset.selectedHour = el.dataset.hour;
        container.dataset.selectedHourFormated = formattedHour;

        if (hintLabel) hintLabel.innerText = `Horário escolhido: ${formattedHour}`;
        
        // Notify other scripts that a full selection is made
        document.dispatchEvent(new CustomEvent("date-picker:valid", { detail: { container } }));
    };

    // --- Main Event Delegation ---
    container.addEventListener("click", (e) => {
        const dayBtn = e.target.closest(".date-picker__day:not(.date-picker__day--disabled):not(.date-picker__day--full)");
        if (dayBtn) return handleDayClick(dayBtn);

        const timeBtn = e.target.closest(".date-picker__time:not(.date-picker__time--taken)");
        if (timeBtn) handleTimeClick(timeBtn);
    });

    const restoreSession = () => {
        const saved = JSON.parse(sessionStorage.getItem('pending_appointment'));
        if (!saved) return;

        // 1. Find and select the Day
        const dayEl = container.querySelector(`.date-picker__day[data-day="${saved.day}"]`);
        if (dayEl && !dayEl.classList.contains('date-picker__day--disabled')) {
            handleDayClick(dayEl);

            // 2. Find and select the Hour (must happen after day click to ensure grid is updated)
            const timeEl = container.querySelector(`.date-picker__time[data-hour="${saved.hour}"]`);
            if (timeEl && !timeEl.classList.contains('date-picker__time--taken')) {
                handleTimeClick(timeEl);
            }
        }

        // NOTE: If in any moment the pre-load the past appointment selection, maybe the order of this is the problem
        // sessionStorage.removeItem('pending_appointment');
    };

    // Run restoration immediately after initialization
    restoreSession();
};

// --- HTMX & Lifecycle ---
const initAllPickers = (root) => {
    if (!root) return;
    const pickers = root.querySelectorAll ? root.querySelectorAll('.date-picker') : [];
    if (root.classList?.contains('date-picker')) initDatePicker(root);
    pickers.forEach(initDatePicker);
};

document.body.addEventListener('htmx:load', (e) => initAllPickers(e.detail.elt));
document.addEventListener("DOMContentLoaded", () => initAllPickers(document));

document.body.addEventListener('htmx:configRequest', (event) => {
    // Only intercept the request if it's coming from our appointment trigger
    if (event.detail.elt.id === 'appointment-trigger') {
        const saved = JSON.parse(sessionStorage.getItem('pending_appointment'));
        
        if (saved && saved.year && saved.month) {
            // Inject the year and month into the GET parameters
            // This changes /appointment to /appointment?year=2026&month=4
            event.detail.parameters['year'] = saved.year;
            event.detail.parameters['month'] = saved.month;
        }
    }
});