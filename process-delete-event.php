<?php
require 'database.php';
header("Content-Type: application/json");
session_start();

//handles deleting events ajax request

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$event_id = $json_obj['event_id'];
$token = $json_obj['token'];
if(!hash_equals($_SESSION['token'], $token)){
	die("Request forgery detected");
}

$stmt = $mysqli->prepare("DELETE FROM groupevent WHERE event_id = ?");
$stmt->bind_param("i", $event_id);
$stmt->execute();
$stmt->close();


$stmt = $mysqli->prepare("DELETE FROM event WHERE event_id = ?");
$stmt->bind_param('i', $event_id);
$stmt->execute();
$stmt->close();

echo json_encode(array(
    "success"=>true
));
exit;

?>