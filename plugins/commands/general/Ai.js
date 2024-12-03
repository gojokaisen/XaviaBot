const config = {
    name: "ai",
    aliases: ["chat", "gpt"],
    version: "2.0.0",
    description: "Interactive AI assistant with multiple personalities and settings",
    usage: "[command] [options]",
    credits: "Frank Kaumba //jun jaam"
}

const langData = {
    "en_US": {
        "ai.welcome": "Hello {name}, choose your assistant:",
        "ai.assistantList": "Available Assistants:\n{assistants}\n\nExample: {cmd} set friendly",
        "ai.systemInstructions": "\n\n{cmd} system <add/delete/update> <system name> <your instructions>\n\nExample:\n{cmd} system add cat You are a cat assistant\n{cmd} system delete cat",
        "ai.invalidChoice": "Invalid choice. Choose from the available assistants.",
        "ai.assistantChanged": "Assistant changed to {assistant}",
        "ai.systemAdded": "System \"{key}\" added successfully.",
        "ai.systemUpdated": "System \"{key}\" updated successfully.",
        "ai.systemDeleted": "System \"{key}\" deleted successfully."
    }
}

async function onCall({ message, args, event, usersData, globalData, role }) {
    const cmd = config.name;
    const assistants = ["lover", "helpful", "friendly", "toxic", "bisaya", "horny", "tagalog", "godmode"];
    
    const userData = await usersData.get(event.senderID);
    const userName = userData?.name || "User";
    const userSettings = userData?.settings || {};
    const ownSettings = userSettings.own || {};
    const ownKeys = Object.keys(ownSettings);

    let output = assistants.map((key, i) => `${i + 1}. ${key.charAt(0).toUpperCase() + key.slice(1)}`).join("\n");
    
    if (ownKeys.length > 0) {
        output += `\n\nYour custom assistants:\n` + 
        ownKeys.map((key, i) => `${i + 1}. ${key.charAt(0).toUpperCase() + key.slice(1)}`).join("\n");
    }

    if (!args.length) {
        return message.reply(
            langData.en_US.ai.welcome.replace("{name}", userName) + 
            "\n" + 
            langData.en_US.ai.assistantList
                .replace("{assistants}", output)
                .replace("{cmd}", cmd)
        );
    }

    const [action, ...rest] = args;

    switch(action.toLowerCase()) {
        case 'system':
            return handleSystemSettings(message, rest, userData, usersData, cmd);
        
        case 'set':
            return handleAssistantChange(message, rest, userData, usersData, assistants, output, cmd);
        
        case 'nsfw':
            return handleNSFWToggle(message, rest, globalData, role);
        
        case 'model':
            return handleModelChange(message, rest, globalData, role);
        
        default:
            return message.reply(
                langData.en_US.ai.welcome.replace("{name}", userName) + 
                "\n" + 
                langData.en_US.ai.assistantList
                    .replace("{assistants}", output)
                    .replace("{cmd}", cmd)
            );
    }
}

async function handleSystemSettings(message, args, userData, usersData, cmd) {
    const [operation, key, ...valueArr] = args;
    const value = valueArr.join(" ");
    const settings = userData.settings || {};
    const ownKeys = Object.keys(settings.own || {});

    if (!operation || !key) {
        return message.reply(`Usage:\n${cmd} system <add/delete/update> <system name> <your instructions>`);
    }

    switch(operation) {
        case 'add':
        case 'update':
            if (!key || !value) {
                return message.reply(`Please add system name and system prompt.\nExample: system ${operation} cat "You are a cat assistant"`);
            }
            settings.own = { ...(settings.own || {}), [key]: value };
            await usersData.set(userData.userID, { settings });
            return message.reply(
                operation === 'add' 
                    ? langData.en_US.ai.systemAdded.replace("{key}", key)
                    : langData.en_US.ai.systemUpdated.replace("{key}", key)
            );
        
        case 'delete':
            if (ownKeys.includes(key)) {
                delete settings.own[key];
                await usersData.set(userData.userID, { settings });
                return message.reply(langData.en_US.ai.systemDeleted.replace("{key}", key));
            }
            break;
    }
}

async function handleAssistantChange(message, args, userData, usersData, assistants, output, cmd) {
    const choice = args[0]?.toLowerCase();
    const settings = userData.settings || {};

    if (assistants.includes(choice)) {
        settings.system = choice;
        await usersData.set(userData.userID, { settings });
        return message.reply(
            langData.en_US.ai.assistantChanged.replace("{assistant}", choice)
        );
    }

    return message.reply(
        langData.en_US.ai.invalidChoice + 
        "\n" + 
        langData.en_US.ai.assistantList
            .replace("{assistants}", output)
            .replace("{cmd}", cmd)
    );
}

async function handleNSFWToggle(message, args, globalData, role) {
    if (role < 2) {
        return message.reply("You don't have permission to use this.");
    }

    const operation = args[0]?.toLowerCase();
    const gptData = await globalData.get('gpt') || { data: {} };

    if (operation === 'on') {
        gptData.data.nsfw = true;
        await globalData.set('gpt', gptData);
        return message.reply("NSFW features are now allowed.");
    } else if (operation === 'off') {
        gptData.data.nsfw = false;
        await globalData.set('gpt', gptData);
        return message.reply("NSFW features are now disabled.");
    }

    return message.reply("Invalid usage: use 'nsfw on' or 'nsfw off'.");
}

async function handleModelChange(message, args, globalData, role) {
    if (role < 2) {
        return message.reply("You don't have permission to use this.");
    }

    const models = { 1: "llama", 2: "gemini" };
    const modelNumber = args[0];
    const gptData = await globalData.get('gpt') || { data: {} };

    if (models[modelNumber]) {
        gptData.data.model = models[modelNumber];
        await globalData.set('gpt', gptData);
        return message.reply(`Successfully changed model to ${models[modelNumber]}`);
    }

    return message.reply(
        "Please choose a valid model number:\n" + 
        Object.entries(models).map(([id, name]) => `${id}: ${name}`).join("\n")
    );
}

export default {
    config,
    langData,
    onCall
}
