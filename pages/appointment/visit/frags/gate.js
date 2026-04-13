const MONTHNAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Open on submit appointment
document.getElementById("appoint_visit_btn").addEventListener("click", ()=>{
    // Show modal
    document.getElementById('gateOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    // Get date data
    
    const display = document.getElementById("gateDateText")
    let data = GetAppointmentData(document.getElementById("date-picker"));

    console.log(data)

    // Set in the displayer
    display.innerText = `${data.weekText}, ${data.day} de ${MONTHNAMES[data.month]} · ${data.hourFormatted}`
})

// Close on backdrop click
document.getElementById('gateOverlay').addEventListener('click', function(e) {
    if (e.target !== this) return

    document.getElementById('gateOverlay').classList.remove('open');
    document.body.style.overflow = '';
})

function goAuthenticate(redirectURL) {
    const picker = document.getElementById("date-picker");
    
    // 1. Save the specific appointment data
    if (picker) {
        const data = window.GetAppointmentData(picker);
        sessionStorage.setItem('pending_appointment', JSON.stringify(data));
    }

    sessionStorage.setItem('after_auth_redirect_to', "/appointment?page-mode=studio");

    // 3. Normal redirect to login/register
    window.location.href = redirectURL;
}