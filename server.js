const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
