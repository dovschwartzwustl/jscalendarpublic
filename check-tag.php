<?php
require 'database.php';
header("Content-Type: application/json");
session_start();

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$tag_id = $json_obj['tag_id'];

//gets the color from the tag, given the tag_id
$stmt = $mysqli->prepare("select color from tag where tag_id=?");
$stmt->bind_param('i', $tag_id);
$stmt->execute();
$stmt->bind_result($result);

if ($stmt->fetch()) {
    $color = $result;
} else {
    $color = null;
}


$stmt->close();

echo json_encode(array(
    "color"=>$color
));
exit;

?>