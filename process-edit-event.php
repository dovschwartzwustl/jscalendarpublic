<?php
require 'database.php';
include 'dateTimeFormat.php';
header("Content-Type: application/json");
session_start();

//handles editing events
$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);


$event_id = $json_obj['event_id'];
$eventName = $json_obj['eventName'];
$eventDesc = $json_obj['eventDesc'];
$eventTime = $json_obj['eventTime'];
$date = $json_obj['date'];
$tagName = $json_obj['tagName'];
$token = $json_obj['token'];
if(!hash_equals($_SESSION['token'], $token)){
	die("Request forgery detected");
}

//cellId is stored as MMDDYYYY and eventTime as XX:XX
$sqlDateTime = dateTimeFormat($date, $eventTime);

//different query if tagname is set or not
if(isset($tagName)) {
    $stmt = $mysqli->prepare("SELECT tag_id FROM tag WHERE name = ?");
    $stmt->bind_param('s', $tagName);
    $stmt->execute();
    $stmt->bind_result($tag_id);

    if ($stmt->fetch()) {
        $tag_id = $tag_id;
    } else {
        $tag_id = null;
    }

    $stmt->close();

    $stmt = $mysqli->prepare("UPDATE event SET title = ?, description = ?, time = ?, tag_id = ? WHERE event_id = ?");
    $stmt->bind_param('sssii', $eventName, $eventDesc, $sqlDateTime, $tag_id, $event_id);
    $stmt->execute();
    $stmt->close();
} else {
    $stmt = $mysqli->prepare("UPDATE event SET title = ?, description = ?, time = ? WHERE event_id = ?");
    $stmt->bind_param('sssi', $eventName, $eventDesc, $sqlDateTime, $event_id);
    $stmt->execute();
    $stmt->close();
}





echo json_encode(array(
    "success"=>true
));
exit;
?>