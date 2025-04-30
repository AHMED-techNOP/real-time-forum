const registration = `
<body>

    <form method="post" id="registration-form">
        <div class="container">

            <h1>Register</h1>

            <label for="nickname">Nickname</label>
            <input type="text" id="nickname" name="nickname">

            <label for="age">Age</label>
            <input type="text" id="age" name="age">

            <label>Gender</label>
            <div>
                <label class="gender-label" for="male">Male</label>
                <input type="radio" id="male" name="gender" value="Male">
                <label class="gender-label" for="female">Female</label>
                <input type="radio" id="female" name="gender" value="Female">
            </div>

            <label for="first-name">First Name</label>
            <input type="text" id="first-name" name="first-name">

            <label for="last-name">Last Name</label>
            <input type="text" id="last-name" name="last-name">

            <label for="email">E-mail</label>
            <input type="email" id="email" name="email">

            <label for="password-1">Password</label>
            <input type="password" id="password-1" name="password">

            <div class="error" id="error-message"></div>

            <button type="submit">Submit</button>
            <p>do you have an account ? <span id="log-in">Log-in</span></p>
        </div>
    </form>
</body>
`


const login = `
<body>

    <form action="#" method="post" id="log-in-form">
        <div class="container">

            <h1>Log-in</h1>

            <label for="email">E-mail or Nickname</label>
            <input type="text" id="email" name="username">

            <label for="password-1">Password</label>
            <input type="password" id="password-1" name="password">

            <button type="submit">Submit</button>
            <p>you don't have an account ? <span id="register">Register</span></p>
        </div>
    </form>


</body>
`

const home = `
<body>

 <h1> Home </h1>
 
</body>
`

export { registration, login, home }