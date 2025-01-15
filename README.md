# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and recieve notifications for your favorite vinted searches.

It's a feature that is truly missed in the vinted app, you will never miss a good deal again!

> __WARNING Vinted blocks requests to their API when they are too frequent, try not to go over 1 request per second. (Think of this bot as somone refreshing the results page on vinted constantly for you)__

(for eaxmple if you have 10 different searches, you should probably configre them to be refreshed every 10 seconds to avoid having issues with vinted)

Functionalities:
----------
- Ability to have as many searches as you wish in as little or as many discord channels as wanted (it's possible to have multiple searches in a single channel)
- Each search has its own schedule! you just have to configure how frequently it needs to be refreshed
- Ability to block certain words from the title of your search results, to make your searches even more precise!
- Checkout the 'autobuy' branch for to setup the experimental autobuy feature.


Prerequisites:
----------

- Need to be able to run JS code, preferably on a machine that is up 24/7 ( I use npm and node on a small raspberry pi, other options could be renting a VPS, or using services like Heroku)
- Have a discord server you can invite the bot on


Step 0: Download the code (git clone or download as zip)
-------

Step 1: Create and invite the bot to your server
-------

- Go to the [Discord Developer Portal](https://discord.com/developers/applications).
- Click on "New Application" and give your bot a name.
- Go to the "Bot" tab and click on "Add Bot".
- Copy the "Token" to put in the configuration file in the next steps.
- Give intent permissions to the bot by going to the "Bot" tab and enabling the "Presence Intent", "Server Members Intent" and "Content Message Intent".
- Invite the bot with admin permissions to your server by going to the "OAuth2" tab and selecting the "bot" and "application.commands" scope and the "Administrator" permission.
- Copy the generated URL and paste it into your browser to invite the bot to your server. (credits:@teddy-vltn for the tutorial)

Step 2: Install dependencies
-------
```
cd /path/to/the/project
npm i
```

Step 3: configure the bot
-------

a) Fill in `.env` unsing the following template :
```
{
  BOT_TOKEN=xxxx
  INTERVAL_TIME=1
  API_URL=https://www.vinted.fr/api/v2/
}
```
BOT_TOKEN: this is the token from when you created your bot on the discord developer portal.

INTERVAL_TIME: this is how long (in hours) the bot waits between two refreshes of the cookie (it is recommended to keep the same cookie for 2h max)

API_URL: this is the root for the api calls the bot makes (you can change .fr to your prefered country)

b) In the channel you want to see notifications in, use the Slash command /new_search name: url: (frequency:) (banned_keywords:) to set up the channels you want to monitor once the bot is launched. These new searches will be written to the configuration and the changes will be applied on the next restart of the bot.
  - name: is the name of your channel (used to delete it if needed)
  - url: is the vinted url you want to monitor (eg: https://www.vinted.pl/catalog?search_text=bananas&order=newest_first&page=1&per_page=10) /!\ make sure the url you use is the one of the country you are living in otherwise you might get notified for items that cannot be shipped to you!!
  - frequency: (optional) change this if you want to refresh for new items more often (in seconds)
  - banned_keywords: (optional) add a list of words you want to exclude from the titles of the items you are searching for

OR, alternatively, you can configure your channels mannually in `channels.json`:
  - channelId: is the id of the discord channel that you want to get the search results on.
(https://discord.com/channels/123456789000000000/--->123456789012345678<---)
  - channelName: is a way of identifying which searches are producing results in the app logs
  - url: is the url of the vinted search you want to have notifications for, just copy and paste it from vinted in your browser!
  - frequency: this is how fast you want the search to look for new items, in seconds (remember to not exceed 1 request per second)
  - titleBlacklist: is a list of words that you want to exclude from your search results (filters out items that have at least one of the words in their title) 

```
[
  {
    "channelId": "123456789012345678",
    "channelName": "test1",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=53",
    "frequency": 60,
    "titleBlacklist": ["nike","puma"]
  },
  {
    "channelId": "123456789012345622",
    "channelName": "test2",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=50",
    "frequency": 10
  },
  {
....
  }
]
```

Step 4: launch
-------
```
node main.js
```


Don't hesitate to contact me on discord (@thewwk) or open an issue here if you have any concerns or requests!
