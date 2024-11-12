<?php
 // Enable error reporting for debugging
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Include your database connection details
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Create a new MySQLi connection
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Ensure that all the required parameters are set
if (!isset($_POST['name'], $_POST['locationID'])) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Missing required parameters";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Prepare SQL statement to prevent SQL injection
$query = $conn->prepare('INSERT INTO department (name, locationID) VALUES (?, ?)');
$query->bind_param("si", $_POST['name'], $_POST['locationID']);

// Execute the query
if (!$query->execute()) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "execution failed";
    $output['status']['description'] = "Query execution failed: " . $query->error;
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Get the last inserted id
$lastInsertedId = $conn->insert_id;

// Return success response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "Department added successfully";
$output['data']['id'] = $lastInsertedId;
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";


mysqli_close($conn);
echo json_encode($output);
?>