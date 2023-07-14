document.getElementById("register_btn").addEventListener("click", registerAjax, false); // Bind the AJAX call to button click
  
//handles registering of users
function registerAjax(event) {
    //to be able to clear them after logging in
    const usernameInput = document.getElementById("reg-username");
    const passwordInput = document.getElementById("reg-password");
    const confirmPasswordInput = document.getElementById("reg-confirmpassword");

    const username = document.getElementById("reg-username").value; // Get the username from the form
    const password = document.getElementById("reg-password").value; // Get the password from the form
    const confirmpassword = document.getElementById("reg-confirmpassword").value;

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username, 'password': password, 'confirmpassword': confirmpassword };

    fetch("register-ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {

            console.log(data.success ? (alert("Register successful, please log in"),
            (document.getElementById("register").style.display = 'none'),
            (document.getElementById("reg-username").value = ""),
            (document.getElementById("reg-password").value = ""),
            (document.getElementById("reg-confirmpassword").value = ""),
            (confirmPasswordInput.value = "")) : (alert(data.message),
            (document.getElementById("reg-username").value = ""),
            (document.getElementById("reg-password").value = ""),
            (document.getElementById("reg-confirmpassword").value = "")));
            
        })
        .catch(err => console.error(err));
}