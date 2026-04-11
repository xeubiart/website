const btn = document.getElementById("submit-login-form")
btn.addEventListener("click", async ()=>{
    const form = {
        email: document.getElementById("email_input").value,
        identityInputDTO: {
            provider: "LOCAL",
            password: document.getElementById("password_input").value
        }
    }

    btn.classList.add("btn--loading");

    try {
        const response = await fetch('/api/account/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form),
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = sessionStorage.getItem('after_auth_redirect_to') ||  '/';
            return;
        }

        showError();
    } finally {
        btn.classList.remove("btn--loading");
    }
})

function showError(){
    document.querySelector("#error-display").classList.add("error-display--shown")
}
