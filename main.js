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
    return revenueCount; //Calling trunc() to remove cents
}

function calculateExpenses(inputData) {
    let expensesCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "expense") {
            expensesCount += account.total_value;
        }
    });
    return expensesCount;
}

function calculateGrossProfitMargin(inputData, revenue) {
    let valueCount = 0;
    inputData.forEach(account => {
        if (account.account_type === "sales" && account.value_type === 'debit') {
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

function calculateNetProfitMargin(inputData, totalRevenue, totalExpenses) {
    let netProfit = totalRevenue - totalExpenses;
    return (netProfit / totalRevenue) * 100; // Will clean up in a moment
}

function calculateWorkingCapitalRatio(inputData) {
    let calculatedAssets = calculateAssets(inputData);
    let calculatedLiabilities = calculateLiabilities(inputData);
    if (calculatedAssets === 0 || calculatedLiabilities === 0) {
        console.log ("Calculated Assets is ", calculatedAssets, " and calculated liabilities is ", calculatedLiabilities);
        console.error ("Can not calculate Working Capital Rato!"); // Throw and error and return 0, otherwise in the event of diving by 0 we could return NaN - which is not ideal
        return 0;
    }
    return (calculatedAssets / calculatedLiabilities) * 100;
}

function calculateAssets(inputData) {
    console.log ("CALCULATING ASSETS");
    let assetCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "assets" && (account.account_type === 'current' || account.account_type === 'bank' || account.account_type === 'current_accounts_receivable')) {
            if (account.value_type === 'debit'){
            console.log(account.account_name, " is adding ", account.total_value );
            assetCount += account.total_value;
            }
            else if (account.value_type === 'credit'){ 
                console.log(account.account_name, " is subtracting ", account.total_value);
                assetCount -= account.total_value;
            }
            else {
                console.error ("Account is not credit or debit!");
            }
        }
    });
    console.log (assetCount);
    return assetCount;
}
function calculateLiabilities(inputData) {
    console.log ("CALCULATING LIABILITIES");
    let liabilityCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "liability" && (account.account_type === 'current' || account.account_type === 'current_accounts_payable')) {
            if (account.value_type === 'credit'){
            console.log(account.account_name, " is adding ", account.total_value );
            liabilityCount += account.total_value;
            }
            else if (account.value_type === 'debit') {
                console.log(account.account_name, " is subtracting ", account.total_value);
                liabilityCount -= account.total_value;
            }
            else {
                console.error ("Account is not credit or debit!");
            }
        }
    });
    console.log (liabilityCount);
    return liabilityCount;
}

function calculateTotal(inputData) {
    let totalRevenue = (calculateRevenue(inputData));
    console.log("Revenue: $", Math.trunc(totalRevenue));
    let totalExpenses = (Math.trunc(calculateExpenses(inputData)));
    console.log("Expenses: $", totalExpenses);
    let totalGPM = calculateGrossProfitMargin(inputData, totalRevenue);
    console.log ("Gross Profit Margin: %", totalGPM);
    let totalNetProfitMargin = calculateNetProfitMargin(inputData, totalRevenue, totalExpenses);
    console.log ("Net Profit Margin: %", totalNetProfitMargin)
    let totalWorkingCapitalRatio = calculateWorkingCapitalRatio(inputData);
    console.log (totalWorkingCapitalRatio);
}

// Read the file, then run through calculations
readLocalJson(accountFilePath, (accountData) => {
    calculateTotal(accountData);
});
