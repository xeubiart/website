const codeInputs = document.querySelectorAll(".opt-digit")

codeInputs.forEach(input => {
    input.addEventListener("keydown", (event)=>{
        if(event.key === "Backspace"){
            event.preventDefault()

            event.target.value = ""

            event.target.classList.remove("opt-digit--filled")

            let prevElement = event.target.previousElementSibling;
            if(prevElement !== null){
                prevElement.focus()
            }

            event.target.dispatchEvent(new Event("input", { bubbles: true }));
            return
        }

        if(event.key === "ArrowRight"){
            event.preventDefault()

            let nextElement = event.target.nextElementSibling;
            if(nextElement !== null){
                nextElement.focus()
            }
            return
        }

        if(event.key === "ArrowLeft"){
            event.preventDefault()

            let prevElement = event.target.previousElementSibling;
            if(prevElement !== null){
                prevElement.focus()
            }

            return
        }
    })

    input.addEventListener("input", (event)=>{
        if(event.data === undefined) return
        // Inputs in the same input, should switch the values, not adding
        event.target.value = event.data 

        event.target.classList.add("opt-digit--filled")

        // After a input, the next input should be focused
        let nextElement = event.target.nextElementSibling;
        if(nextElement !== null){
            nextElement.focus()
        }
    })
})

const holder = document.querySelector(".opt-inputs")

holder.addEventListener("paste", (event)=> {
    event.preventDefault();

    const pastedText = event.clipboardData.getData("text/plain");

    for(let i = 0; i < codeInputs.length; i++){
        codeInputs[i].value = pastedText[i]
    }

    if(pastedText.length >= 6){
        codeBtn.disabled = false
    }
})

const inputsArray = [...codeInputs]
const codeBtn = document.querySelector("#submit-verification-code") 
holder.addEventListener("input", ()=>{
    const allFilled = inputsArray.every(input => input.value.trim() !== "");

    codeBtn.disabled = !allFilled
})

codeBtn.addEventListener("click", async ()=>{
    
    const response = await fetch(
        `/api/public/auth/verify?code=${encodeURIComponent(getCodeFromInputs())}`,
        { 
            method: "POST",
            credentials: 'include'
        }
    );

    if (response.ok) {
        document.getElementById("step-2").classList.remove("step_container--shown")
        document.getElementById("step-3").classList.add("step_container--shown")

        setTimeout(()=>{
            window.location.href = "/";
        }, 15000)
    } else {
        holder.classList.add("opt-inputs--invalid")
    }
})

function getCodeFromInputs(){
    return inputsArray.map(input => input.value.trim())
                .join("");
}


const refreshCode = document.querySelector("#ask-new-code")
let timerInterval;

refreshCode.addEventListener("click", async ()=>{
    startTimer(60)

    await fetch(
        "/api/public/auth/verify/resend",
        {
            method: "POST",
            credentials: "include"
        }
    );
})

function startTimer(secs) {
    stopTimer(); 
    timerSecs = secs;

    const btn = document.getElementById('ask-new-code');
    const tEl = document.getElementById('ask-new-code__timer');
    
    btn.disabled = true; 
    tEl.textContent = fmt(secs);

    timerInterval = setInterval(() => {
        timerSecs--;
    
        if (timerSecs <= 0) {
            stopTimer(); 
            btn.disabled = false; 
        } else {
            tEl.textContent = fmt(timerSecs)
        };
    }, 1000);
}
function stopTimer() {
    if (timerInterval !== null) { 
        clearInterval(timerInterval); 
        timerInterval = null; 
    }

    document.getElementById('ask-new-code__timer').textContent = '';
    document.getElementById('ask-new-code').disabled = false;
}

function fmt(s) { return `(${Math.floor(s/60)}:${String(s%60).padStart(2,'0')})`; }
