import * as Discord from "discord.js";

import { apiKey } from "./botkey";
import { Config } from './config';
import * as ModeratorTools from './features/moderator-tools';
import * as BotBehavior from './features/bot-behavior';
// import * as RepostManagement from './features/repost-management';
// import * as RoleManagement from './features/role-management';

export const client = new Discord.Client();

let primaryServer: Discord.Guild = null;
async function main() {
    client.on('error', (error) => { console.log(error) });

    // see botkey.sample.ts for guidance
    client.login(apiKey());

    client.on('ready', async () => {
        console.log(`${Config.botName} online`);
        client.user.setActivity("!help for commands", { name: "!help for commands", type: "LISTENING" });

        // get message history for #role channel such that these messages can be monitored for reactions
        primaryServer = client.guilds.cache.find(guild => guild.id === Config.serverId);
        const RoleChannel = await primaryServer.channels.cache.find(channel => channel.id === Config.roleChannelId);
        const hydratedRoleChannel = await RoleChannel.fetch() as Discord.TextChannel;
        await hydratedRoleChannel.messages.fetch();
    });

    // WELCOME MESSAGE FOR NEW MEMBERS
    client.on('guildMemberUpdate', async function (oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
        if (!oldMember.roles.cache.has(Config.memberRoleId) && newMember.roles.cache.has(Config.memberRoleId)) {
            newMember.send(`Welcome to ${primaryServer.name}! \nYou have just been given the #member status by an admin!\n**Please checkout the _#roles_ channel to set yourself up with some roles!**`);
        }
    });


    // SETUP BOT LISTENERS

    // MODERATOR TOOLS
    client.on('messageReactionRemove', ModeratorTools.handleReactionRemove);
    client.on('messageReactionAdd', ModeratorTools.handleReactionAdd);
    client.on('message', ModeratorTools.handleMessage);

    // BOT BEHAVIOR
    client.on('message', BotBehavior.handleMessage);

    // ROLE MANAGEMENT
    // client.on('messageReactionAdd', RoleManagement.handleReactionAdd);
    // client.on('messageReactionRemove', RoleManagement.handleReactionRemove);
    // REPOST MANAGEMENT
    // client.on('message', RepostManagement.handleMessage);

}

main();
