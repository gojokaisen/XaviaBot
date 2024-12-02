const config = {
    name: "prodia",
    aliases: ["img", "imagine"],
    version: "1.2.0",
    description: "Generate images from text prompts using various AI models",
    usage: "[prompt] | [model number]",
    credits: "Frank Kaumba //API by Fahim_Noob"
}

const langData = {
    "en_US": {
        "prodia.noPrompt": "🚫 Please provide a prompt and optional model number.",
        "prodia.modelList": `Available Models:
1 | 3Guofeng3_v34
2 | absolutereality_V16
3 | absolutereality_v181
4 | analog-diffusion-1.0.ckpt
5 | anythingv3_0-pruned.ckpt
6 | anything-v4.5-pruned.ckpt
7 | anythingV5_PrtRE
8 | AOM3A3_orangemixs
9 | blazing_drive_v10g
10 | cetusMix_Version35
11 | childrensStories_v13D
12 | childrensStories_v1SemiReal
13 | childrensStories_v1ToonAnime
14 | Counterfeit_v30
15 | cuteyukimixAdorable_midchapter3`
    }
}

async function onCall({ message, args, getLang, api, event }) {
    const text = args.join(' ');

    if (!text) {
        return message.reply(getLang("prodia.noPrompt"));
    }

    const [prompt, model] = text.split('|').map((text) => text.trim());
    const models = model || "2";
    const puti = 'xyz';
    const baseURL = `https://smfahim.${puti}/prodia?prompt=${encodeURIComponent(prompt)}&model=${models}`;

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const attachment = await global.utils.getStreamFromURL(baseURL);

        await message.reply({
            attachment
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply(`🚨 Image generation failed: ${error.message}`);
    }
}

export default {
    config,
    langData,
    onCall
}
