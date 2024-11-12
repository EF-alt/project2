<?php

// Remove the next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include "config.php";

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check for connection error
if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}


$query = $conn->prepare('
    SELECT location.id, location.name, COUNT(personnel.id) AS employeeCount 
    FROM location 
    LEFT JOIN department ON department.locationID = location.id
    LEFT JOIN personnel ON personnel.departmentID = department.id
    WHERE location.id = ?
    GROUP BY location.id
');
$query->bind_param("i", $_POST['id']);
$query->execute();

// Check if query executed successfully
if (!$query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Query failed";
    $output['data'] = [];
    echo json_encode($output);
    $query->close();
    mysqli_close($conn);
    exit;
}

$result = $query->get_result();
$data = [];

// Fetch location data and store it in the array
while ($row = $result->fetch_assoc()) {
    array_push($data, $row);
}

// Close the location query
$query->close();

// Prepare the final output with location data
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['locations'] = $data;  // Add location data

// Send the JSON response
echo json_encode($output);

// Close the database connection
mysqli_close($conn);

?>