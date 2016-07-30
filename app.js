/*
 *  Made by Ethan Lee (@ethanlee16) and Kushal Tirumala (@kushaltirumala)
 *  Licensed under the MIT License.
 */

/* Change this to your Slack bot's OAuth token,
* found in the Integrations tab */

var fs = require("fs");
var Discord = require("discord.js");
var ON_DEATH = require('death');
var credentials = require('./app_credentials.json');

//load response data
var response_filename = './responses.json';
var response_data = require(response_filename);

var mentionResponse = response_data.mentionResponse;
var multipleTermResponse = response_data.multipleTermResponse;
var invalidTermResponse = response_data.invalidTermResponse;
var responses = response_data.responses;

var discord_bot = new Discord.Client();

var condor_user_id = credentials.bot_user_id;
var mentionString = "<@" + condor_user_id + ">";

//hardcoding is bad
var necrodancer_server_id = '83287148966449152';

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

        var condor_staff_role = {};
        var isCondorStaff = false;
        //assume by default the message is not from a staff member

        for(var i = 0; i < message.server.roles.length; i++) {
            if(message.server.roles[i].name === 'CoNDOR Staff') {
                condor_staff_role = message.server.roles[i];
            }
        }

        console.log("Hardcoded ID: " + necrodancer_server_id);
        console.log('Hardcoded typeof: ' + typeof necrodancer_server_id);
        console.log("Discord.js ID: " + message.server.id);
        console.log("Discord.js typeof: " + typeof message.server.id);

        console.log("comparison: " + message.server.id === necrodancer_server_id);

        //only check for condor staff if the message was sent on the official-unofficial NecroDancer server
        if(message.server.id === necrodancer_server_id) {
            console.log('checking condor staff role');
            isCondorStaff = message.author.client.userHasRole(message.author, condor_staff_role);
            //this resolves to an @role mention, NOT a boolean
            //currently left as-is to allow functionality, via javascript evaluating this to true
        } else {
            console.log('not checking condor staff role');
            //do nothing, leave isCondorStaff as false on purpose
        }

        if(isQuery) {

            msg = msg.substring(8).trim();
            // console.log(msg);

            //if space character exists, they used >= 2 keywords.
            //This can mean an invalid query, or it can mean a superuser query with more than 2 keywords.
            //Invalid queries should be given a redirection messages, superuser queries should be executed
            if(msg.indexOf(" ") >= 0) {

                var words = msg.split(" ");

                //reassemble the argument that is a string
                for(var i = 0; i < words.length; i++) {

                    if(words[i].indexOf("\"") === 0 && words[i].charAt(words[i].length-1) !== "\"") {

                        var j = i+1;
                        var quote_string = words[i];

                        while(j < words.length) {

                            quote_string += " " + words[j];

                            if(words[j].indexOf("\"") === words[j].length-1) {
                                break;
                            }

                            j++;
                        }

                        //remove the partial fragments within the quote string
                        words.splice(i, j-1);
                        //add the final quote string back into the array
                        words.splice(i,0,quote_string);
                    }
                }

                // console.log(words);

                if(words[0] === "edit") {

                    //array should look like ['edit', 'command', 'some text here']
                    if(words.length !== 3) {
                        discord_bot.sendMessage(message.channel, "Please use the edit command by `.infobot edit \"command\" \"new text\"", {}, function(error,msg) {
                        });
                    } else {
                        var command_to_edit = words[1].replace(new RegExp("\"", 'g'), '');
                        var text_to_edit = words[2].replace(new RegExp("\"", 'g'), '');

                        text_to_edit = "```" + text_to_edit + "```";

                        console.log(command_to_edit);
                        console.log(text_to_edit);

                        console.log(response_data);

                        //check if command to be edited exists in the responses.json, and check that the user calling the command has the right permissions
                        if(response_data['responses'].hasOwnProperty(command_to_edit)) {

                            if(isCondorStaff) {

                                //make the change to our data within app.js
                                response_data['responses'][command_to_edit] = text_to_edit;

                                //then write that data to the actual json file so it is saved for persistence
                                fs.writeFile(response_filename, JSON.stringify(response_data, null, 2), function(err) {
                                    // console.log(err);
                                });
                            } else {
                                discord_bot.sendMessage(message.channel, "Sorry, only users with the CoNDOR Staff role can use this command. Try `.infobot help` to see other commands you can use.", {}, function(error,msg) {
                                });
                            }

                        } else {
                            discord_bot.sendMessage(message.channel, "The command you are trying to edit does not exist.", {}, function(error,msg) {
                            });
                        }
                    }
                } else {
                    discord_bot.sendMessage(message.channel, multipleTermResponse, {}, function(error,msg) {
                    });
                }

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