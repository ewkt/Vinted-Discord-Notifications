import Discord from 'discord.js';

//set-up the buttons
const components = [
  new Discord.MessageActionRow().addComponents([
    new Discord.MessageButton()
      .setLabel("Détails")
      .setEmoji("🗄️")
      .setStyle("LINK"),
    new Discord.MessageButton()
      .setLabel("Message")
      .setEmoji("🪐")
      .setStyle("LINK"),
  ]),
];

//format the timestamp
async function cleanTime(time) {
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

async function postArticles({ newArticles, channelToSend }) {

//simultanously send the messages
  const messages = newArticles.slice(0, 10).map((item) => {
    const timestamp = new Date(item.photo.high_resolution.timestamp * 1000);
    const delayInSeconds = Math.abs((Date.now() - item.photo.high_resolution.timestamp * 1000));
    const cleanDelay = cleanTime(delayInSeconds);
//set button urls
    components[0].components[0].setURL(`https://www.vinted.fr/items/${item.id}`);
    components[0].components[1].setURL(`https://www.vinted.fr/items/${item.id}/want_it/new?`);

    return channelToSend.send({
      embeds: [
        {
          title: item.title+"  ("+item.price+"€)  "+item.size_title,
          url: item.url,
          fields: [
            {
              name: "\u200B",
              value: `\`\`\`YAML\n Size: ${item.size_title} - ${item.price}€  (${cleanDelay})\`\`\`` || "Aucun",
              inline: true,
            },
          ],
          image: { url: item.photo?.url },
          timestamp,
          color: "#09b1ba",
        },
      ],
      components,
    });
  });
  await Promise.all(messages);
}

export default postArticles;