# Uptime-Monitoring-API

Uptime-Monitoring-API is a RESTful API built with **Raw Node.js**. It allows users to monitor the uptime and status of URLs, and sends SMS alerts if a site goes down or comes back online. This project uses no frameworks, only pure Node.js.

## Features
- User registration and login system with token-based authentication
- Set up checks for website uptime monitoring (HTTP/HTTPS)
- Receive SMS alerts via Twilio when a URL changes status (up or down)
- Custom settings for request methods, timeouts, and success codes
- Local JSON-based storage for user data and checks

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/Uptime-Monitoring-API.git
    ```
2. Navigate to the project directory:
    ```bash
    cd Uptime-Monitoring-API
    ```
3. Install the required dependencies:
    ```bash
    npm install
    ```

## Usage
1. Start the server using nodemon:
    ```bash
    nodemon index
    ```
2. Use an API client like [Thunder Client](https://www.thunderclient.com/) to interact with the API.

## API Endpoints
- **User Management**: `/user`  
    - Create, update, delete user data.
- **Token Handling**: `/token`  
    - Authenticate and manage tokens.
- **Check Management**: `/check`  
    - Create and manage URL checks.

## SMS Alerts
The system uses the Twilio API to send SMS alerts when the status of a monitored URL changes (e.g., from "up" to "down").


