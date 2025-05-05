import { HomeListener } from "./service.js";


function HomeHandeler() {

    const formData = new FormData();
    
    formData.append('lastdata', true)

    fetch('/getpost', { method: 'POST', body: formData })

        .then(response => response.json())
        .then(data => {
           
            HomeListener(data)
        })
        .catch(error => {
            console.log('Error:', error);
        });
}


export { HomeHandeler }