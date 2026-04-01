const inputs = document.querySelectorAll("[data-input]")
const btn = document.querySelector("#submit-register-form")

function showError(icon, title, text){
    let errorHolder = document.querySelector("#error-display")

    errorHolder.classList.add("error-display--shown")
    errorHolder.querySelector("icon").innerText = icon
    errorHolder.querySelector("h4").innerText = title
    errorHolder.querySelector("p").innerText = text
}

document.addEventListener("show-popup", ()=>{
    btn.disabled = true
})

document.addEventListener("input", ()=>{
    let anyInvalid = false;
    for(let input of inputs){
        let error = input.checkMyValidity();
        if(error != null){
            anyInvalid = true;
            break
        }
    }

    btn.disabled = anyInvalid
})

btn.addEventListener("click", async ()=>{
    const inputArray = Array.from(inputs);

    const formData = {
        name: inputArray.find(i => i.id === 'name_input')?.value,
        email: inputArray.find(i => i.id === 'email_input')?.value,
        password: inputArray.find(i => i.id === 'password_input')?.value,
        role: "USER"
    };

    btn.classList.add("btn--loading");

    try {
        const response = await fetch('/api/public/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        if (response.ok) {
            document.getElementById("step-1").classList.remove("step_container--shown")
            document.getElementById("step-2").classList.add("step_container--shown")
            document.getElementById('display-email').textContent = formData.email;
            startTimer(60)
            return;
        }

        if (response.status === 409) {
            showError(
                "📧",
                "E-mail já registado",
                "Este endereço já tem uma conta. Inicia sessão ou recupera a palavra-passe."
            );
            return;
        }

        if (response.status === 400) {
            showError(
                "⚠️",
                "Corrige os erros abaixo",
                "Alguns campos precisam de atenção antes de continuar."
            );
            return;
        }

        showError("⚠️", "Erro", "Algo correu mal. Tenta novamente.");
    } finally {
        btn.classList.remove("btn--loading");
    }
})