import { Checkemail, validateAge, validateGender, validateName, validatePassword, Checkstuts } from "./check.js"
import { Regester } from "./pages.js"
import { showError } from "./errore.js"
console.log("=======>");

document.addEventListener("DOMContentLoaded", Checkstuts)


export function handle() {
    Regester()

    let creat_account = document.getElementById("resgesterlogin")
    let logIn = document.getElementById("log")
    const reg = document.getElementById("register-container")
    const log = document.getElementById("login-container")

    let login_form = document.getElementById("login-form")
    let regester_form = document.getElementById("register-form")

    login_form.addEventListener("submit", loginHandel)
    regester_form.addEventListener("submit", handleRegister)


    creat_account.addEventListener("click", regAndLog)
    logIn.addEventListener("click", regAndLog)

    let f = false

    function regAndLog(e) {
        e.preventDefault()

        if (!f) {
            reg.style.display = "flex"
            log.style.display = "none"
            f = true
        } else {
            log.style.display = "flex"
            reg.style.display = "none"
            f = false
        }
    }


    function loginHandel(event) {
        event.preventDefault()
        const formData = new FormData(login_form);
        console.log(formData);

        fetch('/login', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    Checkstuts(event)
                } else {
                    showError(data.error, "error-log")
                }
            })
            .catch(error => {
                console.log('Error:', error);

            });
    }


    function handleRegister(ev) {
        ev.preventDefault();
        console.log("Register button clicked!");
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let age = document.getElementById("age").value;
        let gender = document.getElementById("gender").value;
        let nickname = document.getElementById("nickname").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        if (validateName(firstName) && validateName(lastName) && validateAge(age) && validateGender(gender) && Checkemail(email) && validatePassword(password)) {
            console.log("Form submitted successfully!==========");

            fetch('/resgester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ FirstName: firstName, LastName: lastName, Email: email, Password: password, Age: age, Gender: gender, Nickname: nickname })
            })
                .then((response) => response.json())
                .then((result) => {
                    if (result.success) {
                        
                        showError(result.message, "error-reg")

                    } else {
                        window.location.href = "/"
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    }
}

