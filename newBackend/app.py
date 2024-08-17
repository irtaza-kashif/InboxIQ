from flask import Flask
import emailAI 
import emailDataRetriever
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Welcome to MailFlow API!'

if __name__ == '__main__':
    app.run(debug=True)
emails = emailDataRetriever.retrieveUncheckedEmailContents()
email_data = emailDataRetriever.parseEmailData(emails)
processed_emails = emailAI.process_emails(emails["id"],email_data)
summary = emailAI.summarize_emails(processed_emails)
categories = emailAI.categorize_emails(processed_emails)

print(email_data)
print(processed_emails)
print(summary)
print(categories)
