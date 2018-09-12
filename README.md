# Slack Slash Command for Zendesk

Use a slash command and a dialog to create a ticket in Zendesk. Once it has been created, send a message to the user with information about their ticket.

Based on [template provided by Slack](https://github.com/slackapi/template-slash-command-and-dialogs) with some enhancements, and specific Zendesk API integrations.

## Slack Setup

### Create a Slack app

1. Create an app at api.slack.com/apps
1. Navigate to the "OAuth & Permissions" page and add the following scopes:
    * `commands`
    * `users:read`
    * `users:read:email`
    * `chat:write:bot`
1. Click 'Save Changes' and install the app

### Add a Slash Command

1. Go back to the app settings and click on "Slash Commands".
1. Click the "Create New Command" button and fill in the following:
    * Command: `/support`
    * Request URL: Your application URL + `/support`
    * Short description: `Create a ZenDesk ticket`
    * Usage hint: `[the problem you're having]`
1. Save and reinstall the app

### Enable Interactive Components

1. Go back to the app settings and click on "Interactive Components".
1. Set the Request URL: Your application URL + `/interactive-component`

## Running the app

1. Get the code
    * Either clone this repo and run `yarn install`
1. Set the following environment variables in `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxp-` token (available on the "Install App" page; need to at least install the app for a single workspace)
    * `PORT`: The port that you want to run the web server on
    * `SLACK_VERIFICATION_TOKEN`: Your app's verification token (available on the "Basic Information" page)
    * `ZENDESK_URL`: URL of your Zendesk installation.
    * `ZENDESK_EMAIL`:  E-mail address of user for authentication to Zendesk.
    * `ZENDESK_API_TOKEN`:  API tocken for user authentication to Zendesk.
    * `ZENDESK_GUIDE_URL`: URL of your Zendesk guide (for linking end-users to submitted tickets).
1. Run `yarn start`

Generally, the app will need to be hosted somewhere publicly accessible, such as on Heroku.
