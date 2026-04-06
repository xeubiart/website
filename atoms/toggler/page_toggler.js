document.querySelectorAll(".page-toggler_opt input").forEach(el => {
    el.addEventListener("change", ()=>{
        document.dispatchEvent(new CustomEvent("page-toggler", {
            detail: { 
                id: el.id 
            }
        }));
    })
})