import { Homepage, MoreData, updateUserList } from "./pages.js"
import { Checkstuts, validateCategories } from "./check.js"
import { showError } from "./errore.js"
import { pagenation, Dateformat, debounce } from "./utils.js"
import { HomeHandeler } from "./Homehandler.js"

export function Listener(){
    let sendcomment = document.querySelectorAll(".send-button")
    sendcomment.forEach((el) => {
        el.addEventListener("click", send_comment)
    })
    let comment = document.querySelectorAll("#comment")
    comment.forEach((el) => {
        el.addEventListener("click", CommentEvent)
    })
}

export function HomeListener(data) {
    Homepage(data)
    let CreatPostBtn = document.querySelector(".create-post")
    CreatPostBtn.addEventListener("click", handelpost)
    let cancel = document.querySelector("#cancel")
    cancel.addEventListener("click", handelcontact)

    let sendcomment = document.querySelectorAll(".send-button")
    sendcomment.forEach((el) => {
        el.addEventListener("click", send_comment)
    })

    let logout = document.querySelector("#logout")
    logout.addEventListener("click", logoutHandel)

    window.addEventListener("scroll", pagenation)
    let comment = document.querySelectorAll("#comment")
    comment.forEach((el) => {
        el.addEventListener("click", CommentEvent)
    })
    let categories = document.querySelectorAll(".cat")
    categories.forEach(elem => { elem.addEventListener("click", CatHandel) })

    let reactionLike = document.querySelectorAll("#like")
    reactionLike.forEach(elm => elm.addEventListener("click", likeHandel))
    let reactionDisLike = document.querySelectorAll("#dislike")
    reactionDisLike.forEach(elm => elm.addEventListener("click", likeHandel))
}

const CatHandel = debounce((eve) => {
    eve.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    let categories = eve.target.value
    if (categories === "all") {
        HomeHandeler()
        return
    }
    const formData = new FormData();
    formData.set("categories", categories)
    formData.append('lastdata', true)
    if (validateCategories(categories)) {
        fetch("/categories", { method: "POST", body: formData })
            .then(response => response.json())
            .then(data => {

                if (data.status === undefined) {
                    console.log("===> status : ", data)
                    HomeListener(data)
                } else {
                    HomeListener()
                }
                window.removeEventListener("scroll", pagenation);
                if (data.length==10){
                     window.addEventListener("scroll",scrollHandel)
                }else{
                    console.log("NOTE DATA VALABLE");
                    
                }
               
            })
            .catch(error => {
                console.log(error);
            })
        const scrollHandel = debounce((event) => {
            event.preventDefault();
            if ((document.body.offsetHeight - (window.innerHeight + window.scrollY)) < 500) {
                formData.delete('lastdata')
                fetch('/categories', { method: "POST", body: formData })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.status && data.finish) {
                            console.log("vvv", data);
                            window.removeEventListener("scroll", scrollHandel)
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
        }, 100)

    }
}, 100)



export const likeHandel = (event) => {
    let content_type = event.target.getAttribute("data-type")
    let content_id = event.target.getAttribute("data-id")
    let reaction_type = event.target.id
    let status = event.target.getAttribute("data-status")
    let id = event.target.id
    fetch("/reactione", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_type: `${content_type}`, content_id: `${content_id}`, reaction_type: `${reaction_type}` })
    })
        .then(response => response.json())
        .then(data => {
            if (data.tocken == false) {
                Checkstuts()
            } else {

                let element
                if (reaction_type == "like") {
                    element = document.querySelector(`#dislike[data-id="${content_id}"]`)
                } else {
                    element = document.querySelector(`#like[data-id="${content_id}"]`)
                }
                if (status == "of" && element.getAttribute("data-status") == "of" && data.content_type !== "") {
                    event.target.setAttribute("data-status", "on")
                    event.target.parentNode.setAttribute("data-status", "on")
                    console.log("of on", data[id]);

                    event.target.parentNode.querySelector("b").textContent = data[id]
                } else if (status == "on" && element.getAttribute("data-status") == "of" && data.content_type == "") {
                    event.target.setAttribute("data-status", "of")
                    event.target.parentNode.setAttribute("data-status", "of")
                    event.target.parentNode.querySelector("b").textContent = data[id]
                } else if (status == "of" && element.getAttribute("data-status") == "on") {
                    event.target.setAttribute("data-status", "on")
                    event.target.parentNode.setAttribute("data-status", "on")
                    element.setAttribute("data-status", "of")
                    element.parentNode.setAttribute("data-status", "of")
                    event.target.parentNode.querySelector("b").textContent = data[id]
                    let elementid = element.id
                    element.parentNode.querySelector("b").textContent = data[elementid]
                }
            }

        })
        .catch(error => {
            console.log('Error:', error);
        });

}



export const handelpost = (event) => {
    window.removeEventListener("scroll", pagenation)
    let creat_btn = event.target
    creat_btn.style.display = "none"
    let creatcontainer = document.querySelector(".form-container")
    let post = document.querySelectorAll(".post")
    creatcontainer.style.display = "block"
    post.forEach(elm => elm.style.display = "none")
    let canele = document.querySelector("#close")
    canele.addEventListener("click", () => {
        creatcontainer.style.display = "none"
        post.forEach(elm => elm.style.display = "block")
        creat_btn.style.display = "inline"
        window.addEventListener("scroll", pagenation)
    })
    let form = document.forms.creatpost
    form.addEventListener("submit", submitpost)


}


export const submitpost = (ev) => {/////////////////formulaire dyal create post
    ev.preventDefault();
    let title = ev.target.title.value
    let post = ev.target.content.value
    if (title === "" || post === "") {
        showError("Fill in all the fields")
        return
    }
    const formData = new FormData(ev.target);
    fetch('/pubpost', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                HomeHandeler()
                return
            } else {
                console.log(data.tocken)
                if (data.tocken == false) {
                    Checkstuts()
                    return
                } else {
                    showError(data.error)
                    return
                }
            }
        })
        .catch(error => {
            console.log('Error:', error);

        });
}



const handelcontact = () => {///cancel contact
    let cancel = document.querySelector("#cancel")
    if (cancel.textContent == "visibility_off") {
        let contact = document.querySelector("#contact")
        contact.style.display = "none"
        cancel.textContent = "visibility"
    } else {
        let contact = document.querySelector("#contact")
        contact.style.display = "flex"
        cancel.textContent = "visibility_off"
    }

}




const send_comment = (event) => {/////send comment
    let wrapper = event.target.closest(".input-wrapper");
    if (!wrapper) {
        console.error("Mochkil: Makaynch .input-wrapper");
        return;
    }

    let textarea = wrapper.querySelector(".comment-input");
    let content = textarea.value;
    let post_id = textarea.getAttribute("data-idpost");
    let postDiv = document.querySelector(`[postid="${post_id}"]`);

    let commentDiv = postDiv?.querySelector("#comment");
    if (!commentDiv) {
        console.error("Mochkil: Makaynch #comment f postDiv");
        return;
    }

    if (content === "") {
        showError("Fill in all the fields");
        return;
    }

    console.log("da6l hna");
    fetch('/sendcomment', {
        method: 'POST',
        body: JSON.stringify({ content: content, post_id: post_id }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                let currentNb = parseInt(commentDiv.textContent, 10);
                if (isNaN(currentNb)) currentNb = 0;
                let nb = String(currentNb + 1);
                commentDiv.textContent = `${nb} 💬`;

                textarea.value = "";

                if (commentDiv.classList.contains("on")) {
                    commentDiv.classList.remove("on");
                    commentDiv.classList.add("of");
                    let all = postDiv.querySelectorAll(".comment-content");
                    all.forEach((el) => {
                        el.remove();
                    });

                    let simulatedEvent = new Event('click', { bubbles: true });
                    commentDiv.dispatchEvent(simulatedEvent);

                    // CommentEvent(simulatedEvent); // Jarrab t7aydo w chouf wach kaykhddm
                }
            } else if (data.status == false && data.tocken == false) {
                console.log("mochkil f tocken");
                Checkstuts()
            } else {
                console.log("mochkil");
                showError(data.error);
            }
            console.log(data.tocken);

        })
        .catch(error => {
            console.log('Error:', error);
        });
};



function CommentEvent(event) {//////comment


    console.log(event.target);

    let post_id = event.target.getAttribute("posteid");
    let postDiv = document.querySelector(`[postid="${post_id}"]`);

    console.log(event.target.getAttribute("class"));

    if (event.target.getAttribute("class") == "of") {

        fetch("/getcomment", {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id }),
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    if (data.token == false) {
                        Checkstuts()
                    } else {
                        data.forEach((el) => {
                            let commentDiv = document.createElement("div");
                            commentDiv.classList.add("comment-content");


                            let userDiv = document.createElement("div");
                            userDiv.classList.add("user-name");
                            userDiv.textContent = el.Username; // Changeha b user dynamiquement

                            let commentP = document.createElement("p");
                            commentP.classList.add("comment-text");
                            commentP.textContent = el.Content; // Changeha b data dynamiquement


                            let actionsDiv = document.createElement("div");
                            actionsDiv.classList.add("comment-actions");
                            actionsDiv.innerHTML = `
                         <div class="like-button" data-status="of">
                  <span id="like" data-type="comment" data-status="of" data-id = ${el.ID}  class="material-icons">thumb_up_off_alt</span> <b>${el.Like}</b>
                   </div>
                <div class="like-button" data-status="of">
                  <span id="dislike" data-type="comment" data-status="of" data-id = ${el.ID} class="material-icons">thumb_down_off_alt</span>  <b>${el.DisLike}</b>
                    </div>
                        `
                            if (el.Have === "like") {
                                let like = actionsDiv.querySelector("#like")
                                like.setAttribute("data-status", "on")
                                like.parentNode.setAttribute("data-status", "on")
                            } else if (el.Have === "dislike") {
                                let dislike = actionsDiv.querySelector("#dislike")
                                dislike.setAttribute("data-status", "on")
                                dislike.parentNode.setAttribute("data-status", "on")
                            }

                            let timeSpan = document.createElement("span");
                            timeSpan.classList.add("timestamp");
                            timeSpan.textContent = Dateformat(el.CreatedAt);
                            // actionsDiv.appendChild(likeBtn);
                            // actionsDiv.appendChild(dislikeBtn);
                            actionsDiv.appendChild(timeSpan);

                            commentDiv.appendChild(userDiv);
                            commentDiv.appendChild(commentP);
                            commentDiv.appendChild(actionsDiv);

                            postDiv.appendChild(commentDiv);

                        })
                        event.target.classList.remove("of")
                        event.target.classList.add("on")
                        let reactionLike = document.querySelectorAll("#like")
                        reactionLike.forEach(elm => elm.addEventListener("click", likeHandel))
                        let reactionDisLike = document.querySelectorAll("#dislike")
                        reactionDisLike.forEach(elm => elm.addEventListener("click", likeHandel))
                    }

                }
            })
            .catch(error => {
                console.log('Error:', error);

            });


    } else {
        let comment = postDiv.querySelectorAll(".comment-content")
    
        comment.forEach((el) => {
            el.remove()
        })
        event.target.classList.remove("on")
        event.target.classList.add("of")
    }

}


function logoutHandel() {
    fetch("/logout", {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            if (data.status == true) {
                document.cookie = "SessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                Checkstuts()
            }
        })
        .catch(error => {
            console.log('Error:', error);
        });

        updateUserList()
}






