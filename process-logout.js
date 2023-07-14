
function showLogoutButton() {

    const loginLogoutDiv = document.getElementById("login-logout");
    loginLogoutDiv.innerHTML = ""; // Clear the contents of the div

    const logoutButton = document.createElement("button");
    logoutButton.id = "logout_btn";
    logoutButton.textContent = "Log Out";
    logoutButton.addEventListener("click", processLogout);
    loginLogoutDiv.appendChild(logoutButton);
}

function processLogout() {
    fetch("process-logout.php")
    .then(response=>
        {document.getElementById("logout_btn").addEventListener("click", processLogout, false);

        //resets all necessary values upon logout, such as clearing certain buttons
        token = '';
        document.getElementById("calendar").style.pointerEvents="none";
        const registerform = document.getElementById("register");
        registerform.style.display='block';
        const login_form = document.getElementById("login-form");
        login_form.style.display = "block";
        const logout_btn = document.getElementById("logout_btn")
        logout_btn.style.display = "none";
        const logoutmessage = document.getElementById("logged-out-message");
        logoutmessage.style.display = "block";
        const loggedinmessage = document.getElementById("logged-in-message");
        loggedinmessage.style.display = "none";
        console.log("logged out");
        const createTagButton = document.getElementById("create_tag_btns");
        createTagButton.style.display="none";
        const shareButton = document.getElementById("share_btn");
        shareButton.style.display="none";
        updateCalendar();
    
        });
    

}

document.getElementById("logout_btn").addEventListener("click", processLogout, false);
