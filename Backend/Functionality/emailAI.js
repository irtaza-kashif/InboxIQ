const nlp = require('compromise');

function processEmails(emailIds, emailData) {
    let processedEmails = [];
    emailIds.forEach(emailId => {
        let emailAIStuff = {};
        let doc = nlp(emailData[emailId].msgBody);
        emailAIStuff.entities = doc.topics().out('array').map(ent => [ent.text, ent.tags[0]]);
        processedEmails.push(emailAIStuff);
    });
    return processedEmails;
}

function summarizeEmails(processedEmails) {
    let summary = [];
    processedEmails.forEach(email => {
        summary.push({
            subject: email.subject,
            date: email.date,
            entities: email.entities
        });
    });
    return summary;
}

function categorizeEmails(processedEmails) {
    let categories = {
        events: [],
        deadlines: [],
        todos: [],
        spam: []
    };
    processedEmails.forEach(email => {
        if (email.entities.some(ent => ent[1] === 'Date')) {
            categories.events.push(email);
        } else if (email.body.toLowerCase().includes('deadline')) {
            categories.deadlines.push(email);
        } else if (email.body.toLowerCase().includes('to do')) {
            categories.todos.push(email);
        } else {
            categories.spam.push(email);
        }
    });
    return categories;
}