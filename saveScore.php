<?php
/*
 * save_record.php - Save Arkanoid Game Record
 * Author: Bocaletto Luca
 *
 * Description:
 * This script retrieves game record data sent via POST requests,
 * adds a current timestamp, appends the record to a JSON file ("records.json"),
 * and returns a JSON response indicating the success of the operation along with the saved record.
 */

// Set the default timezone to Europe/Rome to ensure proper timestamp formatting
date_default_timezone_set('Europe/Rome');

// Set the header to specify that the response content will be in JSON format
header('Content-Type: application/json');

// Define the file where the records are stored
$recordsFile = 'records.json';

// If the records file exists, retrieve its content; otherwise, initialize with an empty JSON array
$data = file_exists($recordsFile) ? file_get_contents($recordsFile) : '[]';

// Decode the JSON data into an associative array
$records = json_decode($data, true);

// Retrieve the player name, score, and level from the POST data, using default values if not provided
$player = isset($_POST['player']) ? $_POST['player'] : 'Anonymous';
$score  = isset($_POST['score'])  ? $_POST['score']  : 0;
$level  = isset($_POST['level'])  ? $_POST['level']  : 1;

// Create an associative array that represents the new game record, including the current date and time
$record = [
  'date'   => date("Y-m-d H:i:s"), // Current date and time in the format YYYY-MM-DD HH:MM:SS
  'player' => $player,
  'score'  => $score,
  'level'  => $level
];

// Append the new record to the records array
$records[] = $record;

// Save the updated records array back to the JSON file with pretty printing for readability
file_put_contents($recordsFile, json_encode($records, JSON_PRETTY_PRINT));

// Output a JSON response indicating success and include the new record
echo json_encode(['status' => 'success', 'record' => $record]);
?>
