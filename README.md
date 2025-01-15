# Vinted Discord Notifications

This project allows you to host your own bot on your discord server, and recieve notifications for your favorite vinted searches.

It's a feature that is truly missed in the vinted app, you will never miss a good deal again!

And with a few more set-up steps, you will even be able to use the 'autobuy' button to buy a listing straight from the discord app! (feature is currently under development, dont hesitate to reach out)


> __WARNING Vinted blocks requests to their API when they are too frequent, try not to go over 1 request per second. (Think of this bot as somone refreshing the results page on vinted constantly for you)__

(for eaxmple if you have 10 different searches, you should probably configre them to be refreshed every 10 seconds to avoid having issues with vinted)

## Set-up Autobuy

If you want to use autobuy you will need to add your session tokens to `autobuy.json`, also for the automatic selection of the pickup point you will need to add your latitude and longitude. Beware this version of the project works punctually but needs more work! It is experimental and under development.
```
{
  "access_token": "xxxxxxxx",
  "refresh_token": "xxxxxxx",
  "latitude":"",
  "longitude":""
}
```
(you need to get them from your browsers network tab by capturing the login, if you need help you can follow [this video tutorial](https://dai.ly/k8WySk1UDMB69UBu31Y))


Don't hesitate to contact me on discord (@thewwk) or open an issue here if you have any concerns or requests!
