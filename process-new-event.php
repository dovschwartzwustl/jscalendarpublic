<?php
require 'database.php';
include 'dateTimeFormat.php';
header("Content-Type: application/json");
session_start();


$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$cellId = $json_obj['cellId'];
$eventName = $json_obj['eventName'];
$eventDesc = $json_obj['eventDesc'];
$eventTime = $json_obj['eventTime'];
$tagName = $json_obj['tagName'];
$addUsersArray = $json_obj['addUsersArray'];
$token = $json_obj['token'];
if(!hash_equals($_SESSION['token'], $token)){
	die("Request forgery detected");
}

//cellId is stored as MMDDYYYY and eventTime as XX:XX
$sqlDateTime = dateTimeFormat($cellId, $eventTime);

//specific queries for if tag name is set or not
if(isset($tagName)) {
    $stmt = $mysqli->prepare("SELECT tag_id FROM tag WHERE name = ? AND user_id= ?");
    $stmt->bind_param('si', $tagName, $user_id);
    $stmt->execute();
    $stmt->bind_result($tag_id);

    if ($stmt->fetch()) {
        $tag_id = $tag_id;
    } else {
        $tag_id = null;
    }

    $stmt->close();

    //inserting the event
    $stmt = $mysqli->prepare("insert into event (user_id, title, description, time, cellId, tag_id) values (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('issssi', $user_id, $eventName, $eventDesc, $sqlDateTime, $cellId, $tag_id);
    $stmt->execute();

    $event_id = $mysqli -> insert_id;
    $stmt->close();
} else {
    $stmt = $mysqli->prepare("insert into event (user_id, title, description, time, cellId) values (?, ?, ?, ?, ?)");
    $stmt->bind_param('issss', $user_id, $eventName, $eventDesc, $sqlDateTime, $cellId);
    $stmt->execute();

    $event_id = $mysqli -> insert_id;
    $stmt->close();
}





//converts array of passed in usernames into user ids
function getUserIdsByUsernames($mysqli, $addUsersArray) {
    $stmt = $mysqli->prepare("SELECT user_id FROM user WHERE username = ?");
    $userIds = array();
    foreach ($addUsersArray as $username) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($user_id);
        $stmt->fetch();
        $userIds[] = $user_id;
    }
    
    $stmt->close();
    return $userIds;
}

//if it is a group event, this executes
if (isset($addUsersArray)) {
    $addUserIdsArray = getUserIdsByUsernames($mysqli, $addUsersArray);

    //inserts userid and event id into group event which allows the event to be shared with those users
    $stmt = $mysqli->prepare("INSERT INTO groupevent (event_id, user_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $event_id, $add_user_id);

    foreach ($addUserIdsArray as $userId) {
        $add_user_id=$userId;
        $stmt->execute();
    }

    $stmt->close();
}


echo json_encode(array(
    "success"=>true
));
exit;

?>