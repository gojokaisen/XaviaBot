const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.1.0",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "Frank Kaumba"
}

const langData = {
    "en_US": {
        "help.list": "🤖 EF-PRIME CMDS 🤖\n\n{list}\n\n📊 Total Commands: {total}\n💡 Hint: Type {syntax} [command] for detailed info!",
        "help.commandNotExists": "❌ Oops! Command '{command}' not found in my arsenal.",
        "help.commandDetails": `
🔍 Command Breakdown:
   📛 Name: {name}
   🏷️ Aliases: {aliases}
   🔢 Version: {version}
   📝 Description: {description}
   🚀 Usage: {usage}
   🛡️ Permissions: {permissions}
   📦 Category: {category}
   ⏱️ Cooldown: {cooldown} sec
   👨‍💻 Creator: {credits}
        `
    }
}

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let commands = {};
        const language = 'en_US';
        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;
            if (!commands.hasOwnProperty(value.category)) commands[value.category] = [];
            commands[value.category].push(key);
        }

        let list = Object.keys(commands)
            .map(category => `🏷️ ${category.toUpperCase()}\n${commands[category].join(" • ")}`)
            .join("\n\n");

        message.reply(getLang("help.list", {
            total: Object.values(commands).map(e => e.length).reduce((a, b) => a + b, 0),
            list,
            syntax: message.args[0].toLowerCase()
        }));
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(getLang("help.commandNotExists", { command: commandName }));

        message.reply(getLang("help.commandDetails", {
            name: command.name,
            aliases: command.aliases.join(", "),
            version: command.version || "1.0.0",
            description: command.description || 'No description available',
            usage: `${prefix}${commandName} ${command.usage || ''}`,
            permissions: command.permissions.map(p => p == 0 ? "Member" : p == 1 ? "Group Admin" : "Bot Admin").join(", "),
            category: command.category,
            cooldown: command.cooldown || 3,
            credits: command.credits || "Unknown"
        }).replace(/^ +/gm, ''));
    }
}

export default {
    config,
    langData,
    onCall
}
