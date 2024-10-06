const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let matches = [];

// Function to load matches from CSV file and filter ongoing matches
const loadMatchesFromCSV = () => {
    return new Promise((resolve, reject) => {
        const newMatches = [];
        fs.createReadStream('matches.csv')
            .pipe(csv())
            .on('data', (row) => {
                console.log('Processing row:', row);  // Log each row being processed
                newMatches.push(row); // Push each row to the newMatches array
            })
            .on('end', () => {
                matches = newMatches; // Only replace matches after the file is fully read
                console.log('CSV file successfully processed. Loaded matches:', matches);
                resolve(matches);
            })
            .on('error', (err) => {
                console.error('Error reading CSV file:', err);
                reject(err);
            });
    });
};

// Filter ongoing matches
const getOngoingMatches = () => {
    return matches.filter(match => match.status === 'Upcoming');
};

// Load matches when the server starts
loadMatchesFromCSV();

// Route to fetch all ongoing matches
app.get('/ongoing-matches', async (req, res) => {
    try {
        await loadMatchesFromCSV();  // Reload CSV before serving
        const ongoingMatches = getOngoingMatches();
        console.log('Serving ongoing matches:', ongoingMatches);
        res.json({ matches: ongoingMatches });
    } catch (error) {
        res.status(500).json({ message: 'Error loading matches' });
    }
});

// Route to fetch teams for a specific match based on the match ID
app.get('/teams/:id', (req, res) => {
    const matchId = req.params.id;
    const match = matches.find(m => m.id === matchId);
    if (match) {
        res.json({ teams: [match.team1, match.team2], sport: match.sport });
    } else {
        res.status(404).send('Match not found');
    }
});

// Manual reload endpoint for CSV (optional)
app.get('/reload-matches', (req, res) => {
    loadMatchesFromCSV()
        .then(() => res.json({ message: 'Matches reloaded successfully' }))
        .catch(err => res.status(500).json({ message: 'Failed to reload matches' }));
});

// Route to handle bet submission
app.post('/bet', (req, res) => {
    const { matchId, team, amount } = req.body;
    const match = matches.find(m => m.id === matchId);
    if (match) {
        res.json({ message: `Bet of ${amount} placed on ${team} for match ${matchId} (${match.sport})!` });
    } else {
        res.status(404).send('Match not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
