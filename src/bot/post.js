import Discord from 'discord.js';

async function postArticles({ newArticles, channelToSend, timest }) {
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

  //simultanously send the messages
  const messages = newArticles.slice(0, 10).map((item) => {
    const timestamp = new Date(item.photo.high_resolution.timestamp * 1000);
    const delayInSeconds = Math.abs((Date.now() - item.photo.high_resolution.timestamp * 1000));
    let delay;

    //format the timestamp
    if (delayInSeconds < 1000) {
      delay = `${delayInSeconds.toFixed(0)}ms`;
    }  else if (delayInSeconds < 60000) {
      delay = `${(delayInSeconds/1000).toFixed(0)}s`;
    } else if (delayInSeconds < 3600000) {
      delay = `${(delayInSeconds / 60000).toFixed(0)}min`;
    } else {
      delay = `${(delayInSeconds / 3600000000).toFixed(0)}h`;
    }

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
              value: `\`\`\`YAML\n Size: ${item.size_title} - ${item.price}€  (${delay})\`\`\`` || "Aucun",
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

  //send all the messages
  await Promise.all(messages);
}

export default postArticles;