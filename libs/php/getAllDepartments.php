<?php

	// Remove the next two lines for production	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	// Include database config file
	include("config.php");

	// Set response header
	header('Content-Type: application/json; charset=UTF-8');

	// Create a new database connection
	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	// Check if there's a connection error
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

	// Query to retrieve all departments
	$query = $query = '
	SELECT d.name AS department, d.id as departmentID, l.name AS location
	FROM department d
	LEFT JOIN location l ON l.id = d.locationID
	ORDER BY d.name, l.name';;
	$result = $conn->query($query);

	// Check if the query failed
	if (!$result) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);
		echo json_encode($output); 
		exit;
	}

	// Fetch all data as an associative array
	$data = $result->fetch_all(MYSQLI_ASSOC);

	// Prepare success output
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
	
	// Close the database connection
	mysqli_close($conn);

	// Output the JSON-encoded result
	echo json_encode($output); 

?>
