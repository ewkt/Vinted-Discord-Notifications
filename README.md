# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and receive notifications for your favorite vinted searches.

It's a feature that is truly missed in the Vinted app, you will never miss a good deal again!

> [!WARNING]
>  VInted uses Cloudflare to protect its API from scraping. a single IP is only allowed a limited number of calls before being blocked for 24h. If you want to have this bot running 24/7 you should consider adding rotating proxies.

## Set-up Autobuy

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
