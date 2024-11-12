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

// Modify the query to include employee count for the department
$query = $conn->prepare('
    SELECT department.id, department.name, department.locationID, COUNT(personnel.id) AS employeeCount 
    FROM department 
    LEFT JOIN personnel ON personnel.departmentID = department.id 
    WHERE department.id = ?
    GROUP BY department.id
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

// Fetch department data and store it in the array
while ($row = $result->fetch_assoc()) {
    array_push($data, $row);
}

// Close the department query
$query->close();

// Second query: fetch location data
$locationQuery = $conn->prepare('SELECT id, name FROM location');
$locationQuery->execute();

// Check if the location query executed successfully
if (!$locationQuery) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Location query failed";
    $output['data'] = [];
    echo json_encode($output);
    $locationQuery->close();
    mysqli_close($conn);
    exit;
}

$locationResult = $locationQuery->get_result();
$locations = [];

// Fetch location data and store it in the array
while ($locationRow = $locationResult->fetch_assoc()) {
    array_push($locations, $locationRow);
}

// Close the location query
$locationQuery->close();

// Prepare the final output with both department and location data
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['department'] = $data;  // Add department data with employeeCount
$output['data']['locations'] = $locations;  // Add location data


echo json_encode($output);

mysqli_close($conn);

?>
