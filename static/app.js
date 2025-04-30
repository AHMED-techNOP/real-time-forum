import { bindEvents } from "./log&reg.js";
import { home } from "./bodys.js";


// check cookies !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


let data = {}

let cookies = document.cookie.split("=")

data = {
    [cookies[0]]: cookies[1],
}

console.log(data);

try {
    const response = await fetch("/cookies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    const result = await response.json();

    if (result.success && result.path === "/") {
        document.body.innerHTML = home
        let div = document.createElement('div')
        div.innerHTML = `
            <p> Hello to Real-Time forum Mr <h2> ${result.username} </h2> </p>
        `
        document.body.append(div)
    } else {
        // register and login !!!!!!!!!!!!!!!!!!!!!!!!! 
        bindEvents()
    }

} catch (error) {
    console.error(error);
}




