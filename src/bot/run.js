import {vintedSearch} from "../api/search.js";
import {selectNewArticles} from "./filter.js";
import {postArticles} from "./post.js";
import {insertArticles} from "../db/db.js";
import {fetchCookie} from "../api/auth.js";

import { HttpsProxyAgent } from 'https-proxy-agent';

const runSearch = async (client, db, processedArticleIds, channel, cookieObj, agent) => {
    try {
        process.stdout.write('.');
        const url = new URL(channel.url);
        const channelToSend = client.channels.cache.get(channel.channelId);
        const articles = await vintedSearch(url.search, cookieObj.value, agent) ?? { items: [] };
        const newArticles = await selectNewArticles(articles, processedArticleIds, channel.filterWords);

//if new articles are found, post them and insert them into the database
        if (newArticles && newArticles.length > 0) {
            process.stdout.write('\n' + channel.channelName + ' => +' + newArticles.length);
            newArticles.forEach(article => { processedArticleIds.add(`${article.id}_${article.photo.high_resolution.timestamp}`); });
            await postArticles({ newArticles, channelToSend });
            await insertArticles(newArticles, channel.channelName, db);
        }
    } catch (err) {
            console.error('\n Error posting articles:', err);
        }
};


const runInterval = async (client, db, processedArticleIds, channel, cookieObj, agent) => {
   
//run the search and set a timeout to run it again   
    try {
        await runSearch(client, db, processedArticleIds, channel, cookieObj, agent);
        setTimeout(() => runInterval(client, db, processedArticleIds, channel, cookieObj, agent), channel.frequency);
    } catch (err) {

//if the cookie is invalid, wait for a minute, fetch a new one and restart the interval        
        if (err.status === 401) {
            setTimeout(async () => {
                cookieObj.value = await fetchCookie();
                console.log("\n 401 => New cookie fetched.\n");
                runInterval(client, db, processedArticleIds, channel, cookieObj, agent);
            }, 60000);
        }
    }
};


//define the order of steps to run
export const run = async (client, db, processedArticleIds, mySearches, config, proxies) => {
    let cookieObj = {};

//initialise cookie
    cookieObj.value = await fetchCookie();

//launch a seperate interval for each search
    mySearches.map((channel, index) => {
        const proxy = proxies.length > 0 ? proxies[index % proxies.length].trim() : null;
        const agent = proxy ? new HttpsProxyAgent(proxy) : null;
        runInterval(client, db, processedArticleIds, channel, cookieObj, agent);
    });

//fetch a new cookie every hour    
    setInterval(async () => {
        cookieObj.value = await fetchCookie();
        console.log("\nNew cookie fetched.\n");
    }, config.INTERVAL_TIME);
};