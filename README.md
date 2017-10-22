# NestAwayStateAWSIot

A simple AWS IoT button app for manually toggling the Away state of your Home.

Pre-requisites:
* Nest Product created via https://console.developers.nest.com/products
* You have obtained an OAuth access token with the Nest API
* You know the structure_id of your home you'd like to control the Away state for

This project simply contains the script for the AWS Lambda function handler. While
you can run the project locally, you must invoke the handler function yourself and
provide the access_token and structure_id via environment variables. The running
script expects them to be available via the Node process's env object.
