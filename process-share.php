<?php
require 'database.php';
include 'dateTimeFormat.php';
header("Content-Type: application/json");
session_start();

//handles sharing of entire calendars
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$userToName = $json_obj['user'];

$stmt = $mysqli->prepare("SELECT user_id FROM user WHERE username = ?");
$stmt->bind_param("s", $userToName);
$stmt->execute();
$stmt->bind_result($userToId);
$stmt->fetch();
$stmt->close();


$stmt = $mysqli->prepare("INSERT INTO share (user_from, user_to) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $userToId);
$stmt->execute();
$stmt->close();

echo json_encode(array(
    "success"=>true
));
exit;

?>