<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Retrieve the JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true); // Decodes JSON into an associative array

// Check if the 'id' is set in the JSON payload
if (!isset($data['id'])) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Missing ID parameter";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$personnelId = $data['id']; // Get the ID from the parsed JSON

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check for a connection error
if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

// First query: fetch personnel data by ID
$query = $conn->prepare('SELECT `id`, `firstName`, `lastName`, `email`, `jobTitle`, `departmentID` FROM `personnel` WHERE `id` = ?');
$query->bind_param("i", $personnelId);

$query->execute();

$result = $query->get_result();
$personnel = [];

// Fetch personnel data and store it in the array
while ($row = $result->fetch_assoc()) {
    array_push($personnel, $row);
}

$query->close();

if (!$personnel) {
    $output['status']['code'] = "404";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Personnel not found";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Second query: fetch department data
$departmentQuery = $conn->prepare('SELECT `id`, `name` FROM `department`');
$departmentQuery->execute();

$departmentResult = $departmentQuery->get_result();
$departments = [];

// Fetch department data and store it in the array
while ($departmentRow = $departmentResult->fetch_assoc()) {
    array_push($departments, $departmentRow);
}

$departmentQuery->close();

// Check for query failure
if (!$departmentResult) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Department query failed";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}


mysqli_close($conn);


$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['personnel'] = $personnel;
$output['data']['department'] = $departments;


echo json_encode($output);

?>
