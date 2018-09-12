const qs = require('querystring')
const axios = require('axios')
const debug = require('debug')('slack-zendesk-slash-command:users')
const config = require('./config');


const find = (slackUserId) => {
  const body = { token: config.SLACK_ACCESS_TOKEN, user: slackUserId }
  const promise = axios.post('https://slack.com/api/users.info', qs.stringify(body))
  return promise
}

const lookupSlackUserEmail = (slackUserId) => {
  return new Promise((resolve, reject) => {
    find(slackUserId).then((result) => {
      debug(`Find user: ${slackUserId}`)
      resolve(result.data.user.profile.email)
    }).catch((err) => { reject(err) })
  })
}

module.exports = { lookupSlackUserEmail }
