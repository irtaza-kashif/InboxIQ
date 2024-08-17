# IMPORTS
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import base64
import html
import string
import re
# Gathering credentials and tokens, authorizing email and API access
def authenticate():
    creds = None
    # Note: file path for token.json and credentials.json subject to change, not sure how to standardize a path for this yet
    # Feel free to change it to whatever works for you when you're running this file and recommit it to the Git Repo, I won't mind
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file(r'C:\Users\natha\PycharmProjects\InboxIQ\token.json', ['https://www.googleapis.com/auth/gmail.readonly'])
    else:
        flow = InstalledAppFlow.from_client_secrets_file(r'C:\Users\natha\PycharmProjects\InboxIQ\credentials.json', ['https://www.googleapis.com/auth/gmail.readonly'])
        creds = flow.run

    with open('token.json', 'w') as token:
        token.write(creds.to_json())

    global service
    service = build('gmail', 'v1', credentials=creds)

# Gathers all new emails not yet checked by InboxIQ and returns them in a list of dictionaries where each dictionary contains the un=parsed data of one email
def retrieveUncheckedEmailContents():
    results = service.users().messages().list(maxResults=500, q="has:nouserlabels", userId="me").execute()
    unreadEmails = results.get('messages', [])
    ids = retrieveEmailIds(unreadEmails)
    return retrieveEmailContents(ids)
# Given a list of email IDs, will return un-parsed message data for all of them in a list of dictionaries
def retrieveEmailContents(ids):
    messages = []
    for id in ids:
        messages.append(service.users().messages().get(userId='me', id=id).execute())
    return messages
# Given a list of dictionaries containing email IDs and other data, will return a list of just the email IDs
def retrieveEmailIds(unreadEmails):
    ids = []
    for email in unreadEmails:
        ids.append(email["id"])
    return ids
# Parses email data and stores each email in its own dictionary with key-value pairs for the sender, reciever, subject line, message body, etc.
# Returns a dictionary containing key-value pairs of emailID:dictionary of email data for the corresponding email
def parseEmailData(emails):
    # Create outer dictionary that will be returned
    parsedEmailData = {}
    # Iterate over each email
    for email in emails:
        # Create temporary dictionary to hold data for the current email
        tempEmailDict = {}
        emailPayload = email["payload"]
        # Retrieve all header data for the current email
        dictKeys = emailPayload["headers"]
        # Search for desired header data in list of all header data from the current email
        for key in dictKeys:
            if key["name"] == 'From':
                # Note: the .get() command allows us to specify a default value to use in the case that the key we're looking for (in this case "value") does not exist
                # This negates the need for try catch statements as a KeyError exception is impossible (i hope)
                tempEmailDict["msgSender"] = key.get("value", "No Sender Specified")
            if key["name"]  == 'To':
                tempEmailDict["msgReciever"] = key.get("value", "No Reciever Specified")
            if key["name"] == 'Subject':
                tempEmailDict["msgSubject"] = key.get("value", "No Subject Specified")
                # Subject line and message body struggle the most with returning blank strings and failing to label them as "No Subject Specified" or "No Email Body"
                # This fixes that annoying issue
                if tempEmailDict["msgSubject"] == "":
                        tempEmailDict["msgSubject"] = "No Subject Specified"
            if key["name"] == 'Date':
                tempEmailDict["msgDate"] = key.get("value", "No Date Specified")
        
        # Setting default value for the "msgBody" key in the case that we can't find a message body in the email data
        tempEmailDict.setdefault("msgBody", "No Email Body")
        # Emails with attachments vs without attachments require us to go down different paths to retrieve the message body data
        # If email has no attachment...
        if "attachmentId" not in emailPayload["parts"][1]["body"]:
            if "data" in emailPayload["parts"][0]["body"]:
                tempEmailDict["msgBody"] = str(base64.urlsafe_b64decode(emailPayload["parts"][0]["body"]["data"]+"==").decode('utf-8'))
                tempEmailDict["msgBody"] = tempEmailDict["msgBody"].replace("\r", "").replace("\n", "")
        # If email has yes attachment...
        else:
            if "data" in emailPayload["parts"][0]["parts"][0]["body"]:
                tempEmailDict["msgBody"] = str(base64.urlsafe_b64decode(emailPayload["parts"][0]["parts"][0]["body"]["data"] + "==").decode('utf-8'))
                tempEmailDict["msgBody"] = tempEmailDict["msgBody"].replace("\r", "").replace("\n", "")
        # Same thing as the msgSubject conditional, Gmail API fails to label a blank space as "No Email Body" so we step in and fix that
        if tempEmailDict["msgBody"] == "":
            tempEmailDict["msgBody"] = "No Email Body"
        # Add our newly constructed dictioanry of data for the current email into the outer dictioanry with the key being the email ID
        parsedEmailData[str(email["id"])] = tempEmailDict
    return parsedEmailData

#                                    \/ This is the index of the email in the list of emails returned by retrieceUncheckedEmailContents()
# HOW TO ACCESS ATTACAHMENTS: emails[0]["payload"]["parts"][1]["body"]["attachmentId"]
authenticate()
