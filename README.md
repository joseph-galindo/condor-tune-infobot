# condor-tune-infobot

![](http://i.imgur.com/eRyuLGc.png)
A simple bot for reciting meta-info about Necrodancer racing events.

##Setup
To use condor-tune-infobot with your Discord, visit [Discord's official API documentation](https://discordapp.com/developers/docs/topics/oauth2#bot-vs-user-accounts) for more information on how bots should be created. Once your application and bot account is created, you will need the token of the bot, and the user ID of the bot. Both of these can be accessed on your application's page within the Discord Developer's section, under the 'APP BOT USER' section.

Next, clone this project or [download it as a ZIP](https://github.com/joseph-galindo/condor-tune-infobot/archive/master.zip) and open up `app_credentials.json`.

With the change from the unofficial Discord API to the official API, this bot now uses just the bot's token and user ID. They are called in early on within the code, from an external json file called `app_credentials.json`. Your json should be configured like so:

```{
	"bot_token": "your_bot's_token_goes_here",
	"bot_user_id": "your_bot's_user_id_goes_here"
}```

Finally, run `npm install`.

From this point, you can run `npm start` to run the bot.

Currently working on an alternate way of running the bot (for long periods of time) using this:  
`npm install forever -g`  
`forever start app.js`  

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
