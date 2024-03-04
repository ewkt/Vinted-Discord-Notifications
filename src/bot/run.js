import fs from 'fs';

import vintedSearch from "../api/search.js";
import selectNewArticles from "./filter.js";
import postArticles from "./post.js";
import {insertArticles} from "../db/db.js";

const mySearches = JSON.parse(fs.readFileSync('./config/channels.json', 'utf8'));

const processChannels = async (cookie, client, db, processedArticleIds, INTERVAL_TIME) => {
    try {
        process.stdout.write('.');
        //for each channel (vinted search), look for new articles
        const promises = mySearches.map(async (channel) => {
            const url = new URL(channel.url);
            const urlParams = Object.fromEntries(new URLSearchParams(url.search));
            const channelToSend = client.channels.cache.get(channel.channelId);
            const articles = await vintedSearch(urlParams, cookie) ?? { items: [] };
            const newArticles = await selectNewArticles(articles, processedArticleIds);

            //if new articles are found, post them and insert them into the database
            if (newArticles && newArticles.length > 0) {
                process.stdout.write('\n' + channel.channelName + ' => ' + newArticles.length + ' new articles found.' + '\nSearching for new articles');
                newArticles.forEach(article => { processedArticleIds.add(article.id); });
                await postArticles({ newArticles, channelToSend });
                await insertArticles(newArticles, channel.channelName, db);
            }
        });
        await Promise.all(promises);
    } catch (err) {
        console.error('Error posting articles:', err);
    } finally {
        //wait for the interval time and then search for new articles again
        setTimeout(() => processChannels(cookie, client, db, processedArticleIds, INTERVAL_TIME), INTERVAL_TIME);
    }
};

export default processChannels;