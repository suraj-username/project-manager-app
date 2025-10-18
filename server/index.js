const express = require('express');

const app = express();

const PORT = 3000;

// Define a basic route for the root URL ('/') for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server and make it listen for connections on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
