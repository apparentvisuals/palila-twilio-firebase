# Palila [Firebase functions]
## Purpose
A simple Twilio client implementation to implement a mobile soft phone with the abilty to handle voice and message. The project is written in 3 parts:
1. __Firebase client__: handles Twilio callbacks by returning valid TwiML for incoming and outgoing voice calls and messages received.
2. __Heroku NodeJS app__: Single endpoint responsible for sending messages and storing sent messages in Firebase. While this is not required and messages could be sent directly from mobile via Rest API, it does allow the Twilio keys to be hidden from sight.
3. __Mobile client__: Allow receiving and making voice calls, listing messages stored in firebase and send outgoing messages.


## Setup

The instructions assumes you have installed firebase-tools via ```npm i -g firebase-tools```. Authenticated to firebase via ```firebase login```.
1. Clone this repository and ```cd palila-twilio-firebase```
2. run ```firebase init functions``` to initialized the firebase project but do no overwrite the contents
3. Set the following config variables

```
{
  "twilio": {
    "pushcredentialsid": "CR***", // Twilio VoIP push credentials
    "apikeysecret": "***", // Twilio API Secret
    "authtoken": "***", // Twilio Auth Token
    "apikey": "SK***", // Twilio API Key
    "number": "+1##########", // Twilio phone number
    "accountsid": "AC***", // Twilio Account SID
    "appsid": "AP***" // Twilio App ID
  }
}
```
4. Deploy the functions in the firebase folder to your firebase account.
5. From the Twilio Console, create a TwiML app from either "Programmable Voice -> Tools -> TwiML Apps" or "Programmable SMS -> Tools -> TwiML Apps". 
6. Set the Voice request URL to #{Your_Firebase_Functions_Domain}/voice 
7. Set the Messaging request URL to #{Your_Firebase_Functions_Domain}/message 
8. Make a call to your Twilio number and you should see information in your Functions Log for the call.