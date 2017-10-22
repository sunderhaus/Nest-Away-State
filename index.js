'use strict';

/**
 * This is a sample Lambda function that sends an Email on click of a
 * button. It creates a SNS topic, subscribes an endpoint (EMAIL)
 * to the topic and publishes to the topic.
 *
 * Follow these steps to complete the configuration of your function:
 *
 * 1. Update the email environment variable with your email address.
 * 2. Enter a name for your execution role in the "Role name" field.
 *    Your function's execution role needs specific permissions for SNS operations
 *    to send an email. We have pre-selected the "AWS IoT Button permissions"
 *    policy template that will automatically add these permissions.
 */

const ACCESS_TOKEN = process.env.access_token;
const https = require('https');
const url = require('url');
const structure_id = process.env.structure_id;

/**
 * The following JSON template shows what is sent as the payload:
{
    "serialNumber": "GXXXXXXXXXXXXXXXXX",
    "batteryVoltage": "xxmV",
    "clickType": "SINGLE" | "DOUBLE" | "LONG"
}
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */
function setNestAwayState (event, context, callback) => {
    console.log('Received event:', event.clickType);

    const body = {'away': event.clickType === 'SINGLE' ? 'away' : 'home'};
    const jsonBody = JSON.stringify(body);

    const options = {
      method: 'PUT',
      hostname: `developer-api.nest.com`,
      port: 443,
      path: `/structures/${structure_id}`,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode == 307 && res.headers.location) {
        makeRedirectedRequest(url.parse(res.headers.location), body);
      } else {
        console.log('no redirect occurred');
      }
    });

    req.on('error', (e) => {
      console.error(e);
    });

    req.write(jsonBody);
    req.end();

};

function makeRedirectedRequest(location, body) {
  const jsonBody = JSON.stringify(body);
  const options = {
    method: 'PUT',
    protocol: location.protocol,
    hostname: location.hostname,
    port: location.port,
    path: location.path,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  console.log(`Redirected! Making second request to new location: ${location.protocol}//${options.hostname}:${options.port}${options.path}`);

  const req = https.request(options, (res) => {
    if(res.statusCode >= 400) {
      res.on('data', (chunk) => {
        console.error('BODY: ' + chunk);
      });
    }

    res.on('error', (e) => {
      console.error(e);
    });

    console.log(`Away state was set to: ${body.away}`);
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(jsonBody);
  req.end();
}

exports.handler = setNestAwayState;
// setNestAwayState({'clickType': "SINGLE"}, null, null);
// setNestAwayState({'clickType': "DOUBLE"}, null, null);
