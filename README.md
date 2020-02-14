# Room Checker Bot (a Botkit project for Webex Teams)

This project implements a Botkit + Webex Teams adapter bot.
This bot checks the availability of a room and allows you to reserve it.

**Advanced users: check the ["CiscoDevNet Botkit template"](https://github.com/CiscoDevNet/botkit-template) repo branches for a more polished template, as well as the [Redis](https://github.com/CiscoDevNet/botkit-template/tree/redis), [Pluggable](https://github.com/CiscoDevNet/botkit-template/tree/plugin) branches.**

## How to run

Assuming you plan to expose your bot via [ngrok](https://ngrok.com),
you can run this template in a jiffy:

1. Clone this repo:

    ```sh
    git clone https://github.com/SarahCiscoFrance/room-checker-bot.git
    ```

1. Change into the new repo's `template/` directory and install the Node.js dependencies:

    ```sh
    cd template
    npm install
    ```

1. Create a Webex Teams bot account at ['Webex for Developers'](https://developer.webex.com/add-bot.html), and note/save your bot's access token

1. Launch ngrok to expose port 3000 of your local machine to the internet:

    ```sh
    ngrok http 3000
    ```

    Note/save the 'Forwarding' HTTPS (not HTTP) address that ngrok generates

1. Edit the `.env` file and configure the settings and info for your bot.

    >Note: you can also specify any of these settings via environment variables (which will take precedent over any settings configured in the `.env` file)...often preferred in production environments

    To successfully run, you'll need to specify at minimum a PUBLIC_ADDRESS (ngrok HTTPS forwarding URL), and a ACCESS_TOKEN (Webex Teams bot access token.)

    Additional values in the `.env` file (like 'OWNER' and 'CODE') are used to populate the `/ping` URL metadata

1. You're ready to run your bot:

    ```sh
    node bot.js
    ```
