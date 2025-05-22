<?php
/*
 * records.php - Arkanoid Game Records Display
 * Author: Bocaletto Luca
 *
 * Description:
 * This PHP file reads the game records from a JSON file ("records.json"),
 * decodes them into an associative array, and sorts the records in descending order based on the score.
 * It then renders an HTML page that displays the sorted records in a table.
 */

$recordsFile = 'records.json';
$records = [];

// Check if the records file exists and decode its content
if (file_exists($recordsFile)) {
    $data = file_get_contents($recordsFile);
    $records = json_decode($data, true);
}

// Sort the records in descending order based on the score
usort($records, function($a, $b) {
    return intval($b['score']) - intval($a['score']);
});
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <!--
      records.php - Game Records for Arkanoid
      Author: Bocaletto Luca

      Description:
      This HTML page displays the game records for Arkanoid.
      The table shows the date, player, score, and the level reached for each record.
      Records are sorted in descending order by score.
  -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Records - Arkanoid Game</title>
  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container mt-5">
    <!-- Page Heading -->
    <h1 class="text-center">Arkanoid Game Records</h1>
    <!-- Records Table -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Player</th>
          <th>Score</th>
          <th>Level Reached</th>
        </tr>
      </thead>
      <tbody>
        <?php if (!empty($records)): foreach ($records as $record): ?>
          <tr>
            <td><?= htmlspecialchars($record['date']) ?></td>
            <td><?= htmlspecialchars($record['player']) ?></td>
            <td><?= htmlspecialchars($record['score']) ?></td>
            <td><?= htmlspecialchars($record['level']) ?></td>
          </tr>
        <?php endforeach; else: ?>
          <tr>
            <td colspan="4" class="text-center">No saved records</td>
          </tr>
        <?php endif; ?>
      </tbody>
    </table>
    <!-- Back Button to Return to the Previous Page -->
    <div class="text-center">
      <button onclick="window.history.back()" class="btn btn-secondary">Go Back</button>
    </div>
  </div>
</body>
</html>
