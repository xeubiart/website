const popupError = document.querySelector(".popupError")

popupError.addEventListener("click", (e)=>{
    popupError.classList.remove("popupError--show")
})

document.addEventListener("show-popup", (e)=>{
    const target = e.detail.target
    const message = e.detail.message

    popupError.innerText = message
    target.closest(".input_wrap").appendChild(popupError)

    requestAnimationFrame(() => {
        popupError.classList.add("popupError--show")
    });
})

document.addEventListener("close-popup", ()=>{
    popupError.classList.remove("popupError--show")
})