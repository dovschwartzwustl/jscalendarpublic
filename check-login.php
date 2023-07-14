<?php
session_start();
header("Content-Type: application/json");
//ajax for checking if user is logged in
if(isset($_SESSION['username'])) {
    echo json_encode(array(
		"loggedin" => true,
		"username" => $_SESSION['username']
	));
	exit;
} else {
    echo json_encode(array(
		"loggedin" => false,
		"username" => "not logged in"
	));
	exit;
}

?>