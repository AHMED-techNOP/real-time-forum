import { Dateformat, debounce } from "./utils.js"
import { Listener } from "./service.js"
import { Checkstuts, username } from "./check.js";
import { showError } from "./errore.js";

let socket;
let Users = []

export const Homepage = (data) => {
    console.log("==== data ", data);
    // let title = document.querySelector("title")
    // let name = title.getAttribute("class")
    let name = username
    document.body.innerHTML = `
    <header class="header">
        <div class="logo">FORUM</div>
        <button id="logout">logout</button>
    </header>
    `
    let container = document.createElement("div");
    container.setAttribute("class", "container")
    let sidebar = document.createElement("aside")
    sidebar.setAttribute("class", "sidebar")
    let info = document.createElement("div")
    info.setAttribute("class", "contact")
    let profile = document.createElement("span")
    profile.setAttribute("class", "material-icons")
    profile.textContent = "account_circle"
    let user = document.createElement("span")
    user.textContent = name
    let online = document.createElement("span")
    online.setAttribute("class", "online-indicator")
    info.append(profile)
    info.append(user)
    info.append(online)
    sidebar.append(info)
    sidebar.innerHTML += `
                <h3>Category</h3>
                <div class="category-list">
                 <button class="cat" value="all" >All</button>
                <button class="cat" value="Tech Support" >Tech Support</button>
                <button class="cat" value="General Discussion">General Discussion</button>
                <button class="cat" value="Tutorials">Tutorials</button>
                <button class="cat" value="Gaming">Gaming</button>
                <button class="cat" value="Hobbies & Interests">Hobbies & Interests</button>
                <button class="cat" value="Job Listings">Job Listings</button>
                <button class="cat" value="Announcements">Announcements</button>
            </div>
    `
    container.append(sidebar)
    let main = document.createElement("main")
    main.setAttribute("class", "main-content")
    main.id = "main-content"
    let creatPost = document.createElement("div")
    creatPost.setAttribute("class", "create-post")
    creatPost.innerHTML = "<button>+ creat a post</button>"
    main.append(creatPost)
    container.append(main)
    let creatcontainer = document.createElement("div")
    creatcontainer.setAttribute("class", "form-container")
    creatcontainer.innerHTML = `
        <form name="creatpost">
            <div class="form-group">
            <div>
            <span class="material-icons" id="close">
                        close
                </span>
                <label>Post Title</label>
                <input type="text" name="title" class="form-control" placeholder="Enter post title" required >
                </div>
            </div>

            <div class="form-group">
                <label>Post Content</label>
                <textarea class="form-control" name="content"  rows="5" placeholder="Write your post content" required></textarea>
            </div>

            <div class="form-group">
                <label>Select Categories</label>
                <div class="category-grid">
                    <label class="category-checkbox"> 
                        <input type="checkbox" name="categories" value="Tech Support">
                        Tech Support
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories" value="General Discussion" >
                        General Discussion
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories"  value="Tutorials"  >
                        Tutorials
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories" value="Gaming">
                        Gaming
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories" value="Hobbies & Interests">
                        Hobbies & Interests
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories" value="Job Listings">
                        Job Listings
                    </label>
                    <label class="category-checkbox">
                        <input type="checkbox" name="categories" value="Announcements">
                        Announcements
                    </label>
                </div>
            </div>
                <p id="error-message"></p>
            <button type="submit" class="submit-btn">Submit Post</button>
        </form>
    `
    creatcontainer.style.display = "none"
    main.append(creatcontainer)
    container.append(main)
    document.body.append(container)

    if (data && data.finish === undefined) {
        MoreData(data)


    } else {
        let post = document.createElement("div")
        post.setAttribute("class", "post")
        let p = document.createElement("p")
        p.textContent = "no post found"
        post.append(p)
        main.append(post)
    }


    let contacts = document.createElement("aside");
    contacts.setAttribute("class", "contacts");
    contacts.innerHTML = `
     <div style=" margin-bottom: 1rem;">
            <span class="material-icons" id="cancel">visibility_off</span>
            <h3>Contacts</h3>
     </div>
    `;

    let contactList = document.createElement("div");
    contactList.setAttribute("id", "contact-list");


    contacts.append(contactList);
    container.append(contacts);
    document.body.append(container);

    // Initialize WebSocket
    // const username = document.querySelector("title").getAttribute("class");
    socket = new WebSocket(`/ws?username=${username}`)

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);

        // Check if the message is about online users
        if (data.type === "online-users") {
            Users = data.users; // Array of users with their online status
            console.log("==== users ", Users);

            
            updateUserList()

        } else {
            // Handle other message types (e.g., chat messages)
            const message = data;
            
            displayMessage(message.sender, message.content, message.Time, message.sender === username ? message.receiver : message.sender, 1)
        }
    }
}


export function updateUserList() {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = ""; // Clear the existing list
        console.log("==== users ", Users);

    Users.forEach((user) => {
        let contact = document.createElement("div");
        contact.setAttribute("class", "contact");
        contact.textContent = user.username;

        // Add green circle for online users
        if (user.online) {
            let onlineIndicator = document.createElement("span");
            onlineIndicator.setAttribute("class", "online-indicator");
            onlineIndicator.style.backgroundColor = "green";
            onlineIndicator.style.borderRadius = "50%";
            onlineIndicator.style.width = "10px";
            onlineIndicator.style.height = "10px";
            onlineIndicator.style.display = "inline-block";
            onlineIndicator.style.marginLeft = "10px";
            contact.append(onlineIndicator);
        }

        contact.addEventListener("click", async () => {
            console.log(`Clicked on user: ${user.username}`);

            // openchat(receiver)
            openChat(user.username);

           const chatData = await getChats(username, user.username, 0)
           
           if (chatData) {
            chatData.forEach(el => {
                displayMessage(el.Sender, el.Text, el.Time, el.Sender === username ? el.Receiver : el.Sender)
            })
           }
        })



        contactList.append(contact);
    });
}


async function getChats(sender, receiver, num = 1) {
    try {
        const response = await fetch("/getChats", {
            method: 'POST',
            body: JSON.stringify({ sender: sender, receiver: receiver, num: num}),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}




function openChat(receiver) {
    console.log(`Opening chat with: ${receiver}`);

    // Sanitize the receiver's username for use in the id
    const sanitizedReceiver = receiver.replace(/\s+/g, "-"); // Replace spaces with hyphens

    // Remove any existing chat window
    const existingChatWindow = document.querySelector(".chat-window");
    if (existingChatWindow) {
        existingChatWindow.remove();
        console.log("Previous chat window removed.");
    }

    // Create the chat window
    const chatWindow = document.createElement("div");
    chatWindow.setAttribute("id", `chat-window-${sanitizedReceiver}`);
    chatWindow.setAttribute("class", "chat-window");
    chatWindow.innerHTML = `
       <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>Chat with ${receiver}</h3>
            <button id="close-chat-${sanitizedReceiver}" style="background: none; border: none; cursor: pointer; font-size: 16px;">X</button>
        </div>
        <div class="chat-messages" id="chat-messages-${sanitizedReceiver}" style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;"></div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <textarea id="chat-input-${sanitizedReceiver}" placeholder="Type a message..." style="flex: 1; height: 50px; margin-right: 10px;"></textarea>
            <button id="send-message-${sanitizedReceiver}" style="background: none; border: none; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                </svg>
            </button>
        </div>
    `;

    // Apply temporary inline styles for visibility
    chatWindow.style.border = "1px solid black";
    chatWindow.style.backgroundColor = "white";
    chatWindow.style.position = "fixed";
    chatWindow.style.bottom = "10px";
    chatWindow.style.right = "10px";
    chatWindow.style.width = "300px";
    chatWindow.style.height = "400px";
    chatWindow.style.zIndex = "1000";
    chatWindow.style.overflow = "hidden";

    
    document.body.append(chatWindow);

     // Add event listener to the close button
     const closeButton = document.querySelector(`#close-chat-${sanitizedReceiver}`);
     closeButton.addEventListener("click", () => {
         chatWindow.remove();
         console.log(`Chat window with ${receiver} closed.`);
     });


    let chat = document.getElementById(`chat-messages-${sanitizedReceiver}`)
    chat.style.display = "flex"
    chat.style.flexDirection = "column-reverse"

    chat.addEventListener("scrollend", debounce(async () => {

        const chatData = await getChats(username, receiver)

        if (chatData) {
            chatData.forEach(el => {
                displayMessage(el.Sender, el.Text, el.Time, el.Sender === username ? el.Receiver : el.Sender)
            })
           }
    }, 500))

    console.log("Chat window appended to the DOM.");

    // Ensure the send button exists before attaching the event listener
    const sendButton = document.querySelector(`#send-message-${sanitizedReceiver}`);
    if (!sendButton) {
        console.error(`Send button for ${receiver} not found.`);
        return;
    }

    sendButton.addEventListener("click", () => {
        const input = document.querySelector(`#chat-input-${sanitizedReceiver}`);
        if (!input) {
            console.error(`Input field for ${receiver} not found.`);
            return;
        }

        const message = input.value;
        if (message.trim()) {
            // Use the username variable to send the message
            socket.send(JSON.stringify({ sender: username, receiver: receiver, content: message }))
            // displayMessage({ sender: username, content: message }, receiver);
            input.value = ""
        }
    })
}
function displayMessage(sender, content, time, receiver, i = 0) {
    // const username = document.querySelector("title").getAttribute("class"); // Get the current user's username
    const sanitizedReceiver = receiver.replace(/\s+/g, "-"); // Sanitize receiver username
    const chatMessages = document.querySelector(`#chat-messages-${sanitizedReceiver}`);

    if (chatMessages) {
        const msg = document.createElement("div");
        const span = document.createElement("span");

        msg.style.padding = "10px";
        msg.style.margin = "8px 0";
        msg.style.borderRadius = "6px";
        msg.style.fontFamily = "Arial, sans-serif";
        msg.style.fontSize = "14px";
        msg.style.position = "relative";
        msg.style.maxWidth = "70%";  // Set a max width to prevent messages from getting too wide.

        // Styling for the timestamp
        span.style.color = "#888";
        span.style.fontSize = "12px";
        span.style.position = "absolute";
        span.style.bottom = "6px";
        span.style.right = "10px"; // Position the timestamp

        // Set the message content
        msg.textContent = `${sender}: ${content}`
        // span.textContent = `${time}`;

        // Check if the message is from the current user (sender)
        if (sender === username) {
            // Style for sender's message
            msg.style.backgroundColor = "#2a91ffd0";  // Green background for sender
            msg.style.color = "#fff";  // White text for sender
            msg.style.alignSelf = "flex-end";  // Align sender's message to the right

            msg.append(span)
            i === 0 ? chatMessages.append(msg) : chatMessages.prepend(msg) 
        } else {
            // Style for receiver's message
            msg.style.backgroundColor = "#f1f1f1";  // Light gray background for receiver
            msg.style.color = "#000";  // Black text for receiver
            msg.style.alignSelf = "flex-start";  // Align receiver's message to the left

            msg.append(span);
            i === 0 ? chatMessages.append(msg) : chatMessages.prepend(msg) 
        }

        // Ensure chat container scrolls to the bottom to show the latest message
        // chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


export const MoreData = (data) => {
    let main = document.querySelector(".main-content")
    let post = document.querySelectorAll(".post")
    let arr = []
    post.forEach((ele) => arr.push(ele.getAttribute("postid")))
    if (data) {
        data.forEach(element => {
            if (!arr.includes(String(element.ID))) {
                let post = document.createElement("div")
                post.setAttribute("postid", element.ID)
                post.setAttribute("class", "post")
                let post_header = document.createElement("div")
                let poster_profile = document.createElement("span")
                poster_profile.setAttribute("class", "material-icons")
                poster_profile.textContent = "account_circle"
                post_header.append(poster_profile)
                post_header.setAttribute("class", "post-header")
                let poster = document.createElement("span")
                poster.textContent = element.Username
                let time = document.createElement("span")
                time.textContent = Dateformat(element.CreatedAt)
                time.style.color = "#6c757d"
                post_header.append(poster)
                post_header.append(time)
                let title = document.createElement("h4")
                title.textContent = element.Title + "   ====> " + element.ID
                let p = document.createElement("p")
                p.textContent = element.Content
                let cat = document.createElement("i")
                cat.textContent = `Categories : [${element.Categories}]`
                cat.style.color = "#b3b3b3"
                post.append(post_header)
                post.append(title)
                post.append(p)
                post.append(cat)
                let reaction = document.createElement("div")
                reaction.setAttribute("class", "post-actions")
                let likes = document.createElement("div")
                likes.setAttribute("class", "reactions")
                likes.innerHTML = `
            <div class="like-button" data-status="of">
            <span id="like" data-type="post" data-status="of" data-id = ${element.ID}  class="material-icons">thumb_up_off_alt</span> <b>${element.Like}</b>
            </div>
            <div class="like-button" data-status="of">
            <span id="dislike" data-type="post" data-status="of" data-id = ${element.ID} class="material-icons">thumb_down_off_alt</span>  <b>${element.DisLike}</b>
            </div>`
                let comment = document.createElement("div")
                comment.textContent = `${element.Nembre} 💬`
                comment.setAttribute("id", "comment")
                comment.setAttribute("class", "of")
                comment.setAttribute("posteid", element.ID)
                console.log(element.Like);

                if (element.Have === "like") {
                    let like = likes.querySelector("#like")
                    like.setAttribute("data-status", "on")
                    like.parentNode.setAttribute("data-status", "on")
                } else if (element.Have === "dislike") {
                    let dislike = likes.querySelector("#dislike")
                    dislike.setAttribute("data-status", "on")
                    dislike.parentNode.setAttribute("data-status", "on")
                }
                reaction.append(likes)
                reaction.append(comment)
                post.append(reaction)
                main.append(post)
                post.innerHTML += `<div class="input-wrapper">
                 <textarea placeholder="Kteb commentaire..." class="comment-input" data-idpost = ${element.ID}></textarea>
                    <button class="send-button">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                             <path d="M22 2L11 13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                             <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                         </svg>
                    </button>
                    <p id="error-message"></p>
                    </div>`
            }
        })
        Listener()
    } else {
        let post = document.createElement("div")
        post.setAttribute("class", "post")
        let p = document.createElement("p")
        p.textContent = "no post found"
        post.append(p)
        main.append(post)
    }
}


export const Regester = () => {
    document.body.innerHTML = `
    <div id="register-container" style="display: none;">
        <div class="info-side">
            <h2>Create an account</h2>
            <p>Join us and enjoy all the benefits of our platform</p>
            <ul class="feature-list">
                <li>Customer Service 24/7</li>
                <li>Interface simple et intuitive</li>
                <li>Protection of your personal data</li>
                <li>Regular feature updates</li>
            </ul>
        </div>
        <div class="register">
            <h1>Create Your Account</h1>
            <form id="register-form" method="post">
                <div class="name-row">
                    <div class="form-group">
                        <label for="f-n">First Name</label>
                        <input type="text" id="firstName" placeholder="John">
                    </div>
                    <div class="form-group">
                        <label for="l-n">Last Name</label>
                        <input type="text" id="lastName" placeholder="Doe">
                    </div>
                </div>
                <div class="form-group">
                    <label for="age">Age</label>
                    <input type="number" id="age" placeholder="25">
                </div>
                <div class="form-group">
                    <label for="gender">Gender</label>
                    <select id="gender">
                        <option value="" disabled selected>Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="username">Nickname</label>
                    <input type="text" id="nickname" placeholder="johndoe">
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" placeholder="john@example.com">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="••••••••">
                </div>
                <div class="fill">
                    <span>Fill in all fields</span>
                </div>
                <p id="error-reg"></p>
                <button type="submit" id="creat-btn">Create Account</button>
                <span class="have">Already have an account?</span>
                <button id="log">Login</button>
            </form>
        </div>
    </div>

    

    <div id="login-container">
        <div class="info-side">
            <h2>Welcome back!</h2>
            <p>Log in to access your account</p>
            <p>Take advantage of all our exclusive services and features.</p>
        </div>
        <div class="login-form">
            <h1>Login</h1>
            <form id="login-form" method="post">
                <div class="form-group">
                    <label>Nickname / Email</label>
                    <input type="text" id="userInput" name="email" placeholder="Nickname ola Email">
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="paswd" name="password" placeholder="••••••••" required>
                </div>
                <p id="error-log"></p>
                <button type="submit" id="login-btn">Login</button>
                <div class="register-link">
                    Pas encore de compte? <button id="resgesterlogin">Create an account</button>
                </div>
            </form>
            
        </div>
    </div>


 `;

}

// export const Login = () => {
//     document.body.innerHTML = `<div id="login-container">
//         <div class="info-side">
//             <h2>Welcome back!</h2>
//             <p>Log in to access your account</p>
//             <p>Take advantage of all our exclusive services and features.</p>
//         </div>
//         <div class="login-form">
//             <h1>Login</h1>
//             <form id="login-form" method="post">
//                 <div class="form-group">
//                     <label>Nickname / Email</label>
//                     <input type="text" id="userInput" name="email" placeholder="Nickname ola Email">
//                 </div>
//                 <div class="form-group">
//                     <label for="password">Mot de passe</label>
//                     <input type="password" id="paswd" name="password" placeholder="••••••••" required>
//                 </div>
//                 <p id="error-message"></p>
//                 <button type="submit" id="login-btn">Login</button>
//                 <div class="register-link">
//                     Pas encore de compte? <button id="resgesterlogin">Create an account</button>
//                 </div>
//             </form>
            
//         </div>
//     </div>
//     `
// }