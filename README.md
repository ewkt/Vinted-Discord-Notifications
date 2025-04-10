# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and receive notifications for your favorite vinted searches.

It's a feature that is truly missed in the Vinted app, you will never miss a good deal again!

> [!WARNING]
>  Vinted blocks requests to their API when they are too frequent, try not to go over 1 request per second. (Think of this bot as somone refreshing the results page on vinted constantly for you)
> _for example if you have 10 different searches, you should probably configure them to be refreshed every 10 seconds to avoid having issues with vinted_

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
