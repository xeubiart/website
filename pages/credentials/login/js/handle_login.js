const btn = document.getElementById("submit-login-form")
btn.addEventListener("click", async ()=>{
    const formData = {
        email: document.getElementById("email_input").value,
        password: document.getElementById("password_input").value
    };

    btn.classList.add("btn--loading");

    try {
        const response = await fetch('/api/public/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = '/';
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
