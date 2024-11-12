<?php

// remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
  $output['status']['code'] = "300";
  $output['status']['name'] = "failure";
  $output['status']['description'] = "database unavailable";
  $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  echo json_encode($output);
  exit;
}

// Prepare SQL query to update department data
$query = $conn->prepare("
  UPDATE location
  SET name = ?
  WHERE id = ?
");

$query->bind_param(
  "si", 
  $_POST['name'], 
  $_POST['id']
);

$query->execute();

if ($query->affected_rows > 0) {
  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['data'] = [];
} else {
  $output['status']['code'] = "400";
  $output['status']['name'] = "executed";
  $output['status']['description'] = "update failed";
  $output['data'] = [];
}

$query->close();
$conn->close();

$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
echo json_encode($output);

?>
