# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and recieve notifications for your favorite vinted searches.
It's a feature that is truly missed in the vinted app, you will never miss a good deal again!
And with a few more set-up steps, you will even be able to use the 'autobuy' button to buy a listing straight from the discord app!

**WARNING Vinted blocks requests when they are too frequent, try not to go over 1 request per second</font>**
(for eaxmple if you have 10 different searches, you should probably configre them to be refreshed every 10 seconds to avoid having issues with vinted)

Functionalities:
----------
- Ability to have as many searches as you wish in as little or as many discord channels as wanted (it's possible to have multiple searches in a single channel)
- Each search has its own schedule! you just have to configure how frequently it needs to be refreshed
- Ability to block certain words from the title of your search results, to make your searches even more precise!


Prerequisites:
----------

- Need to be able to run JS code, preferably on a machine that is up 24/7 ( I use npm and node on a small raspberry pi, other options could be renting a VPS, or using services like Heroku)
- Have a discord server you can invite the bot on


Step 1: Download the bot (git clone or download as zip)
-------

Step 2: Install dependencies
-------
```
cd /path/to/the/project
npm i
```

Step 3: configure the bot
-------

a) Fill in `config.json` :
```
{
  "token": "xxxxxxxx"
  "INTERVAL_TIME": "3600000",
  "latitude":"",
  "longitude":""
}
```
token: this is the token from when you created your bot on the discord developer portal.
INTERVAL_TIME: this is how long the bot waits between two refreshes of the cookie (it is recommended to keep the same cookie for 2h max)
latitude & longitude: configure these if you want to use the autobuy functionality, set them to your position so that your pickup point gets chosen automatically.

b) Choose your searches in `channels.json`:
  - channelId: is the id of the discord channel that you want to get the search results on.
(https://discord.com/channels/123456789000000000/--->123456789012345678<---)
  - channelName: is a way of identifying which searches are producing results in the app logs
  - url: is the url of the vinted search you want to have notifications for, just copy and paste it from vinted in your browser!
  - frequency: this is how fast you want the search to look for new items, in milliseconds (remember to not exceed 1 request per second)
  - filterWords: is a list of words that you want to exclude from the title of your items 

```
[
  {
    "channelId": "123456789012345678",
    "channelName": "test1",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=53",
    "frequency": 60000,
    "filterWords": ["nike","puma"]
  },
  {
    "channelId": "123456789012345622",
    "channelName": "test2",
    "url": "https://www.vinted.fr/catalog?brand_ids[]=50",
    "frequency": 100000
  },
  {
....
  }
]
```

c) If you want to use autobuy you will also need to add your session tokens to `tokens.json` :
```
{
  "access_token": "xxxxxxxx",
  "refresh_token": "xxxxxxx"
}
```


Step 4: launch
-------
```
node main.js
```


Don't hesitate to contact me on discord (@thewwk) or open an issue here if you have any concerns or requests!
