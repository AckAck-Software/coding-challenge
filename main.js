const fs = require('fs');
const accountFilePath = './data/data.json'; // Path to the accounts file

// Read the accounts .json and save it as accountData
function readLocalJson(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the accounts file:', err);
            return;
        }

        try {
            const parsedJson = JSON.parse(data);
            callback(parsedJson.data); // Return the data via callback, else the file won't be read in time
        } catch (parseError) {
            console.error('Error parsing accountData JSON:', parseError);
        }
    });
}

// ===== Calculation Functions =====

function calculateRevenue(inputData) {
    let revenueTotal = 0;
    inputData.forEach(account => {
        if (account.account_category === "revenue") {
            revenueTotal += account.total_value;
        }
    });
    console.log(revenueTotal);
}

function calculateExpenses(inputData) {
    // TODO: Calculate Expenses
}

function calculateGrossProfitMargin(inputData) {
    // TODO: Calculate Gross Profit
}

function calculateNetProfitMargin(inputData) {
    // TODO: Calculate Net Profit
}

function calculateWorkingCapitalRatio(inputData) {
    // TODO: Calculate WCR
}

function calculateTotal(inputData) {
    calculateRevenue(inputData);
    calculateExpenses(inputData);
    calculateGrossProfitMargin(inputData);
    calculateNetProfitMargin(inputData);
    calculateWorkingCapitalRatio(inputData);
}

// Read the file, then run through calculations
readLocalJson(accountFilePath, (accountData) => {
    calculateTotal(accountData); 
});
