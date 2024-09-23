# Application with SSO login along with Mobile OTP Login integrated with Notion Database and Webpages



## Prerequisites

Node.js version 10+

## Node.js Project Setup

1. Install the dependencies.
    ```bash
    npm install
    ```

## Configure your environment

2. Grab your API Key and Client ID from your WorkOS Dashboard. Create a `.env`
   file at the project root, and store them like so:

    ```bash
    WORKOS_API_KEY=sk_xxxxxxxxxxxxx
    WORKOS_CLIENT_ID=project_xxxxxxxxxxxx
    ```

## SSO Setup with WorkOS

1. Follow the [SSO authentication flow instructions](https://workos.com/docs/sso/guide/introduction) to create a new SSO connection in your WorkOS dashboard.

2. Add `http://localhost:8000/callback` as a Redirect URI in the Configuration section of the Dashboard.

## Testing the Integration

3. Start the server and head to http://localhost:8000/ to begin the login flow:

```sh
npm start
```