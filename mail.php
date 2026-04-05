<?php
http_response_code(410);
header('Content-Type: application/json');

echo json_encode([
    'error' => 'This endpoint is deprecated. Use /api/contact instead.'
]);
