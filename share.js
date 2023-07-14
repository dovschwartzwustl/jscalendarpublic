document.getElementById("share_btn").addEventListener("click", openShareForm);
document.getElementById("closeShare").addEventListener("click", closeShareForm);
document.getElementById("saveShare").addEventListener("click", saveShare);


//handles share form and share ajax
function openShareForm() {
    document.getElementById("shareForm").style.display="block";
}

function closeShareForm() {
    document.getElementById("shareForm").style.display="none";
}

function saveShare() {
    const usernameBox = document.getElementById("shareUser");
    const username = usernameBox.value;
    usernameBox.value='';
    closeShareForm();
    const data = {'user'  :username};
    fetch("process-share.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log("shared"))
    .catch(err => console.error(err));
}