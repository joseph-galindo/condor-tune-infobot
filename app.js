/*
 *  Made by Ethan Lee (@ethanlee16) and Kushal Tirumala (@kushaltirumala)
 *  Licensed under the MIT License.
 */

/* Change this to your Slack bot's OAuth token,
* found in the Integrations tab */

var Discord = require("discord.js");
var ON_DEATH = require('death');
var credentials = require('./app_credentials.json');

//load response data
var response_data = require('./responses.json');

var mentionResponse = response_data.mentionResponse;
var multipleTermResponse = response_data.multipleTermResponse;
var invalidTermResponse = response_data.invalidTermResponse;
var responses = response_data.responses;

var discord_bot = new Discord.Client();

var condor_user_id = credentials.bot_user_id;
var mentionString = "<@" + condor_user_id + ">";

console.log("Logging into Discord...");

discord_bot.loginWithToken(credentials.bot_token).then(dostuff);

function dostuff(login_results) {

    // console.log(login_results);
    console.log("Done logging in successfully!");
}

discord_bot.on("ready", function() {

    console.log("Ready, waiting for messages...");

    discord_bot.on("message", function(message){

        var msg = message.content.trim().toLowerCase();
        var isQuery = msg.indexOf(".infobot ") === 0;
        var isMention = msg.indexOf(mentionString) === 0;

        // response = getResponse(message.content);

        if(isQuery) {

            msg = msg.substring(8).trim();
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
    console.log('on_death exit');
    discord_bot.logout(function(res) {
        // console.log(res);
    });
});

process.on('exit', function() {
    console.log('node exit');
    discord_bot.logout(function(res) {
        //console.log(res);
    });
});