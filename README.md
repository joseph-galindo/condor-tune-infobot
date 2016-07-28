# trump-discordbot

![](http://i.imgur.com/g6M5Em2.png)
Discord conversations getting a little dull? Spice it up by adding Donald Trump to your #general channel. This should be fun.

##Setup
To use Donald Trump with your Discord, visit [Discord's official API documentation](https://discordapp.com/developers/docs/topics/oauth2#bot-vs-user-accounts) for more information on how bots should be created. Once your application and bot account is created, you will need the token of the bot, and the user ID of the bot. Both of these can be accessed on your application's page within the Discord Developer's section, under the 'APP BOT USER' section.

Like any user, you can give it a profile picture, and we recommend [this one](http://www.liberationnews.org/wp-content/uploads/2015/07/donaldtrump61815.jpg), but that doesn't really matter. 

Next, clone this project or [download it as a ZIP](https://github.com/joseph-galindo/trump-slackbot/archive/master.zip) and open up `app.js`.

EDIT: 4/30/2016 - With the change from the unofficial API to the official API, this bot now uses just the bot's token, and the bot's user ID. They are called in early on within the code, from an external json file called `app_credentials.json`. Your json should be configured like so:

```{
	"bot_token": "your_bot's_token_goes_here",
	"bot_user_id": "your_bot's_user_id_goes_here"
}```

The last things to change are `all_channels` and `allowed_text_channels`.

`all_channels` simply stores all the channels that you may want the bot to write in at some point, as a simple object to have them ready whenever you want. In the code here, I am using the channel IDs as the values in the key-value pairs. However, the value in those pairs does *not* have to be a channel ID, but rather, a [Channel Resolvable](http://discordjs.readthedocs.org/en/latest/docs_resolvables.html). If you opt for channel IDs, those can easily be gotten through Discord in the web browser, through the URL when you are in a text channel. For example, with the URL `https://discordapp.com/channels/157365454392786945/158006552421335040`, the server ID is `157365454392786945` while the text channel ID is `158006552421335040`. Alternatively, you can run `discord_bot.channels` onready in `app.js` to get a list of channel information through the discord.js.

`allowed_text_channels` is simply a subset of `all_channels` that limits what channels the bot will actually listen and respond to.

Finally, run `npm install` and `npm start` in the project and you've added Trump!

##License
The MIT License (MIT)

Copyright (c) 2015, Ethan Lee and Kushal Tirumala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
