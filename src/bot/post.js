import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

//set-up the buttons
const components = [
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
        .setLabel("Détails")
        .setEmoji("🗄️")
        .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
        .setLabel("Message")
        .setEmoji("🪐")
        .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
        .setCustomId("autobuy")
        .setLabel("Autobuy")
        .setStyle(ButtonStyle.Success),
    ]),
];

//format the timestamp
async function cleanTime(time) {
    let delay;
    if (time < 1000) {
        delay = `${time.toFixed(0)}ms`;
    }  else if (time < 60000) {
        delay = `${(time/1000).toFixed(0)}s`;
    } else if (time < 3600000) {
        delay = `${(time / 60000).toFixed(0)}min`;
    } else {
        delay = `${(time / 3600000000).toFixed(0)}h`;
    }
    return delay;
}

export async function postArticles(newArticles, channelToSend) {
    //simultanously send the messages
    const messages = newArticles.slice(0, 10).map(async (item) => {
        const timestamp = new Date(item.photo.high_resolution.timestamp * 1000);
        const delayInSeconds = Math.abs((Date.now() - item.photo.high_resolution.timestamp * 1000));
        const cleanDelay = await cleanTime(delayInSeconds);
        //set button urls
        components[0].components[0].setURL(`https://www.vinted.fr/items/${item.id}`);
        components[0].components[1].setURL(`https://www.vinted.fr/items/${item.id}/want_it/new?`);

        return channelToSend.send({
            embeds: [{
                title: item.title+"  ("+item.price.amount+"€)  "+item.size_title,
                url: item.url,
                fields: [{
                    name: "\u200B",
                    value: `\`\`\`YAML\n Size: ${item.size_title} - ${item.price.amount}€  (${cleanDelay})\`\`\`` || "Aucun",
                    inline: true,
                }],
                image: { url: item.photo?.url },
                footer: {text: item.user.id+"-"+item.id},
                timestamp,
                color: parseInt("09b1ba", 16),
            }],
            components,
        });
    });
    await Promise.all(messages);
}

//send the user a private message with the purchase details
export async function purchaseMessage(interaction, purchaseInfo) {
    const link = `https://www.vinted.fr/items/${purchaseInfo.itemId}`;
    const dmButton = new ActionRowBuilder().addComponents([
        new ButtonBuilder()
            .setLabel("Message")
            .setEmoji("🪐")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://www.vinted.fr/inbox/${purchaseInfo.conversationId}`),
    ]);
    await interaction.user.send({
        content: link,
        embeds: [{
            title: "Purchase details",
            url : link,
            fields: [
                { name: "Point", value: (purchaseInfo.pointName || "N/A").toString() },
                { name: "Address", value: (purchaseInfo.pointAddress || "N/A").toString() },
                { name: "Carrier", value: (purchaseInfo.carrier || "N/A").toString() },
            ],
            color: parseInt("09b1ba", 16),
        }],
        components: [dmButton]
    });
}