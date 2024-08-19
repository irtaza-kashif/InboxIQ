const express = require('express');
const emailAI = require('./emailAI');
const emailDataRetriever = require('./emailDataRetriever');

const app = express();

app.get('/', (req, res) => {
    res.send('Welcome to MailFlow API!');
});

if (require.main === module) {
    // Start the server and fetch email data, process it, summarize it, and categorize it.
    // Replace 'retrieveUncheckedEmailContents', 'parseEmailData', 'processEmails', 'summarizeEmails', and 'categorizeEmails' with the actual functions used to fetch, parse, process, summarize, and categorize email data.

    
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });

    const emails = emailDataRetriever.retrieveUncheckedEmailContents();
    const emailData = emailDataRetriever.parseEmailData(emails);
    const processedEmails = emailAI.processEmails(emails.id, emailData);
    const summary = emailAI.summarizeEmails(processedEmails);
    const categories = emailAI.categorizeEmails(processedEmails);

    console.log(emailData);
    console.log(processedEmails);
    console.log(summary);
    console.log(categories);
}
