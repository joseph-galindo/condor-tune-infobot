//---EXTERNAL REQUIRES---
let fs = require("fs");
const Discord = require("discord.js");
let memecanvas = require('memecanvas');
let credentials = require('./app_credentials.json');
let response_filename = './responses.json';
let response_data = require(response_filename);

//---INITIAL VARIABLE SETUP---
const discord_bot = new Discord.Client();

let mentionResponse = response_data.mentionResponse;
let multipleTermResponse = response_data.multipleTermResponse;
let invalidTermResponse = response_data.invalidTermResponse;
let responses = response_data.responses;

let condor_user_id = credentials.bot_user_id;
let mentionString = "<@" + condor_user_id + ">";

//assume by default the message is not from a staff member
let condor_staff_role = {};
let isCondorStaff = false;

//hardcoding is bad
const necrodancer_server_id = '83287148966449152';
const superuser_id = "72432401770352640";

//because this is server-side js, we should just traverse the folder and get the filenames
//for the moment, I will hardcode these filenames, but should fix this later.
let image_filenames = ['cadence_dig.jpg', 'cadence_fall.jpg', 'cadence_idk.jpg', 'cadence_resurrect.png', 'cadence_skeleton.jpg', 'cadence_title.jpg', 'necrodancer_dank.jpg'];
let meme_text_pairs = [
        {'top': 'Some top text',
        'bottom': 'Some bottom text'},

        {'top': 'Crypt',
        'bottom': 'of the NecroMemer'},

        {'top': 'Meme me',
        'bottom': 'up fam'},

        {'top': 'One bat, two bat',
        'bottom': 'three bat, obsidian rapier'}]

//initialize memecanvas for .meme command
memecanvas.init('./images/meme-images', '-meme');

//---HELPER FUNCTIONS---
function readyHandler () {
    console.log("Ready, waiting for messages...");
}

function disconnectHandler () {
    console.log("the bot has disconnected");
}

//callback function for discord bot login, if needed to debug connection issues.
function loginFunction (login_results) {
    console.log("Done attemping login!");
}

//fires on every message sent
function checkCondorStaffRole (message_object) {
    let currentGuild = message_object.guild;
    let authorToGuild, authorRoles;

    currentGuild.fetchMember(message_object.author)
    .then(function(response) {
        authorToGuild = response;
        authorRoles = authorToGuild.roles;

        //only check for condor staff if the message was sent on the official-unofficial NecroDancer server, or is superuser (dev)
        if(currentGuild.id === necrodancer_server_id || (authorToGuild.id === superuser_id)) {
            // console.log('checking condor staff role');
            isCondorStaff = authorRoles.exists('name', 'CoNDOR Staff') || (authorToGuild.id === superuser_id);
            //this resolves to a boolean
        } else {
            isCondorStaff = false;
        }
    })
    .catch(console.log);
};

function generateMemeImage (message_object) {
    //pick a random image from the array of images, create a valid filepath from that
    let chosenImage = image_filenames[Math.floor(Math.random()*image_filenames.length)];
    //pick a random object that has text for the image
    let chosenText = meme_text_pairs[Math.floor(Math.random()*meme_text_pairs.length)];

    let imagePath = './images/base-images/' + chosenImage;

    let topText = chosenText.top;
    let bottomText = chosenText.bottom;

    memecanvas.generate(imagePath, topText, bottomText, function(err, memeFilepath) {
        memeCallback(err, memeFilepath, message_object);
    });
};

function memeCallback (err, memeFilepath, message_object) {
    if(err) {
        console.log(err);
    } else {
        console.log(memeFilepath);

        //post the meme image in the channel of the message
        message_object.channel.sendFile(memeFilepath, memeFilepath, 'Here is the meme').then(deleteMemeImages());
    }
};

function deleteMemeImages () {
    const memeDir = './images/meme-images/';

    fs.readdir(memeDir, (err, files) => {
        files.forEach(file => {

            if(file.indexOf('.png') >= 0) {
                console.log(file);
                let real_filepath = memeDir + file;

                fs.unlink(real_filepath, (err) => {
                    if(err) throw err;
                });
            }
        });
    });
};

//fires on commands that may be complex (more than one command arg that is not `.infobot`).
//`.infobot help` is not complex, but `.infobot edit "tune" "tune text"` is complex.
function parseCommandsFromMessage (msg_cleaned, message_object) {
    let words = msg_cleaned.split(" ");

    //reassemble the argument that is a string
    for(let i = 0; i < words.length; i++) {

        if(words[i].indexOf("\"") === 0 && words[i].charAt(words[i].length-1) !== "\"") {
            let j = i+1;
            let quote_string = words[i];

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
function determineComplexFunction (msg_cleaned_split, message_object) {

    if (msg_cleaned_split[0] === "edit") {
        editCommand(msg_cleaned_split, message_object);
    } else if (msg_cleaned_split[0] === 'help') {
        helpCommand(msg_cleaned_split, message_object);
    } else {
        message_object.channel.sendMessage(multipleTermResponse)
        .then(/*message => console.log(`Sent message: ${message.content}`)*/)
        .catch(console.log);
    }
};

//This function fires when determineComplexFunction decides that the command requested is the edit command.
//Will perform some simple validation to make sure the command to be edited exists.
//Also checks if the user has CoNDOR Staff Discord role permissions, otherwise it edits nothing.
function editCommand (msg_cleaned_split, message_object) {

    //array should look like ['edit', 'command', 'some text here']
    if(msg_cleaned_split.length !== 3) {
        message_object.channel.sendMessage("Please use the edit command by `.infobot edit \"command\" \"new text\"")
        .then(/*message => console.log(`Sent message: ${message.content}`)*/)
        .catch(console.log);
    } else {
        let command_to_edit = msg_cleaned_split[1].replace(new RegExp("\"", 'g'), '');
        let text_to_edit = msg_cleaned_split[2].replace(new RegExp("\"", 'g'), '');

        text_to_edit = "```" + text_to_edit + "```";

        // console.log(command_to_edit);
        // console.log(text_to_edit);

        // console.log(response_data);

        //check if command to be edited exists in the responses.json, and check that the user calling the command has the right permissions
        if(response_data['responses'].hasOwnProperty(command_to_edit)) {

            if(isCondorStaff) {
                //make the change to our data within app.js
                response_data['responses'][command_to_edit] = text_to_edit;
                //then write that data to the actual json file so it is saved for persistence
                fs.writeFile(response_filename, JSON.stringify(response_data, null, 2), function(err) {
                    // console.log(err);
                });

                isCondorStaff = false;
            } else {
                message_object.channel.sendMessage("Sorry, only users with the CoNDOR Staff role can use this command. Try `.infobot help` to see other commands you can use.")
                .then(/*message => console.log(`Sent message: ${message.content}`)*/)
                .catch(console.log);
            }

        } else {
            message_object.channel.sendMessage("The command you are trying to edit does not exist.")
            .then(/*message => console.log(`Sent message: ${message.content}`)*/)
            .catch(console.log);
        }
    }
};

//This function fires each time the .infobot help command is requested.
//This is set up to help return info about subcommands, if a request like '.infobot help tune' is provided.
function helpCommand (msg_cleaned_split, message_object) {
    console.log(msg_cleaned_split.length);

    if (msg_cleaned_split.length !== 1) {
        // something like .infobot help x
    } else {
        // would be like .infobot help
        message_object.channel.sendMessage(multipleTermResponse)
        .then(/*message => console.log(`Sent message: ${message.content}`)*/)
        .catch(console.log);
    }
};

//---LISTENER FUNCTIONS---
discord_bot.on("ready", () => {
    readyHandler();
});

discord_bot.on("message", (message_object) => {
    console.log('Message received at: ' + message_object.createdTimestamp);

    //don't let the bot do anything if it's trying to parse its own messages
    if(message_object.author.id !== condor_user_id) {
        let msg_cleaned = message_object.content.trim();
        let isQuery = msg_cleaned.indexOf(".infobot ") === 0;
        let isMention = msg_cleaned.indexOf(mentionString) === 0;

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
                    message_object.channel.sendMessage(responses[msg_cleaned])
                    .then(function(newMsg) {
                        if(msg_cleaned === 'next') {

                            let currentDate = Date.now();
                            let nextDate = new Date(responses['nextDate']).getTime();
                            let differenceInSeconds = (nextDate - currentDate)/1000;

                            let days = -1;
                            let hours = -1;
                            let minutes = -1;
                            let seconds = -1;

                            if(differenceInSeconds > 0) {
                               days = Math.floor(differenceInSeconds / (60*60*24));
                               hours = Math.floor((differenceInSeconds / (60*60*24) % 1) * 24);
                               minutes = Math.floor((((differenceInSeconds / (60*60*24) % 1) * 24) % 1) * 60);
			                   seconds = Math.floor((((((differenceInSeconds / (60*60*24) % 1) * 24) % 1) * 60) % 1) * 60);
                            } else {
                               days = Math.ceil(differenceInSeconds / (60*60*24));
                               hours = Math.ceil((differenceInSeconds / (60*60*24) % 1) * 24);
                               minutes = Math.ceil((((differenceInSeconds / (60*60*24) % 1) * 24) % 1) * 60);
                               seconds = Math.ceil((((((differenceInSeconds / (60*60*24) % 1) * 24) % 1) * 60) % 1) * 60);
			                }

                            let dateMsg = `\`\`\`The next event is ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds away.\`\`\``;

                            message_object.channel.sendMessage(dateMsg)
                            .then()
                            .catch(console.log);
                        }
                    })
                    .catch(console.log);

                } else if(msg_cleaned === 'meme' || msg_cleaned === 'memes') {
                    generateMemeImage(message_object);
                } else {
                    //one keyword, but not a valid command
                    message_object.channel.sendMessage(invalidTermResponse)
                    .then(/*message => console.log(`Sent message: ${message.content}`)*/)
                    .catch(console.log);
                }
            }
        }

        if(isMention) {
            message_object.channel.sendMessage(mentionResponse)
            .then(/*message => console.log(`Sent message: ${message.content}`)*/)
            .catch(console.log);
        }
    }

});

discord_bot.on('error', (err) => {
    console.log('An error was encountered.');
    console.log(err);
    console.log(err.name);
    console.log(err.message);
});

discord_bot.on('disconnect', () => {
     disconnectHandler();
});

//log the bot in

discord_bot.login(credentials.bot_token).then(loginFunction);
