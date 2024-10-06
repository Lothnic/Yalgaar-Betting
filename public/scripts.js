document.addEventListener("DOMContentLoaded", () => {
    const matchSelect = document.getElementById("match");
    const teamSelect = document.getElementById("team");
    const betForm = document.getElementById("bet-form");
    const betStatus = document.getElementById("bet-status");

    // Add default "Choose Match" option
    const addDefaultOption = (selectElement, text) => {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = text;
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);
    };

    const loadOngoingMatches = () => {
        // Clear previous matches
        matchSelect.innerHTML = '';  
        addDefaultOption(matchSelect, "Choose Match");

        // Fetch ongoing matches from the backend
        fetch('https://your-backend-url.com/ongoing-matches')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched ongoing matches:', data.matches);  // Log the fetched matches
                data.matches.forEach(match => {
                    const option = document.createElement('option');
                    option.value = match.id;
                    option.textContent = `${match.team1} vs ${match.team2} (${match.sport})`;
                    matchSelect.appendChild(option);
                });
            })
            .catch(err => console.error('Error fetching ongoing matches:', err));  // Handle fetch errors
    };

    // Call loadOngoingMatches to load the matches on page load
    loadOngoingMatches();

    // Populate teams when a match is selected
    matchSelect.addEventListener('change', () => {
        const selectedMatch = matchSelect.value;
        teamSelect.innerHTML = ''; // Clear previous options
        addDefaultOption(teamSelect, "Choose Team");

        // Fetch teams and sport for the selected match from backend
        fetch(`/teams/${selectedMatch}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched teams:', data.teams);  // Log fetched teams
                data.teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team;
                    option.textContent = team;
                    teamSelect.appendChild(option);
                });
            })
            .catch(err => console.error('Error fetching teams:', err));  // Handle errors
    });

    // Handle bet submission
    betForm.addEventListener('submit', event => {
        event.preventDefault();
        const matchId = matchSelect.value;
        const team = teamSelect.value;
        const amount = document.getElementById("amount").value;

        // Send bet to backend
        fetch('/bet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                matchId: matchId,
                team: team,
                amount: amount,
            }),
        })
        .then(response => response.json())
        .then(data => {
            betStatus.textContent = data.message;
        })
        .catch(err => console.error('Error placing bet:', err));  // Handle submission errors
    });
});
