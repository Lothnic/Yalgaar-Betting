const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Load matches from CSV
let matches = [];

const loadMatchesFromCSV = () => {
    matches = []; // Clear existing matches
    fs.createReadStream('matches.csv')
        .pipe(csv())
        .on('data', (row) => {
            matches.push(row); // Push each row to the matches array
        })
        .on('end', () => {
            console.log('CSV file successfully processed. Loaded matches:', matches);
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
        });
};

// Endpoint to get ongoing matches
app.get('/ongoing-matches', (req, res) => {
    loadMatchesFromCSV();
    res.json({ matches });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
