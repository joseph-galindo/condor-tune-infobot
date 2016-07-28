/*
 *  Made by Ethan Lee (@ethanlee16) and Kushal Tirumala (@kushaltirumala)
 *  Licensed under the MIT License.
 */

/* Change this to your Slack bot's OAuth token,
* found in the Integrations tab */

var Discord = require("discord.js");
var ON_DEATH = require('death');
var credentials = require('./app_credentials.json');

var discord_bot = new Discord.Client();

var condor_user_id = credentials.bot_user_id;

console.log("Logging into Discord...");

discord_bot.loginWithToken(credentials.bot_token).then(dostuff);

var mentionResponse = "for help on how to use me, try `.infobot help`."
var multipleTermResponse = "More than one command or word was given to the me. Please only use one word, such as `.infobot help` or `.infobot zoom`.";
var invalidTermResponse = "Sorry, I don't understand that command. For a list of commands I understand, try `.infobot help`.";

var responses = {
    "zoom": `\`\`\`
How to change your resolution:

1. Right click Crypt of the NecroDancer in Steam
2. Click "Properties"
3. Click "Set Launch Options"
4. Enter the resolution in this format: "960 540" (without quotes). If you want to play at 1440x810, for example, the box would simply read:
1440 810

CoNDOR zoom/resolution is as follows:
1920x1080 resolution at 4x view multipler. OR
1440x810 resolution at 3x viewmultipler. OR
960x540 resolution at 2x view multipler.

TUNE zoom/resolution is as follows:
1280x720 resolution at 2x view multipler.\`\`\``,

    "resolution": `\`\`\`
How to change your resolution:

1. Right click Crypt of the NecroDancer in Steam
2. Click "Properties"
3. Click "Set Launch Options"
4. Enter the resolution in this format: "960 540" (without quotes). If you want to play at 1440x810, for example, the box would simply read:
1440 810

CoNDOR zoom/resolution is as follows:
1920x1080 resolution at 4x view multipler. OR
1440x810 resolution at 3x viewmultipler. OR
960x540 resolution at 2x view multipler.

TUNE zoom/resolution is as follows:
1280x720 resolution at 2x view multipler.\`\`\``,

    "rules": `\`\`\`
Rules megapost goes here.\`\`\``,

    "conduit": `\`\`\`
Conduit info goes here.\`\`\``,

    "condor": `\`\`\`
CoNDOR info goes here.\`\`\``,

    "tune": `\`\`\`
Tune info goes here.\`\`\``,

    "necrobot": `\`\`\`
Necrobot info goes here.\`\`\``,

    "signups": `\`\`\`
To signup for Conduit or CoNDOR, you can use this form: http:/\/\signup.condorleague.tv/. 
If you need further help with this form, reach out to anyone on CoNDOR Staff by mentioning them through the @CoNDOR Staff role.

To signup for TUNE, reach out to Jackofgames#9720, or post in the #TUNE channel.\`\`\``,

    "events": `\`\`\`
Info on scheduled events goes here.\`\`\``,

    "next": `\`\`\`
Info on the next event goes here.\`\`\``,

    "help": `\`\`\`
Welcome to v0.1 of the condor-tune-infobot.

To use this bot, simply start a message with .infobot, followed by a command.

Currently supported commands are:

.infobot conduit - General info about Conduit
.infobot condor - General info about CoNDOR
.infobot tune - General info about TUNE

.infobot signups - Detailed info on how to signup to Conduit, CoNDOR, and TUNE
.infobot rules - Detailed info on the rules for Conduit, CoNDOR, and TUNE
.infobot zoom - Zoom rules for Conduit/CoNDOR and TUNE
.infobot resolution - Zoom rules for Conduit/CoNDOR and TUNE (alias of .infobot zoom)

.infobot necrobot - Information about the racing bot "necrobot" and its server

.infobot events - Information about scheduled and upcoming Necrodancer events
.infobot next - Information about the next scheduled Necrodancer event

.infobot help - You are reading it!

Contact:
DM or mention mudjoe2#2845 on Discord, or log an issue on: 
https:/\/\github.com/joseph-galindo/condor-tune-infobot.
\`\`\``

};

function dostuff(login_results) {

    // console.log(login_results);
    console.log("Done logging in successfully!");
}

discord_bot.on("ready", function() {

    console.log("Ready, waiting for messages...");

    discord_bot.on("message", function(message){

        var msg = message.content.trim();
        var isQuery = msg.indexOf(".infobot ") === 0;
        var isMention = msg.indexOf("<@208049027156017152>") === 0;

        // response = getResponse(message.content);

        if(isQuery) {

            msg = msg.substring(8).trim().toLowerCase();
            console.log(msg);

            //if space character exists, they used >= 2 keywords, deny them and instruct them on how to structure queries
            if(msg.indexOf(" ") >= 0) {
                discord_bot.sendMessage(message.channel, multipleTermResponse, {}, function(error,msg) {
                });
            } else {

                if(responses.hasOwnProperty(msg)) {
                    //one keyword, and valid command!!!
                    discord_bot.sendMessage(message.channel, responses[msg], {}, function(error,msg) {
                    });
                } else {
                    //one keyword, but not a valid command
                    discord_bot.sendMessage(message.channel, invalidTermResponse, {}, function(error,msg) {
                    });
                }
            }
        }

        if(isMention) {
            discord_bot.reply(message,mentionResponse,{}, function(err,msg){
            });
        }

    });
});

//on command-line exit, log the bot out

ON_DEATH(function(signal,err) {
    console.log('exit');
    discord_bot.logout(function(res) {
        // console.log(res);
    });
});