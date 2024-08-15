from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import base64
import html
import string

import re
creds = None
if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json', ['https://www.googleapis.com/auth/gmail.readonly'])
else:
    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', ['https://www.googleapis.com/auth/gmail.readonly'])
    creds = flow.run_local_server(port=0)

with open('token.json', 'w') as token:
    token.write(creds.to_json())

service = build('gmail', 'v1', credentials=creds)

def retrieve_unchecked_emails():
    results = service.users().messages().list(maxResults=500, userId='cleverinboxinc@gmail.com').execute()
    unread_emails = results.get('messages', [])
    retrieved_emails = []
    for email in unread_emails:
        retrieved_emails.append(retrieve_message(email["id"]))
    return retrieved_emails
def retrieve_message(id):
    message = service.users().messages().get(userId='cleverinboxinc@gmail.com', id=id).execute()
    return message
# HOW TO ACCESS ATTACAHMENTS: print(emails[0]["parts"][1]["body"]["attachmentId"])    
emails = retrieve_unchecked_emails()
for email in emails:
    email_payload = email["payload"]
    email_headers = email_payload["headers"]
    msg_sender = "No Sender Specified"
    msg_reciever = "No Reciever Specified"
    msg_date = "No Date Specified"
    msg_subject = "No Subject Specified"
    for header in email_headers:
        if header["name"] == 'From':
            try:
                msg_sender = header['value']
            except KeyError:
                msg_sender = "No Sender Specified"
        if header["name"]  == 'To':
            try:
                msg_reciever = header['value']
            except KeyError:
                msg_reciever = "No Reciever Specified"
        if header["name"] == 'Subject':
            try:
                msg_subject = header['value']
            except KeyError:
                msg_subject = "No Subject Specified"
        if header["name"] == 'Date':
            try:
                msg_date = header['value']
            except KeyError:
                msg_date = "No Date Specified"
    
    # Pulls the body of the email, either as plain text or as an attachment. If it's an attachment, it decodes the base64 data and prints it.
    if "attachmentId" not in email_payload["parts"][1]["body"]:
        if "data" in email_payload["parts"][0]["body"]:
            msg_body = str(base64.urlsafe_b64decode(email_payload["parts"][0]["body"]["data"]+"==").decode('utf-8')).replace(r"\r", "").replace(r"\n", "\n")
        else:
            email_payload["parts"][0]["body"].setdefault("data", base64.urlsafe_b64encode(bytes("No Email Body", "utf-8")))
            msg_body = base64.urlsafe_b64decode(email_payload["parts"][0]["body"]["data"] + b"==").decode('utf-8')
    
    else:
        if "data" in email_payload["parts"][0]["parts"][0]["body"]:
            msg_body = str(base64.urlsafe_b64decode(email_payload["parts"][0]["parts"][0]["body"]["data"] + "==").decode('utf-8')).replace(r"\r", "").replace(r"\n", "\n")
        else:
            email_payload["parts"][0]["parts"][0]["body"].setdefault("data", base64.urlsafe_b64encode(bytes("No Email Body", "utf-8")))
            msg_body =base64.urlsafe_b64decode(email_payload["parts"][0]["parts"][0]["body"]["data"] + b"==").decode('utf-8')
    
    print(f"From: {msg_sender}")   
    print(f"To: {msg_reciever}")
    print(f"Date: {msg_date}")
    print(f"Subject: {msg_subject}")
    print(f"Body: {msg_body}\n")
    print("\n\n\n")
