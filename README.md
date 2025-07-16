# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and receive notifications for your favorite vinted searches.

It's a feature that is truly missed in the Vinted app, you will never miss a good deal again!

> [!WARNING]
> Vinted uses Cloudflare to protect its API from scraping. A single IP is only allowed a limited number of calls before being blocked for 24h. If you want to have this bot running 24/7 you should consider adding rotating proxies.

Functionalities:
----------------

- Ability to have as many searches as you wish in as little or as many discord channels as wanted (it's possible to have multiple searches in a single channel)
- Each search has its own schedule! you just have to configure how frequently it needs to be refreshed
- Ability to block certain words from the title of your search results, to make your searches even more precise!
- Checkout the 'autobuy' branch for to setup the autobuy feature.

Prerequisites:
--------------

- Need to be able to run JS code, preferably on a machine that is up 24/7 ( I use npm and node on a small raspberry pi, other options could be renting a VPS, or using services like Heroku)
- Have a discord server you can invite the bot on

Step 0: Download the code (git clone or download as zip)
--------------------------------------------------------

Step 1: Create and invite the bot to your server
------------------------------------------------

- Go to the [Discord Developer Portal](https://discord.com/developers/applications).
- Click on "New Application" and give your bot a name.
- Go to the "Bot" tab and click on "Add Bot".
- Copy the "Token" to put in the configuration file in the next steps.
- Give intent permissions to the bot by going to the "Bot" tab and enabling the "Presence Intent", "Server Members Intent" and "Content Message Intent".
- Invite the bot with admin permissions to your server by going to the "OAuth2" tab and selecting the "bot" and "application.commands" scope and the "Administrator" permission.
- Copy the generated URL and paste it into your browser to invite the bot to your server. (credits:@teddy-vltn for the tutorial)

Step 2: Install dependencies
----------------------------

If you want to use autobuy you will need to clone this branch, then add your session tokens to `autobuy.json`. You will also need to add your home address latitude and longitude for the automatic selection of the pickup point. Google your User Agent and paste it in the config too.

```
{
  "user_agent": "Mozilla....",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "latitude":1.1313,
  "longitude":1.1313
}
```

You need to get the tokens from your browser storage, AFTER having logged-in with the account you want to use for your purchases

Don't hesitate to contact me on discord (@thewwk) or open an issue here if you have any concerns or requests!

Step 3: Configure the bot
-------------------------

This project uses configuration files for tokens, cookies, and search channels. Template files are provided.

1. **Set up your environment variables:** Create a copy of `.env.example` and rename it to `.env`. Open the new `.env` file and add your Discord Bot Token.

   ```bash
   # For Linux/macOS
   cp .env.example .env

   # For Windows
   copy .env.example .env
   ```
2. **Set up your Vinted cookies:** Create a copy of `config/cookies.example.json` and rename it to `config/cookies.json`. Open the new file and add your Vinted `access` and `refresh` tokens.

   ```bash
   # For Linux/macOS
   cp config/cookies.example.json config/cookies.json

   # For Windows
   copy config/cookies.example.json config/cookies.json
   ```
3. **Set up your search channels:** Create a copy of `config/channels.example.json` and rename it to `config/channels.json`. Open the new file and add your search URLs and channel IDs.

   ```bash
   # For Linux/macOS
   cp config/channels.example.json config/channels.json

   # For Windows
   copy config/channels.example.json config/channels.json
   ```
