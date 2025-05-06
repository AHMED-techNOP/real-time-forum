import { showError } from "./errore.js"
import { handle } from "./login-register.js"
import { HomeHandeler } from "./Homehandler.js"

let idRegester = "error-reg"

function Checkemail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        showError("Invalid email address", idRegester)
        return false
    } else {
        return true
    }
}

function validatePassword(password) {
    const hasTwoNumbers = (/\d{2,}/).test(password);

    const hasTwoLetters = (/[a-zA-Z]{3,}/).test(password);
    if (password.length > 20 || !hasTwoLetters || !hasTwoNumbers) {
        showError("Password must be less than 20 characters and contain at least 2 numbers and 3 letters", idRegester)
        return false;
    }
    return true;

}


function validateName(username) {
    const hasTwoLetters = (/[a-zA-Z]{4,}/).test(username);

    if (!hasTwoLetters) {
        showError("Name must be at least 4 characters", idRegester)
        return false
    }
    return true;
}

function validateAge(age) {
    const hasTwoNumbers = (/\d{2,}/).test(age);
    if (age < 5 || age > 150 || !hasTwoNumbers) {
        showError("Age must be between 5 and 150", idRegester)
        return false;
    }
    return true;
}

function validateGender(gender) {
    if (gender !== "male" && gender !== "female") {
        showError("Gender must be 'male' or 'female'", idRegester)
        return false
    }
    return true;
}
export function validateCategories(cat) {
    let arr = ["Tech Support", "General Discussion", "Tutorials", "Gaming", "Hobbies & Interests", "Job Listings", "Announcements"]
    return arr.includes(cat)
}

// function validateNickname(name) {
//     const hasTwoLetters = (/^[a-zA-Z][a-zA-Z0-9_]{2,14}$/).test(name);
//     return hasTwoLetters;
// }

export var username

async function Checkstuts(event) {


    fetch('/statuts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((result) => {

            if (!result.status) {
                console.log(result.error);
                handle()
            } else {

                    let head = document.querySelector("title")
                    head.setAttribute("class", result.name)

                username = result.name
                console.log(username);
                
                HomeHandeler()
            }

        })
        .catch((error) => {
            console.error("Error:", error);
        });

    // Delay l'appel handle jusqu'à ce que l'élément soit disponible dans DOM



}




export { Checkemail, validatePassword, validateName, validateAge, validateGender, Checkstuts } 