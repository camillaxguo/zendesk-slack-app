const ZendeskClient = require('zendesk-node-api')
const debug = require('debug')('slack-zendesk-slash-command:zendesk')
const config = require('./config');


const zendesk = new ZendeskClient({
  url: config.ZENDESK_URL,
  email: config.ZENDESK_EMAIL,
  token: config.ZENDESK_API_TOKEN
})

const lookupZendeskUserId = (userEmail) => {
  return new Promise((resolve, reject) => {
    zendesk.search.list(`query=type:user email:${userEmail}`).then((result) => {
      debug('Zendesk user ID: %o', result[0].id)
      resolve(result[0].id)
    }).catch((err) => { reject(err) })
  })
}

const createZendeskTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    zendesk.tickets.create({
      subject: ticket.subject,
      comment: {
        body: ticket.description
      },  
      priority: ticket.priority,
      type: ticket.type,
      created_at: ticket.created_at,
      requester_id: ticket.zendeskUserId,
      custom_fields: [
        {
          id: 81020448, value: ticket.plan
        },
        {
          id: 360007171633, value: ticket.orgID
        }
      ]
    }).then((result) => {
      debug('Created Zendesk Ticket: %o', result.ticket)
      resolve(result.ticket.id)
    }).catch((err) => { reject(err) })
  })
}

module.exports = { lookupZendeskUserId, createZendeskTicket }
