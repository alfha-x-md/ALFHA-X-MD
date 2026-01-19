
const { cmd } = require("../command");
const { getGroupAdmins } = require("../lib/functions");
const { downloadMediaMessage } = require('@whiskeysockets/baileys');


function getTargetUser(mek, quoted, args) {
  if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    return mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
  } else if (quoted?.sender) {
    return quoted.sender;
  } else if (args[0]?.includes("@")) {
    return args[0].replace("@", "") + "@s.whatsapp.net";
  }
  return null;
}

cmd({
  pattern: "kick",
  react: "👢",
  desc: "KICK USERS FROM GROUP | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, reply, participants, quoted, args }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  const target = getTargetUser(mek, quoted, args);
  if (!target) return reply("*Mention or reply to a user to kick.*");

  const groupAdmins = getGroupAdmins(participants);
  if (groupAdmins.includes(target)) 
    return reply("*I can't kick an admin.*");

  await danuwa.groupParticipantsUpdate(m.chat, [target], "remove");
  return reply(`*Kicked:* @${target.split("@")[0]}`, { mentions: [target] });
});

cmd({
  pattern: "tagall",
  react: "📢",
  desc: "TAG ALL MEMBERS IN GROUP | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, reply, participants }) => {
  if (!isGroup) return reply("*This command can only be used in groups.*");
  if (!isAdmins) return reply("*Only group admins can use this command.*");

  let validParticipants = participants.filter(p => {
    const number = p.id.split("@")[0];
    return /^\d{9,15}$/.test(number);
  });

  if (validParticipants.length === 0) {
    return reply("*No valid phone numbers found to tag.*");
  }

  let mentions = validParticipants.map(p => p.id);

  let text = "*Attention everyone:*\n";

  let displayNumbers = validParticipants.map(p => {
    const number = p.id.split("@")[0];
    return `@+${number}`;
  });

  text += displayNumbers.join(" ");

  return reply(text, { mentions });
});

cmd({
  pattern: "setpp", 
  desc: "SET GROUP POFILE PIC | ALFHA X MD",
  category: "group",
  filename: __filename
}, async (danuwa, mek, m, { isGroup, isAdmins, reply, participants, args, quoted }) => {
  if (!isGroup) return reply("❌ This command can only be used in groups!");
  if (!isAdmins) return reply("❌ You must be a group admin to use this command!");

  if (!quoted?.message?.imageMessage) return reply("🖼️ Please reply to an image to set as the group profile photo.");

  try {
    const media = await downloadMediaMessage(quoted, 'buffer');
    await danuwa.updateProfilePicture(m.chat, media);
    reply("✅ Group profile picture updated!");
  } catch (e) {
    console.error("❌ Error downloading image:", e);
    reply("⚠️ Failed to set profile picture. Ensure the image is valid and try again.");
  }
});

cmd({
  pattern: "admins",
  react: "👑",
  desc: "TAG ALL ADMINS IN GROUP | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, reply, participants }) => {
  if (!isGroup) return reply("*This command is for groups only.*");

  const admins = participants.filter(p => p.admin).map(p => `@${p.id.split("@")[0]}`).join("\n");

  return reply(`*Group Admins:*\n${admins}`, { mentions: participants.filter(p => p.admin).map(a => a.id) });
});

cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "ADD A USER TO THE GROUP | ALFHA X MD",
    category: "group",
    filename: __filename
},
async (danuwa, mek, m, { from, isGroup, isAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");

        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");

        if (!args[0]) return reply("⚠️ Please provide the phone number of the user to add!");

        const target = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;

        await danuwa.groupParticipantsUpdate(from, [target], "add");

        return reply(`✅ Successfully added: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Add Error:", e);
        reply(`❌ Failed to add the user. Error: ${e.message}`);
    }
});


cmd({
  pattern: "promote",
  react: "⬆️",
  desc: "PROMOTR USER TO ADMIN | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, reply, quoted, args }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  const target = getTargetUser(mek, quoted, args);
  if (!target) return reply("*Mention or reply to a user to promote.*");

  await danuwa.groupParticipantsUpdate(m.chat, [target], "promote");
  return reply(`*Promoted:* @${target.split("@")[0]}`, { mentions: [target] });
});

cmd({
  pattern: "demote",
  react: "⬇️",
  desc: "DEMOTE ADMIN TO USER | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, reply, quoted, args }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  const target = getTargetUser(mek, quoted, args);
  if (!target) return reply("*Mention or reply to a user to demote.*");

  await danuwa.groupParticipantsUpdate(m.chat, [target], "demote");
  return reply(`*Demoted:* @${target.split("@")[0]}`, { mentions: [target] });
});

cmd({
    pattern: "open",
    alias: ["unmute"],
    react: "⚠️",
    desc: "ALLOW EVERYONE SEND MSG IN THE GROUP | ALFHA X MD",
    category: "group",
    filename: __filename
},
async (danuwa, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");

        await danuwa.groupSettingUpdate(from, "not_announcement");

        return reply("✅ Group has been unmuted. Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ Failed to unmute the group. Error: ${e.message}`);
    }
});

cmd({
    pattern: "close",
    alias: ["mute", "lock"],
    react: "⚠️",
    desc: "SET GROUP CHAT ONLY ADMINS ONLY | ALFHA X MD",
    category: "group",
    filename: __filename
},
async (danuwa, mek, m, { from, isGroup, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");

        if (!isAdmins) return reply("⚠️ This command is only for group admins!");

        await danuwa.groupSettingUpdate(from, "announcement");

        return reply("✅ Group has been muted. Only admins can send messages now!");
    } catch (e) {
        console.error("Mute Error:", e);
        reply(`❌ Failed to mute the group. Error: ${e.message}`);
    }
});

cmd({
  pattern: "rlink",
  react: "♻️",
  desc: "RESET GROUP INVITE LINK | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, reply }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  await danuwa.groupRevokeInvite(m.chat);
  return reply("*Group invite link has been reset.*");
});

cmd({
  pattern: "glink",
  alias: ["link"],
  react: "🔗",
  desc: "GET CURRENT INVITE LINK | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, reply }) => {
  if (!isGroup) 
    return reply("*Group only & I must be an admin.*");

  const code = await danuwa.groupInviteCode(m.chat);
  return reply(`*Group Link:*\nhttps://chat.whatsapp.com/${code}`);
});

cmd({
  pattern: "cgname",
  react: "✏️",
  desc: "CHANGE GROUP NAME | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, args, reply }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  if (!args[0]) return reply("*Give a new group name.*");

  await danuwa.groupUpdateSubject(m.chat, args.join(" "));
  return reply("*Group name updated.*");
});

cmd({
  pattern: "cgdesc",
  react: "📝",
  desc: "CHANGE GROUP DESCRIPTION | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, isAdmins, args, reply }) => {
  if (!isGroup || !isAdmins) 
    return reply("*Group only & both you and I must be admins.*");

  if (!args[0]) return reply("*Give a new group description.*");

  await danuwa.groupUpdateDescription(m.chat, args.join(" "));
  return reply("*Group description updated.*");
});

cmd({
  pattern: "ginfo",
  alias: ["ginfo"],
  react: "📄",
  desc: "SHOW GROUP DETAILS | ALFHA X MD",
  category: "group",
  filename: __filename,
}, async (danuwa, mek, m, { isGroup, reply }) => {
  if (!isGroup) return reply("*This command is for groups only.*");

  const metadata = await danuwa.groupMetadata(m.chat);
  const adminsCount = metadata.participants.filter(p => p.admin).length;
  const creation = new Date(metadata.creation * 1000).toLocaleString();
  const owner = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id;
  const desc = metadata.desc || "No description.";

  let txt = `*👥 Group:* ${metadata.subject}\n`;
  txt += `*🆔 ID:* ${metadata.id}\n`;
  txt += `*🧑‍💼 Owner:* ${owner ? `@${owner.split("@")[0]}` : "Not found"}\n`;
  txt += `*📅 Created:* ${creation}\n`;
  txt += `*👤 Members:* ${metadata.participants.length}\n`;
  txt += `*🛡️ Admins:* ${adminsCount}\n`;
  txt += `*📝 Description:*\n${desc}`;

  return reply(txt, { mentions: owner ? [owner] : [] });
});
