import { registration, login, home } from "./bodys.js";

document.body.innerHTML = registration


export function bindEvents() {
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


    const registerForm = document.querySelector("#registration-form")

    if (registerForm) {

        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault()

            let formData = new FormData(registerForm)
            const data = Object.fromEntries(formData.entries())


            let res = await send("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            if (res.path === "log-in" && res.success) {
                document.body.innerHTML = login
                bindEvents()
            }


        })

    }


    const logInForm = document.querySelector("#log-in-form")

    if (logInForm) {


        logInForm.addEventListener('submit', async function (e) {
            e.preventDefault()

            let formData = new FormData(logInForm)
            const data = Object.fromEntries(formData.entries())


            let res = await send("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            if (res.path === "/" && res.success) {
                document.body.innerHTML = home
                let div = document.createElement('div')
                div.innerHTML = `
            <p> Hello to Real-Time forum Mr <h2> ${data.username} </h2> </p>
        `
                document.body.append(div)
                bindEvents()
            }

        })

    }


}

async function send(path, data) {
    try {
        const response = await fetch(path, data)

        const result = await response.json();

        return result

    } catch (error) {
        console.error(error);
        return false
    }

}