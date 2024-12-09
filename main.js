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

function calculateRevenue(inputData) {  //Take accounts as argument, and add up total value of any that are revenue accounts
    let revenueCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "revenue") {
            revenueCount += account.total_value;
        }
    });
    return revenueCount; 
}

function calculateExpenses(inputData) { //As calculateRevenue(), but with expenses
    let expensesCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "expense") {
            expensesCount += account.total_value;
        }
    });
    return expensesCount;
}

function calculateGrossProfitMargin(inputData, totalRevenue) { //Take accounts as argument, and run GPM calculation
    let valueCount = 0;
    inputData.forEach(account => {
        if (account.account_type === "sales" && account.value_type === 'debit') {
            valueCount += account.total_value;
        }
    }
    );
    if (!valueCount) {
        console.error("valueCount in calculateGrossProfitMargin() is", valueCount, " ! Are there no valid accounts?");
        //Error in the event that no accounts in .json compatible with GPM calculation
        return 0;
    }
    return (valueCount/totalRevenue) * 100;
}

function calculateNetProfitMargin(totalRevenue, totalExpenses) { //Calculate net profit, then divide that by totalRevenue to produce a margin percentage
    let netProfit = totalRevenue - totalExpenses;
    if (!netProfit || !totalRevenue) {
        console.error ("netProfit is ", netProfit, " and totalRevenue is ", totalRevenue);
        console.error ("This is bogus! Returning 0!");
        return 0;
    }
    return (netProfit / totalRevenue) * 100; 
}

function calculateWorkingCapitalRatio(inputData) { //Take accounts as argument, and run WCR calculation
    let calculatedAssets = calculateAssets(inputData);
    let calculatedLiabilities = calculateLiabilities(inputData);
    if (!calculatedAssets || !calculatedLiabilities === 0) {
        console.log ("Calculated Assets is ", calculatedAssets, " and calculated liabilities is ", calculatedLiabilities);
        console.error ("Can not calculate Working Capital Rato!"); // Throw and error and return 0, otherwise in the event of diving by 0 we could return NaN - which is not ideal
        return 0;
    }
    return (calculatedAssets / calculatedLiabilities) * 100;
}

function calculateAssets(inputData) {
    let assetCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "assets" && (account.account_type === 'current' || account.account_type === 'bank' || account.account_type === 'current_accounts_receivable')) {
            if (account.value_type === 'debit'){
            assetCount += account.total_value;
            }
            else if (account.value_type === 'credit'){ 
                assetCount -= account.total_value;
            }
            else {
                console.error ("Account is not credit or debit!");
            }
        }
    });
    return assetCount;
}
function calculateLiabilities(inputData) {
    let liabilityCount = 0;
    inputData.forEach(account => {
        if (account.account_category === "liability" && (account.account_type === 'current' || account.account_type === 'current_accounts_payable')) {
            if (account.value_type === 'credit'){
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
    return liabilityCount;
}

function calculateTotal(inputData) {
    let totalRevenue = (calculateRevenue(inputData));
    console.log("Revenue: $", Math.trunc(totalRevenue).toLocaleString('en-AU'));
    let totalExpenses = (Math.trunc(calculateExpenses(inputData)));
    console.log("Expenses: $", totalExpenses.toLocaleString('en-AU'));
    let totalGPM = calculateGrossProfitMargin(inputData, totalRevenue);
    console.log ("Gross Profit Margin: %", (Math.round(totalGPM * 10) /10).toLocaleString('en-AU'));
    let totalNetProfitMargin = calculateNetProfitMargin(totalRevenue, totalExpenses);  
    console.log ("Net Profit Margin: %", (Math.round(totalNetProfitMargin*10) /10).toLocaleString('en-AU'));
    let totalWorkingCapitalRatio = calculateWorkingCapitalRatio(inputData);
    console.log ("Working Capital Ratio: %", (Math.round(totalWorkingCapitalRatio * 10) /10).toLocaleString('en-AU'));
}

// Read the file, then run through calculations
readLocalJson(accountFilePath, (accountData) => {
    calculateTotal(accountData);
});

















// ===== Unit Tests =====

//testCalculateRevenue();
//testCalculateExpenses();                      //Uncomment these to begin tests
//testCalculateGrossProfitMargin();             // Please note: errors will get thrown during testing, this is normal!
//testCalculateNetProfitMargin();

function testCalculateRevenue() {
    const inputData = [
        { account_category: 'revenue', total_value: 1000 },
        { account_category: 'expense', total_value: 500 },
        { account_category: 'revenue', total_value: 1234 },
        { account_category: NaN, total_value: 2000 },
        { account_category: 'Julius Caesar', total_value: 2000 }
    ];

    const result = calculateRevenue(inputData);
    console.log('Expected: 2234, Result:', result);
    console.assert(result === 2234, 'Test failed: Revenue calculation is incorrect');
    
    // Test case when there are no revenue accounts in the .json
    const inputDataEmptyRevenue = [
        { account_category: 'expense', total_value: 500 },
        { account_category: 'liability', total_value: 1000 }
    ];
    
    const resultEmptyRevenue = calculateRevenue(inputDataEmptyRevenue);
    console.log('Expected: 0, Result:', resultEmptyRevenue);
    console.assert(resultEmptyRevenue === 0, 'Test failed: Revenue calculation with no revenue accounts is incorrect');
}

function testCalculateExpenses() {
    const inputData = [
        { account_category: 'revenue', total_value: 1000 },
        { account_category: 'expense', total_value: 500 },
        { account_category: 'revenue', total_value: 1234 },
        { account_category: 'expense', total_value: 1234 },
        { account_category: 'Joan of Arc', total_value: 1234 },
        { account_category: NaN, total_value: 2000 }
    ];

    const result = calculateExpenses(inputData);
    console.log('Expected: 1734, Result:', result);
    console.assert(result === 1734, 'Test failed: Expense calculation is incorrect');
    
    // Test case when there are no expense accounts in the .json
    const inputDataEmptyRevenue = [
        { account_category: 'expense', total_value: 500 },
        { account_category: 'liability', total_value: 1000 }
    ];
    
    const resultEmptyRevenue = calculateRevenue(inputDataEmptyRevenue);
    console.log('Expected: 0, Result:', resultEmptyRevenue);
    console.assert(resultEmptyRevenue === 0, 'Test failed: Revenue calculation with no revenue accounts is incorrect');
}

function testCalculateGrossProfitMargin() {
    const inputData = [
        { account_type: 'sales', value_type: 'debit', total_value: 3000 },
        { account_category: 'revenue', total_value: 5000 }
    ];

    const revenue = 5000; 
    const result = calculateGrossProfitMargin(inputData, revenue);
    console.log('Expected: 60, Result:', result);
    console.assert(result === 60, 'Test failed: Gross Profit Margin calculation is incorrect');
    
    // Test case when no "sales" accounts are found
    const inputDataNoSales = [
        { account_category: 'expense', total_value: 1000 },
        { account_category: 'revenue', total_value: 5000 },
        { account_category: 'Napoleon', total_value: 1000 },
        { account_category: 'Belisarius', total_value: 5000 }
    ];

    const resultNoSales = calculateGrossProfitMargin(inputDataNoSales, revenue);
    console.log('Expected: 0, Result:', resultNoSales);
    console.assert(resultNoSales === 0, 'Test failed: Gross Profit Margin calculation when no sales is incorrect');
}

function testCalculateNetProfitMargin() {
    const revenue = 8000;
    const expenses = 4000;

    const result = calculateNetProfitMargin(revenue, expenses);
    console.log('Expected: 50, Result:', result);
    console.assert(result === 50, 'Test failed: Net Profit Margin calculation is incorrect');
    
    // Test case when revenue is 0, should return 0 (and throw an error in the console)
    const resultZeroRevenue = calculateNetProfitMargin(0, expenses);
    console.log('Expected: 0, Result:', resultZeroRevenue);
    console.assert(resultZeroRevenue === 0, 'Test failed: Net Profit Margin calculation with no revenue is incorrect');
}

