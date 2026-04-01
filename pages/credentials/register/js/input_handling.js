const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/
const nameInput = document.getElementById('name_input');

const NAME_RULES = [
    {
        test: v => v === "",
        msg: "🥶 Oi… você esqueceu de se apresentar. Qual é o seu nome? 🍒"
    },
    {
        test: v => v.length < 3,
        msg: "😏 Tão pequeno... Isso é um nome ou um código secreto? 🍒",
    },
    {
        test: v => v.length >= 30,
        msg: "🤦‍♀️ Calma lá… isso é um nome ou a árvore genealógica inteira? 🍒"
    },
    {
        test: v => !NAME_REGEX.test(v),
        msg: "🤖 Hmm… nomes normalmente não têm esses símbolos estranhos. 🍒"
    }
]
attachValidation(nameInput, NAME_RULES)

const emailInput = document.getElementById("email_input");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMAIL_RULES = [
    {
        test: v => v === "",
        msg: "😳 Ei… preciso do teu email. Prometo não mandar spam (talvez). 🍒"
    },
    {
        test: v => v.length < 5,
        msg: "🥸 Esse email parece meio suspeito… faltam algumas partes. 🍒"
    },
    {
        test: v => !EMAIL_REGEX.test(v),
        msg: "📧 Esse email não parece válido. Tenta outra vez! 🍒"
    }
]
attachValidation(emailInput, EMAIL_RULES)

const passInput = document.getElementById("password_input");
const PASS_UPPERCHAR_REGEX = /[A-Z]/
const PASS_NUM_REGEX = /[0-9]/
const PASS_SYMBOL_REGEX = /[!@#$%^&*(),.?\":{}|<>]/

const PASS_RULES = [
    {
        test: v => v === "",
        msg: "🫣 A palavra-passe não pode ficar em branco… segurança primeiro!  🍒"
    },
    {
        test:  v => v.length < 8,
        msg: "😏 Muito curtinha… hackers agradecem, Que tal 8 caracteres? 🍒"
    },
    {
        test:  v => v.length > 100, 
        msg: "😐 Ok… isso já parece uma tese de doutorado. 🍒"
    },
    {
        test:  v => !PASS_UPPERCHAR_REGEX.test(v), 
        msg: "🔒 Falta pelo menos uma letra maiúscula. 🍒"
    },
    {
        test:  v => !PASS_NUM_REGEX.test(v), 
        msg: "🔒 Um número ajudava muito aqui. 🍒"
    },
    {
        test:  v => !PASS_SYMBOL_REGEX.test(v), 
        msg: "👀 Que tal um símbolo? Eles deixam a senha mais forte. 🍒"
    }
]
attachValidation(passInput, PASS_RULES)

function attachValidation(input, rules){
    input.checkMyValidity = function() {
        const value = input.value.trim();
        const errorMsg = checkRules(rules, value);
        
        return errorMsg; 
    };

    input.addEventListener("blur", () => {
        togglePopUp(input, input.checkMyValidity());
    });

    input.addEventListener("input", () => {
        togglePopUp(input, false);
    })
}


function checkRules(rules, value){
    for(let rule of rules){
        if(rule.test(value)){
            return rule.msg;
        }
    }
    return null
}

function togglePopUp(target, errorMessage){
    setState(target, !errorMessage)

    if(errorMessage){
        document.dispatchEvent(new CustomEvent("show-popup", {
            detail: {
                target: target,
                message: errorMessage
            }
        }))
        return
    }
    
    document.dispatchEvent(new Event("close-popup"))
}

function setState(el, valid){
    el.classList.toggle("input_wrap--valid", valid);
    el.classList.toggle("input_wrap--invalid", !valid);
}

function clearState(el){
    el.classList.remove("input_wrap--valid", "input_wrap--invalid")
}
