import vintedSearch from "../api/search.js";
import selectNewArticles from "./filter.js";
import postArticles from "./post.js";
import {insertArticles} from "../db/db.js";
import fetchCookie from "../api/auth.js";

const runSearch = async (client, db, processedArticleIds, channel, cookieObj) => {
    try {
        process.stdout.write('.');
        const url = new URL(channel.url);
        const channelToSend = client.channels.cache.get(channel.channelId);
        const articles = await vintedSearch(url.search, url.host, cookieObj.value, 10) ?? { items: [] };
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


const runInterval = async (client, db, processedArticleIds, channel, cookieObj) => {
   
//run the search and set a timeout to run it again   
    try {
        await runSearch(client, db, processedArticleIds, channel, cookieObj);
        setTimeout(() => runInterval(client, db, processedArticleIds, channel, cookieObj), channel.frequency);
    } catch (err) {

//if the cookie is invalid, wait for a minute, fetch a new one and restart the interval        
        if (err.status === 401) {
            setTimeout(async () => {
                cookieObj.value = await fetchCookie();
                console.log("\n 401 => New cookie fetched.\n");
                runInterval(client, db, processedArticleIds, channel, cookieObj);
            }, 60000);
        }
    }
};


//define the order of steps to run
const run = async (client, db, processedArticleIds, mySearches, config) => {
    let cookieObj = {};

//initialise cookie
    cookieObj.value = await fetchCookie();

//launch a seperate interval for each search
    mySearches.forEach((channel) => {
        runInterval(client, db, processedArticleIds, channel, cookieObj);
    });

//fetch a new cookie every hour    
    setInterval(async () => {
        cookieObj.value = await fetchCookie();
        console.log("\nNew cookie fetched.\n");
    }, config.INTERVAL_TIME);
};

export default run;