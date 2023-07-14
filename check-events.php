<?php
require 'database.php';
header("Content-Type: application/json");
session_start();

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$user_id = $_SESSION['user_id'];
$cellId = $json_obj['cellId'];

//checks for events made by that user, shared with that 
//user through the share feature, or shared with that user 
//through the group event feature
$stmt = $mysqli->prepare("SELECT e.event_id, e.title, e.description, e.time, e.tag_id, t.color, t.name
                         FROM event AS e
                         JOIN user AS u ON e.user_id = u.user_id
                         LEFT JOIN tag AS t ON e.tag_id = t.tag_id
                         LEFT JOIN share AS s ON e.user_id = s.user_from AND s.user_to = ?
                         WHERE ((e.user_id = ? OR s.user_to IS NOT NULL)
                            OR e.event_id IN (SELECT event_id FROM groupevent WHERE user_id = ?))
                            AND e.cellId = ?
                         ORDER BY e.time");

$stmt->bind_param("iiis", $user_id, $user_id, $user_id, $cellId);
/* older query
$stmt = $mysqli->prepare("SELECT e.event_id, e.title, e.description, e.time, e.tag_id, t.color, t.name
                         FROM event AS e
                         JOIN user AS u ON e.user_id = u.user_id
                         LEFT JOIN tag AS t ON e.tag_id = t.tag_id
                         LEFT JOIN share AS s ON e.user_id = s.user_from AND s.user_to = ?
                         WHERE (e.user_id = ? OR s.user_to IS NOT NULL) AND e.cellId = ?
                         ORDER BY e.time");

$stmt->bind_param("iis", $user_id, $user_id, $cellId);
*/
//$stmt = $mysqli->prepare("select event.event_id, event.title, event.description, event.time, event.tag_id, tag.color, tag.name from event join user on (event.user_id = user.user_id) left join tag on (event.tag_id = tag.tag_id) where event.cellId=? AND event.user_id=? order by event.time");
//$stmt->bind_param('si', $cellId, $user_id);
$stmt->execute();
$stmt->bind_result($event_id, $eventName, $eventDesc, $eventTime, $tag_id, $color, $tagName);

$results = array();

//returns array with all necessary info about the event
while($stmt->fetch()) {
    $resultRow = array(
        'cellId' => $cellId,
        'event_id' => $event_id,
        'title' => $eventName,
        'description' => $eventDesc,
        'time' => $eventTime,
        'tag_id'=> $tag_id,
        'color'=> htmlentities($color),
        'tagName'=> htmlentities($tagName)
    );

    $results[] = $resultRow;
}

$stmt->close();

echo json_encode($results);
exit;

?>