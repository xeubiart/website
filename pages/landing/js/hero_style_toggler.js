const elements = document.querySelectorAll(".hero_style")
let lastOppened = null;

elements.forEach((element, index) => {
    element.addEventListener("click", (e) => {
        if (window.innerWidth >= 670) return

        elements.forEach(el => {
            el.classList.remove("hero_style--selected")
        })
        
        element.classList.add("hero_style--selected");
        lastOppened = index

        e.stopImmediatePropagation();
    });

    element.addEventListener("mouseenter", (e)=>{
        elements.forEach(el => {
            el.classList.remove("hero_style--selected")
        })
    })

    window.addEventListener("touchstart", (e)=>{
        if (window.innerWidth >= 670) return

        if(e.target !== element){
            element.classList.remove("hero_style--selected")
            lastOppened = null;
        }
    })
});

function toggleLoop(){
    let selected = false;
    elements.forEach(el => {
        if(el.matches(":hover")) {
            selected = true;
            return
        }
    })

    if(!selected){
        if(lastOppened !== null){
            elements[lastOppened].classList.remove("hero_style--selected")
            lastOppened = null

            setTimeout(()=>{
                toggleLoop()
            }, 5000)
            return
        }

        lastOppened = RandInt(0, elements.length -1)
        elements[lastOppened].classList.add("hero_style--selected")
        setTimeout(()=>{
            toggleLoop()
        }, 3000)
    }
}

setTimeout(()=>{
    toggleLoop()
}, 1000)
