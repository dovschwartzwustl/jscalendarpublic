document.getElementById("saveTag").addEventListener("click", saveTag);
document.getElementById("closeTag").addEventListener("click", closeTagForm);
document.getElementById("create_tag_btn").addEventListener("click", openTagForm)

//handles tag form and tag ajax
function openTagForm() {
    document.getElementById("createTagForm").style.display="block";
}

function closeTagForm() {
    document.getElementById("createTagForm").style.display="none";

}

function saveTag() {
    const tagBox = document.getElementById("tagName");
    const colorBox = document.getElementById("tagColor");
    const tagName = tagBox.value;
    const tagColor = colorBox.value;
    if(!escapeColor(tagColor)) {
        return;
    }
    tagBox.value='';
    colorBox.value='';
    closeTagForm();
    const data = {'tagName': tagName, 'tagColor': tagColor};

    fetch("process-new-tag.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log("tag #"+data.tag_id))
    .catch(err => console.error(err));
}

//sanitizing color input
function escapeColor(input) {
    var pattern = /^#[0-9A-Fa-f]{6}$/;
    return pattern.test(input);
}
