import { MoreData } from "./pages.js"
import { likeHandel } from "./service.js"

export const pagenation = debounce(() => {
    if ((document.body.offsetHeight - (window.innerHeight + window.scrollY)) < 500) {
        fetch('/getpost')
            .then(response => response.json())
            .then(data => {
                if (data.finish) {
                    window.removeEventListener("scroll", pagenation)
                } else {
                    MoreData(data);
                    let reactionLike = document.querySelectorAll("#like")
                    reactionLike.forEach(elm => elm.addEventListener("click", likeHandel))
                    let reactionDisLike = document.querySelectorAll("#dislike")
                    reactionDisLike.forEach(elm => elm.addEventListener("click", likeHandel))
                }
            })
            .catch(error => {
                console.log('Error:', error);
            });
    }
}, 300)



export function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}




export const Dateformat = (timestamp) => {


    let pastDate = new Date(timestamp);
    pastDate.setHours(pastDate.getHours() - 1)
    // console.log("Date : ", pastDate); // 2025-02-06 17:41:25
    let now = new Date();
    let seconds = Math.floor((now - pastDate) / 1000); // Correction: now - pastDate

    if (seconds < 60) {
        return `${seconds} seconds`;
    } else if (seconds < 3600) {
        return `${Math.floor((seconds / 60))} minutes`;
    } else if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)} heures`;
    } else {
        return `${Math.floor(seconds / 86400)} jours`;
    }
}