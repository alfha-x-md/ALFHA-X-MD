const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "5McUyI4D#NwF3TfNY78K0Yi-8rGD7EVES0Pzw7rSgKH7pNS40fd8",
ALIVE_IMG: process.env.ALIVE_IMG || "https://res.cloudinary.com/dhpfn4umb/image/upload/v1768786473/ej7p8gkhfezafeyuhjpl.png",
ALIVE_MSG: process.env.ALIVE_MSG || "*HELLO ALFHA X MD IS ALIVE NOW*",
BOT_OWNER: '94784167385',  // Replace with the owner's phone number
AUTO_STATUS_SEEN: 'true',
AUTO_STATUS_REACT: 'true',



};
