
document.getElementById("login_btn").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click
document.addEventListener("DOMContentLoaded", checkLogin);
//stores the session token, which is reset upon logout

let token = '';
function loginAjax(event) {
    //to be able to clear them after logging in
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    //accessing the text entry
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password };

    fetch("login-ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        //.then(data => console.log(data.username + data.password))
        .then(data => {
            console.log(data.success ? "You've been logged in!" : 
            alert("Invalid login credentials"));
            token = data.token;
            //console.log(token);
            //clear the text boxes
            usernameInput.value = "";
            passwordInput.value = "";
            checkLogin();
        })
        .catch(err => console.error(err));

        
}


function checkLogin() {
    //prob needs to call a php or json file
    let isLoggedIn = false;
    let username = null;
    fetch("check-login.php")
    .then(res => res.json())
    .then(data => {
        if(data.loggedin == true) {
            isLoggedIn = true;
            username = data.username;
            //removing any text that is already there
            
            document.getElementById("calendar").style.pointerEvents="auto";
            //adding welcome statement
            const message = document.getElementById("logged-in-message");
            message.textContent = "Welcome, " + username;
            message.style.display = "block";
            console.log(username + " is logged in");
            const logoutmessage = document.getElementById("logged-out-message");
            logoutmessage.style.display = "none";


            //changing login area to logout area
            const registerform = document.getElementById("register");
            registerform.style.display='none';
            const login_form = document.getElementById("login-form");
            login_form.style.display = "none";
            const logout_btn = document.getElementById("logout_btn")
            logout_btn.style.display = "block";
            const createTagButton = document.getElementById("create_tag_btns");
            createTagButton.style.display="block";
            const shareButton = document.getElementById("share_btn");
            shareButton.style.display="block";
            updateCalendar();
            
        } else {
            isLoggedIn = false;
            username = null;
            token = '';
            document.getElementById("calendar").style.pointerEvents="none";

            const registerform = document.getElementById("register");
            registerform.style.display='block';
            const loggedoutmessage = document.getElementById("logged-out-message");
            loggedoutmessage.style.display = "block";
            const loggedinmessage = document.getElementById("logged-in-message");
            loggedinmessage.style.display = "none";
            const createTagButton = document.getElementById("create_tag_btns");
            createTagButton.style.display="none";
            const shareButton = document.getElementById("share_btn");
            shareButton.style.display="none";
            console.log("NOT logged in")
        }
    })
    .catch(error => console.error('Error:',error))
}