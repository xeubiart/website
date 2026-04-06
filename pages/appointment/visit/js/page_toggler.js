const containers = document.querySelectorAll(".appointment-container")

document.addEventListener("page-toggler", (e)=>{
    containers.forEach(ct => {
        if(ct.id === "appointment-" + e.detail.id) {
            ct.classList.add("appointment-container--shown")
            return
        }

        ct.classList.remove("appointment-container--shown")
    })
})