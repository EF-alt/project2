<?php
	// Remove next two lines for production
	ini_set('display_errors', 'On'); 
	error_reporting(E_ALL); 

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	// Check for connection errors
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

	$query = '
		SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.id as departmentID, d.name as department, l.id as locationID, l.name as location 
		FROM personnel p 
		LEFT JOIN department d ON d.id = p.departmentID 
		LEFT JOIN location l ON l.id = d.locationID 
		ORDER BY p.lastName, p.firstName, d.name, l.name';

	$result = $conn->query($query);


	if (!$result) {
		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";
		$output['data'] = [];

		mysqli_close($conn);
		echo json_encode($output);
		exit;
	}

	// Fetch all results as an associative array
	$data = $result->fetch_all(MYSQLI_ASSOC);

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;

	mysqli_close($conn);

	echo json_encode($output);
?>
