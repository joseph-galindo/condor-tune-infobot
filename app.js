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

var discord_bot = new Discord.Client();

//load response data
var response_filename = './responses.json';
var response_data = require(response_filename);

var mentionResponse = response_data.mentionResponse;
var multipleTermResponse = response_data.multipleTermResponse;
var invalidTermResponse = response_data.invalidTermResponse;
var responses = response_data.responses;

var condor_user_id = credentials.bot_user_id;
var mentionString = "<@" + condor_user_id + ">";

//assume by default the message is not from a staff member
var condor_staff_role = {};
var isCondorStaff = false;

//hardcoding is bad
var necrodancer_server_id = '83287148966449152';

console.log("Logging into Discord...");

discord_bot.loginWithToken(credentials.bot_token).then(loginFunction);

discord_bot.on("ready", function() {

    console.log("Ready, waiting for messages...");

    discord_bot.on("message", function(message_object){

        var msg_cleaned = message_object.content.trim().toLowerCase();
        var isQuery = msg_cleaned.indexOf(".infobot ") === 0;
        var isMention = msg_cleaned.indexOf(mentionString) === 0;

        checkCondorStaffRole(message_object);

        if(isQuery) {

            msg_cleaned = msg_cleaned.substring(8).trim();

            //if space character exists, they used >= 2 keywords.
            //This can mean an invalid query, or it can mean a query with more than 2 keywords.
            //Invalid queries will be redirected, queries will be executed if permissions are met
            if(msg_cleaned.indexOf(" ") >= 0) {

                parseCommandsFromMessage(msg_cleaned, message_object);

            } else {

                //a simple command (one term besides `.infobot`) was supplied, such as `.infobot condor`
                //in this case, just check against the resposnes.json and return text accordingly
                if(responses.hasOwnProperty(msg_cleaned)) {
                    //one keyword, and valid command!!!
                    discord_bot.sendMessage(message_object.channel, responses[msg_cleaned], {}, function(error,msg) {
                    });
                } else {
                    //one keyword, but not a valid command
                    discord_bot.sendMessage(message_object.channel, invalidTermResponse, {}, function(error,msg) {
                    });
                }
            }
        }

        if(isMention) {
            discord_bot.reply(message_object,mentionResponse,{}, function(err,msg){
            });
        }

    });
});

//helper functions

//callback function for discord bot login, if needed to debug connection issues.
function loginFunction(login_results) {

    // console.log(login_results);
    console.log("Done logging in successfully!");
}

//fires on every message sent
function checkCondorStaffRole(message_object) {

    for(var i = 0; i < message_object.server.roles.length; i++) {
        if(message_object.server.roles[i].name === 'CoNDOR Staff') {
            condor_staff_role = message_object.server.roles[i];
        }
    }

    //only check for condor staff if the message was sent on the official-unofficial NecroDancer server
    if(message_object.server.id === necrodancer_server_id) {
        console.log('checking condor staff role');
        isCondorStaff = message_object.author.client.userHasRole(message_object.author, condor_staff_role);
        //this resolves to an @role mention, NOT a boolean
        //currently left as-is to allow functionality, via javascript evaluating this to true
    } else {
        console.log('not checking condor staff role');
        //do nothing, leave isCondorStaff as false on purpose
    }
};

//fires on commands that may be complex (more than one command arg that is not `.infobot`). 
//`.infobot help` is not complex, but `.infobot edit "tune" "tune text"` is complex.
function parseCommandsFromMessage(msg_cleaned, message_object) {

    var words = msg_cleaned.split(" ");

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

    determineComplexFunction(words, message_object);
};

//fires on commands that may be complex, after parsing happens in parseCommandsFromMessage. 
//`.infobot edit "tune" "tune text"` will execute the edit command code here, 
//but `.infobot madeup_command "123" "text" will do nothing.
//This function handles that kind of validation and branching.
function determineComplexFunction(msg_cleaned_split, message_object) {

    if(msg_cleaned_split[0] === "edit") {

        editCommand(msg_cleaned_split, message_object);

    } else {
        discord_bot.sendMessage(message_object.channel, multipleTermResponse, {}, function(error,msg) {
        });
    }
};

//This function fires when determineComplexFunction decides that the command requested is the edit command.
//Will perform some simple validation to make sure the command to be edited exists.
//Also checks if the user has CoNDOR Staff Discord role permissions, otherwise it edits nothing.
function editCommand(msg_cleaned_split, message_object) {

    //array should look like ['edit', 'command', 'some text here']
    if(msg_cleaned_split.length !== 3) {
        discord_bot.sendMessage(message_object.channel, "Please use the edit command by `.infobot edit \"command\" \"new text\"", {}, function(error,msg) {
        });
    } else {
        var command_to_edit = msg_cleaned_split[1].replace(new RegExp("\"", 'g'), '');
        var text_to_edit = msg_cleaned_split[2].replace(new RegExp("\"", 'g'), '');

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
                discord_bot.sendMessage(message_object.channel, "Sorry, only users with the CoNDOR Staff role can use this command. Try `.infobot help` to see other commands you can use.", {}, function(error,msg) {
                });
            }

        } else {
            discord_bot.sendMessage(message_object.channel, "The command you are trying to edit does not exist.", {}, function(error,msg) {
            });
        }
    }
};

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