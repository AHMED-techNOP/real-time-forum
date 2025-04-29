import { registration, login } from "./bodys.js";

document.body.innerHTML = registration

function bindEvents() {
    const logIn = document.querySelector("#log-in")
    const register = document.querySelector("#register")

    if (logIn) {
        logIn.addEventListener("click", () => {
            document.body.innerHTML = login
            bindEvents() 
        })
    }

    if (register) {
        register.addEventListener("click", () => {
            document.body.innerHTML = registration
            bindEvents() 
        })
    }
}

bindEvents()