<?php
require 'database.php';
include 'dateTimeFormat.php';
header("Content-Type: application/json");
session_start();

//creates the tag
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$tagName = $json_obj['tagName'];
$tagColor = $json_obj['tagColor'];

//makes sure tag doesn't already exist
$stmt = $mysqli->prepare("select name from tag");
$stmt->execute();
$stmt->bind_result($returned_tags);
$tag_exists = false;
while($stmt->fetch()){
    if($returned_tags===$tagName) {
        $tag_exists = true;
        echo json_encode(array(
            "success"=>false,
            "tag_id"=>"tag exists"
        ));
        exit;
    }
}



$stmt = $mysqli->prepare("insert into tag (name, color, user_id) values (?, ?, ?)");
$stmt->bind_param('ssi', $tagName, $tagColor, $user_id);
$stmt->execute();

$tag_id = $mysqli -> insert_id;
$stmt->close();

echo json_encode(array(
    "success"=>true,
    "tag_id"=>$tag_id
));
exit;

?>