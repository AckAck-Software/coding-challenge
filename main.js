const fs = require('fs');
var accountData;
const filePath = './data/data.json'; // Path to the accounts file


// Read the accounts .json and 
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the accounts file:', err);
        return;
    }

    try {
        const parsedJson = JSON.parse(data);
        accountData = parsedJson.data; //Clean up the array so that accountData is only an array of objects

    } catch (parseError) {
        console.error('Error parsing accountData JSON:', parseError);
    }
     
    accountData.forEach(element => {
        console.log(element); // Test to see if parse is successful
    });

});
