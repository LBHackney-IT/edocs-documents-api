# Edocs Documents API

## Table of Contents

- [Overview](#Overview)
- [Setup and run locally](#Setup)
- [Usage](#usage)

## Overview
The Edocs Documents API consits of 2 services:
- The `/api` that handles the connection to edocs api, cashes documents into an S3 bucket and redirects to the document address.
- `/authorizer` handles authentication
- The API is deployed as an AWS lambda via [serverless](https://serverless.com/).

## Setup

1. Copy `.env.example` to `.env` and fill in the secrets
2. Run `npm install`
3. Run `npm start` to run the application locally(port 3000)
4. Run `npm test` to run all the tests
5. Run `npm run lint` to run the linter
6. Run `npm run start-with-auth` to run the application with authentication locally

See the [package.json](package.json) for the steps involved in building and running the app.

## Usage

### Request a document:

- Route: `/documents/{id}`
- Method: `GET`



