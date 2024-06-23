// ==UserScript==
// @name         Football Bet Summary
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Daniel Dorman 
// @description  Display a summary of football bets at the top of the page
// @match        https://www.superbru.com/euros_predictor/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract and aggregate bets from the table
    function extractAndAggregateBets() {
    const bettingStats = new Set();
    const rows = document.querySelectorAll('.wenger-results-panel.active tr');


    rows.forEach(function(row) {
        var team1 = row.querySelector('.td-pick .team:first-child .team-code');
        var team2 = row.querySelector('.td-pick .team:last-child .team-code');
        var score1 = row.querySelector('.td-pick .score .pts:first-child');
        var score2 = row.querySelector('.td-pick .score .pts:last-child');

        if (team1 && team2 && score1 && score2) {
            var homeTeamName = team1.textContent.trim();
            var awayTeamName = team2.textContent.trim();
            var betScore = `${score1.textContent.trim()} - ${score2.textContent.trim()}`;
            if (bettingStats[betScore]) {
                bettingStats[betScore].count++;
            } else {
                bettingStats[betScore] = {
                    count: 1,
                    homeTeam: homeTeamName,
                    awayTeam: awayTeamName
                };
            }
        }
    });

    return bettingStats;
    }

    // Function to create the statistics table
    function createStatisticsTable(bettingStats) {
    const table = document.createElement('table');
    table.style.width = '100%'; // Ensure table takes full width
    table.style.textAlign = 'center'; // Center align all text in table
    table.style.fontSize = '18px'; // Increase font size for table content

    const headerRow = table.insertRow();

    const firstEntry = Object.values(bettingStats)[0];
    const homeTeamName = firstEntry.homeTeam;
    const awayTeamName = firstEntry.awayTeam;

    // Function to create bold header cells
    function createBoldHeaderCell(textContent) {
        const cell = headerRow.insertCell();
        cell.style.padding = '10px';
        cell.style.border = '1px solid #ddd';
        cell.style.fontWeight = 'bold'; // Make header text bold
        cell.textContent = textContent;
        return cell;
    }

    // Create table headers
    const headerScore = createBoldHeaderCell(`Score (${homeTeamName} - ${awayTeamName})`);
    const headerBets = createBoldHeaderCell('Bets');
    const headerPercentage = createBoldHeaderCell('Percentage');

    const totalBets = Object.values(bettingStats).reduce((a, b) => a + b.count, 0);

    // Sort the entries based on the count value in descending order
    const sortedBettingStats = Object.entries(bettingStats).sort((a, b) => b[1].count - a[1].count);

    // Function to create a table cell with centered text
    function createTableCell(textContent) {
        const cell = document.createElement('td');
        cell.style.padding = '10px';
        cell.style.border = '1px solid #ddd';
        cell.style.textAlign = 'center'; // Center align cell content
        cell.textContent = textContent;
        return cell;
    }

    for (const [score, { count, homeTeam, awayTeam }] of sortedBettingStats) {
        const [homeScore, awayScore] = score.split(' - ');
        const row = table.insertRow();

        row.appendChild(createTableCell(`${homeScore} - ${awayScore}`));
        row.appendChild(createTableCell(count));
        row.appendChild(createTableCell(`${((count / totalBets) * 100).toFixed(2)}%`));
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0px';
    container.style.right = '10px'; // Change left to right
    container.style.transform = 'none'; // Remove the translation
    container.style.padding = '10px';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #000';
    container.style.zIndex = '1000';
    container.style.maxWidth = '90%';
    container.style.overflowX = 'auto';

    const heading = document.createElement('h2');
    heading.style.margin = '0px 0px 10px';
    heading.textContent = 'Betting Statistics v1.0';

    container.appendChild(heading);
    container.appendChild(table);

    document.body.appendChild(container);
}

    // Observer to detect changes in the DOM
    var observer = new MutationObserver(function(mutations) {
        var bettingStats = extractAndAggregateBets();

        if (Object.keys(bettingStats).length > 0) {
            // Create the statistics table
            createStatisticsTable(bettingStats);

            // Stop observing once the bets have been found and displayed
            observer.disconnect();
        }
    });

    // Configuration of the observer
    var config = {
        childList: true,
        subtree: true
    };

    // Start observing the body for changes
    observer.observe(document.body, config);
})();
