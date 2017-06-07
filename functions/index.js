const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
const twilio = require('twilio');
const debug = require('debug')('twilio:webhook');

const ACCOUNT_SID = 'AC***';
const API_KEY = 'SK***';
const API_KEY_SECRET = '***';
const PUSH_CREDENTIAL_SID = 'CR***';
const APP_SID = 'AP***';
const AUTH_TOKEN = '***';

const MY_NUMBER = '+1#########';
const IDENTITY = 'voice_test';
const CALLER_ID = 'quick_start';

admin.initializeApp(functions.config().firebase);

exports.accessToken = functions.https.onRequest((req, res) => {
	if (req.method === 'GET') {
		const config = functions.config();
		const accountSid = config.twilio.accountsid || ACCOUNT_SID;
		const apiKey = config.twilio.apikey || API_KEY;
		const apiKeySecret = config.twilio.apikeysecret || API_KEY_SECRET;
		const pushCredentialSid =
			config.twilio.pushcredentialsid || PUSH_CREDENTIAL_SID;
		const appSid = config.twilio.appsid || APP_SID;

		console.log(accountSid);
		console.log(pushCredentialSid);

		const AccessToken = twilio.jwt.AccessToken;
		const VoiceGrant = AccessToken.VoiceGrant;

		let voiceGrant = new VoiceGrant({
			outgoingApplicationSid: appSid,
			pushCredentialSid: pushCredentialSid,
		});

		let accessToken = new AccessToken(accountSid, apiKey, apiKeySecret, {
			identity: IDENTITY,
		});

		accessToken.addGrant(voiceGrant);
		res.send(accessToken.toJwt());
	} else {
		res.status(405).end();
	}
});

exports.voice = functions.https.onRequest((req, res) => {
	if (req.method === 'GET') {
		console.log('GET /voice');
		handleVoice(req.query, res);
	} else if (req.method === 'POST') {
		console.log('POST /voice');
		handleVoice(req.body, res);
	} else {
		res.status(405).end();
	}
});

function handleVoice(data, res) {
	const myNumber = config.twilio.number || MY_NUMBER;

	const direction = data['Direction'] || data['direction'];
	const to = data['To'] || data['to'];
	const from = data['From'] || data['from'];
	const status = data['CallStatus'] || data['callStatus'];

	console.log('Direction: ' + direction);
	console.log('From: ' + from);
	console.log('To: ' + to);
	console.log('Status: ' + status);

	const VoiceResponse = twilio.twiml.VoiceResponse;

	let response = new VoiceResponse();
	switch (direction) {
		case 'inbound': {
			response
				.dial({
					callerId: from,
				})
				.client(IDENTITY);
			response.reject();
		}
		case 'outbound-dial': {
			response
				.dial({
					callerId: myNumber,
				})
				.number(to);
		}
	}

	console.log(response.toString());
	res.send(response.toString());
}

exports.message = functions.https.onRequest((req, res) => {
	if (req.method === 'GET') {
		handleMessage(req.query, res);
	} else if (req.method === 'POST') {
		handleMessage(req.body, res);
	} else {
		res.status(405).end();
	}
});

function handleMessage(data, res) {
	const to = data['To'] || data['to'];
	const from = data['From'] || data['from'];
	const body = data['Body'] || data['body'];
	const messageSid = data['MessageSid'] || data['messageSid'];

	debug('From: ' + from);
	debug('To: ' + to);
	debug('Body: ' + body);

	if (from && to && body) {
		admin
			.database()
			.ref('/' + to + '/' + from + '/messages/' + messageSid) // Always self first
			.set({
				direction: 'from',
				body,
				when: new Date().toISOString(),
			})
			.then(snapshot => {
				// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
				const MessagingResponse = twilio.twiml.MessagingResponse;

				let response = new MessagingResponse();
				res.send(response.toString());
			});
	} else {
		res.status(400).end();
	}
}

exports.messageStatus = functions.https.onRequest((req, res) => {
	if (req.method === 'GET') {
		debug('GET /messageStatus');
		handleMessageStatus(req.query, res);
	} else if (req.method === 'POST') {
		debug('POST /messageStatus');
		handleMessageStatus(req.body, res);
	} else {
		res.status(405).end();
	}
});

function handleMessageStatus(data, res) {
	console.log(data);

	const messageSid = data['MessageSid'] || data['messageSid'];
	const status = data['Status'] || data['status'];

	debug('Sid: ' + messageSid);
	debug('Status: ' + status);

	if (messageSid && status) {
		admin
			.database()
			.ref('/' + from + '/' + to + '/messages/' + messageId)
			.set({
				status,
				when: new Date().toISOString(),
			})
			.then(snapshot => {
				res.status(201).end();
			});
	} else {
		res.status(400).end();
	}
}
