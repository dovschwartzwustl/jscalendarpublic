<?php

require 'database.php';
error_reporting(E_ALL);
header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

//Because you are posting the data via fetch(), php has to retrieve it elsewhere.
$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

//Variables can be accessed as such:
$newuser = $json_obj['username'];
$password = $json_obj['password'];
$confirmpassword = $json_obj['confirmpassword'];

if($password != $confirmpassword) {
    echo json_encode(array(
		"success" => false,
		"message" => "Passwords don't match"
	));
	exit;
}
//This is equivalent to what you previously did with $_POST['username'] and $_POST['password']

// Check to see if the username and password are valid.  (You learned how to do this in Module 3.)
$stmt = $mysqli->prepare("select username from user");
$stmt->execute();
$stmt->bind_result($returned_username);

$user_exists = false;
while($stmt->fetch()){
    if($returned_username===$newuser) {
        $user_exists = true;
        echo json_encode(array(
            "success" => false,
            "message" => "User exists"
        ));
        exit;
    }
}
$stmt->close();


if(!$user_exists){
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $adduser = $mysqli->prepare("insert into user (username, password) values (?, ?)");
    if(!$adduser){
        echo json_encode(array(
            "success" => false,
            "message" => "Query Prep Failed: %s\n", $mysqli->error
        ));
        exit;
    }

    $adduser->bind_param('ss', $newuser, $hashed_password);
    $adduser->execute();
    $adduser->close(); 
    echo json_encode(array(
		"success" => true,
        "message" => "User registered"
	));
	exit;
} 

?>