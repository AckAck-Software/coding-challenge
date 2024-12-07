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
    let revenueCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "revenue") {
            revenueCount += account.total_value;
        }
    });
    return Math.trunc(revenueCount); //Calling trunc() to remove cents
}

function calculateExpenses(inputData) {
    let expensesCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "expense") {
            expensesCount += account.total_value;
        }
    });
    return Math.trunc(expensesCount);
}

function calculateGrossProfitMargin(inputData, revenue) {
    let valueCount = 0;
    inputData.forEach(account => {
        if (account.account_type === "sales" && account.value_type === 'debit') {
            console.log("wahoo");
            valueCount += account.total_value;
        }

    }
    );
    if (valueCount === 0) {
        console.error("valueCount in calculateGrossProfitMargin() is 0! Are there no valid accounts?");
        //Error in the event that no accounts in .json compatible with GPM calculation
        return;
    }
    return (valueCount/revenue) * 100;
}

function calculateNetProfitMargin(inputData) {
    // TODO: Calculate Net Profit
}

function calculateWorkingCapitalRatio(inputData) {
    // TODO: Calculate WCR
}

function calculateTotal(inputData) {
    let totalRevenue = (calculateRevenue(inputData));
    console.log("Revenue: $", totalRevenue);
    let totalExpenses = (calculateExpenses(inputData));
    console.log("Expenses: $", totalExpenses);
    let totalGPM = calculateGrossProfitMargin(inputData, totalRevenue); //Will do this cleaner, just testing for now
    console.log ("Gross Profit Margin: %", totalGPM);
    calculateNetProfitMargin(inputData);
    calculateWorkingCapitalRatio(inputData);
}

// Read the file, then run through calculations
readLocalJson(accountFilePath, (accountData) => {
    calculateTotal(accountData);
});
