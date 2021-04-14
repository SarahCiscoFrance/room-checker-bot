# Room-Checker-Bot 🤖 
(This project implements a Botkit + Webex Teams adapter bot).

## What is it ?
This bot checks the availability of a room and allows you to reserve it.
<img src="https://raw.githubusercontent.com/SarahCiscoFrance/room-checker-bot/master/Room-Checker-Visual.png" width="500">

**How ?**

All Webex Room, Board and Desk series devices come with intelligent people counting sensors directly embedded without any additional cost.
So a Webex device in a room can tell us if this room is currently used or not.

In our case the devices send 2 type of data to the Room-Checker-Bot through a macro :
- **Presence** : the presence of a person in the room
- **PeopleCount** : the number of people detected in the room

This data are send by the following marco : https://github.com/SarahCiscoFrance/room-checker-bot/blob/master/room-checker-macro.js

To add a device to the bot just install the macro on this device

## How to run 🔨

1. Clone this repo:

    ```sh
    git clone https://github.com/SarahCiscoFrance/room-checker-bot.git
    ```

1. Change into the new repo's directory and install the Node.js dependencies:

    ```sh
    npm install
    ```

1. Create a Webex Teams bot account at ['Webex for Developers'](https://developer.webex.com/add-bot.html), and note/save your bot's access token

1.  Assuming you plan to expose your bot via [ngrok](https://ngrok.com) launch ngrok to expose port 3000 of your local machine to the internet if not you can skip this step:

    ```sh
    ngrok http 3000
    ```

    Note/save the 'Forwarding' HTTPS (not HTTP) address that ngrok generates

1. Edit the `.env` file and configure the settings and info for your bot.

    >Note: you can also specify any of these settings via environment variables (which will take precedent over any settings configured in the `.env` file)...often preferred in production environments

    To successfully run, you'll need to specify at minimum a PUBLIC_ADDRESS (ngrok HTTPS forwarding URL), and a ACCESS_TOKEN (Webex Teams bot access token.)

    Additional values in the `.env` file (like 'OWNER' and 'CODE') are used to populate the `/ping` URL metadata
    
1. Install mongodb and create a collection of objects that you will call "codecs" (see example below).
    ```sh
    {
        "_id" : ObjectId("5e2809bbbb4e47d8339b0aed"),
        "mac" : "6C:6C:D3:2B:F3:70",
        "name" : "Kandinsky Dual 70",
        "status" : false,"nbPeople" : 5,
        "ip" : "10.1.110.182",
        "publicIp" : "::ffff:10.1.110.182"
    }
    ```
    
1. Install the macro on your Webex device [link to the macro](https://github.com/SarahCiscoFrance/room-checker-bot/blob/master/room-checker-macro.js)

This will allow the bot to receive presence data and have the device in its list 

1. You're ready to run your bot:

    ```sh
    node bot.js
    ```
