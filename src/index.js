// Import modules

const express = require('express');
const request = require('request');
const config = require('./config');

// Instantiates Express and assigns our app variable to it
const app = express();

var PORT = process.env.PORT;

// Lets start our server
app.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Example app listening on port ", PORT);
});

// This route handles GET requests to our root ngrok address and responds with the same "Ngrok is working message" we used before
app.get('/', function(req, res) {
    res.send('Tunnel is working! Path Hit: ' + req.url);

    
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: client_id, client_secret: client_secret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log('Could not GET:', error);
            } else {
                res.json(body);

            }
        })
    }
});

// Route the endpoint that our slash command will point to and send back a simple response to indicate that ngrok is working
app.post('/command', function(req, res) {
    res.send('Your tunnel is up and running!');
});

const axios = require('axios')
// const express = require('express')
const bodyParser = require('body-parser')
const qs = require('querystring')
const ticket = require('./ticket')
const debug = require('debug')('slack-zendesk-slash-command:index')
// const app = express()


/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('It works!')
})

/*
 * Endpoint to receive /support slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/support', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id: triggerId } = req.body
  debug('Body: %o', req.body)
  debug('Text: %o', text)
  debug('Trigger ID: %o', triggerId)
  // check that the verification token matches expected value
  
  if (token === config.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    const dialog = {
      token: config.SLACK_ACCESS_TOKEN,
      trigger_id: triggerId,
      dialog: JSON.stringify({
        title: 'Submit a Drift Frequest',
        callback_id: 'submit-ticket',
        submit_label: 'Submit',
        elements: [
          {
            label: 'The What',
            type: 'text',
            name: 'subject',
            value: text
          },
          {
            label: 'The Why',
            type: 'textarea',
            name: 'description'
          },
          {
            label: 'Org ID',
            type:'text',
            name: 'orgID'
          },
          {
            label: 'Plan',
            type: 'select',
            name: 'plan',
            placeholder: "Choose Plan",
            options: [
              { label: 'Team', value: "team" },
              { label: 'Pro', value: "pro" },
              { label: 'Company', value: "company" },
              { label: 'Enterprise', value: "enterprise" }
            ]
          },
          {
            label: 'Priority',
            type: 'select',
            name: 'priority',
            placeholder: 'Only "Dealbreaker" if it is causing churn.',
            options: [
              { label: 'Nice to have', value: 'normal' },
              { label: 'Dealbreaker', value: 'high' }
            ]
          }
        ]
      })
    }


    // open the dialog by calling dialogs.open method and sending the payload
    debug('Dialog: %o', dialog)
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data)
        res.send('')
      }).catch((err) => {
        debug('dialog.open call failed: %o', err)
        res.sendStatus(500)
      })
  } else {
    debug('Verification token mismatch')
    res.sendStatus(600)
  }
})

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk ticket
 */
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload)

  // check that the verification token matches expected value
  if (body.token === config.SLACK_VERIFICATION_TOKEN) {
    debug('Form submission received: %o', body.submission)
    
    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('')

    // create ticket
    ticket.create(body.user.id, body.submission)
  } else {
    debug('Token mismatch')
    res.sendStatus(500)
  }
})

if (typeof process.env.PORT !== 'undefined') {
  port = config.PORT
}