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

// SQL statement with placeholders to prevent SQL injection
$query = $conn->prepare('INSERT INTO location (name) VALUES (?)');

// Ensure that all the required parameters are set
if (!isset($_REQUEST['name'])) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Missing required parameters";
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$query->bind_param("s", $_REQUEST['name']);


if (!$query->execute()) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "execution failed";
    $output['status']['description'] = "Query execution failed: " . $query->error;
    $output['data'] = [];

    // Close the connection and return the error message
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// If everything is successful, return success response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "Location added successfully";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];


mysqli_close($conn);


echo json_encode($output);
?>
