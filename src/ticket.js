const axios = require('axios')
const debug = require('debug')('slack-zendesk-slash-command:ticket')
const qs = require('querystring')
const users = require('./users')
const zendesk = require('./zendesk')
const config = require('./config');


/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: config.SLACK_ACCESS_TOKEN,
    channel: ticket.userId,
    text: 'Support ticket created!',
    attachments: JSON.stringify([
      { 
        title: ticket.zendeskTicketId,
        title_link: ticket.zendeskTicketUrl,
        text: ticket.text,
        fields: [
          {
            title: 'Submitter',
            value: ticket.userEmail + ' for Org ' + ticket.orgID
          },
          {
            title: 'Subject',
            value: ticket.subject
          },
          {
            title: 'Description',
            value: ticket.description
          },
          {
            title: 'Status',
            value: 'Open',
            short: true
          },
          {
            title: 'Priority',
            value: ticket.priority,
            short: true
          },
          {
            title: 'Plan',
            value: ticket.plan,
            short: true
          },
          {
            title: 'Date',
            value: ticket.created_at,
          }
        ]
      }
    ])
  })).then((result) => {
    debug('sendConfirmation: %o', result.data)
    conosle.log('Confirmation of Ticket Sent')
  }).catch((err) => {
    debug('sendConfirmation error: %o', err)
    debug(err)
  })
}

/*
 * Update ticket with Slack and Zendesk details (like user), and submit.
 */
const submit = async (userId, ticket) => {
  try {
    const myTicket = { ...ticket, userEmail: await users.lookupSlackUserEmail(userId) }
    myTicket.zendeskUserId = await zendesk.lookupZendeskUserId(myTicket.userEmail)
    const zendeskTicketId = await zendesk.createZendeskTicket(myTicket)
    myTicket.zendeskTicketId = `Zendesk Ticket #${zendeskTicketId}`
    myTicket.zendeskTicketUrl = `https://driftt.zendesk.com/agent/tickets/${zendeskTicketId}`
    sendConfirmation(myTicket)
  } catch (err) {
    debug('Error: %o', err)
  }
}


/*
 * Construct initial ticket from submission
 */
const create = (userId, submission) => {
  const ticket = {}
  ticket.userId = userId
  ticket.subject = submission.subject
  ticket.description = submission.description
  ticket.priority = submission.priority
  ticket.plan = submission.plan
  ticket.type = "task"
  ticket.orgID = submission.orgID
  submit(userId, ticket)
} 

/*
"Plan": [{"id": 81020448, "Free": "hd_3000"}]
"Standard": [{"id": 81020448, "Free": "hd_3000"}]
"Pro": [{"id": 81020448, "Free": "hd_3000"}]
"Company": [{"id": 81020448, "Free": "hd_3000"}]
"Enterprise": [{"id": 81020448, "Free": "hd_3000"}]
*/
module.exports = { create, sendConfirmation }
