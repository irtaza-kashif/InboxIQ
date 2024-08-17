import spacy

nlp = spacy.load('en_core_web_sm')

def process_emails(email_Ids,email_data):
    processed_emails = []
    emailAI_Stuff = {}
    for email_id in email_Ids:
        doc = nlp(email['emailIds']['msgBody'])
        emailAI_Stuff['entities'] = [(ent.text, ent.label_) for ent in doc.ents]
        processed_emails.append(emailAI_Stuff)
    return processed_emails
def summarize_emails(processed_emails):
    summary = []
    for email in processed_emails:
        summary.append({
            'subject': email['subject'],
            'date': email['date'],
            'entities': email['entities']
        })
    return summary
def categorize_emails(processed_emails):
    categories = {
        'events': [],
        'deadlines': [],
        'todos': [],
        'spam': []
    }
    for email in processed_emails:
        if any(ent[1] == 'DATE' for ent in email['entities']):
            categories['events'].append(email)
        elif 'deadline' in email['body'].lower():
            categories['deadlines'].append(email)
        elif 'to do' in email['body'].lower():
            categories['todos'].append(email)
        else:
            categories['spam'].append(email)
    return categories

