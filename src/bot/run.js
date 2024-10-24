import {vintedSearch} from "../api/search.js";
import {selectNewArticles} from "./filter.js";
import {postArticles} from "./post.js";
import {fetchCookie} from "../api/auth.js";

const runSearch = async (client, processedArticleIds, channel, cookieObj) => {
    try {
        process.stdout.write('.');
        const url = new URL(channel.url);
        const channelToSend = client.channels.cache.get(channel.channelId);
        const articles = await vintedSearch(url.search, cookieObj.value) ?? { items: [] };
        const newArticles = await selectNewArticles(articles, processedArticleIds, channel.titleBlacklist);

        //if new articles are found post them
        if (newArticles && newArticles.length > 0) {
            process.stdout.write('\n' + channel.channelName + ' => +' + newArticles.length);
            newArticles.forEach(article => { processedArticleIds.add(article.id); });
            await postArticles({ newArticles, channelToSend });
        }
    } catch (err) {
            console.error('\n Error posting articles:', err);
        }
};

//run the search and set a timeout to run it again   
const runInterval = async (client, processedArticleIds, channel, cookieObj) => {
    try {
        await runSearch(client, processedArticleIds, channel, cookieObj);
        setTimeout(() => runInterval(client, processedArticleIds, channel, cookieObj), channel.frequency*1000);
    } catch (err) {
        console.error('\n Error running search:', err);
    }
};


//define the order of steps to run
export const run = async (client, processedArticleIds, mySearches, config) => {

    //initialise cookie
    let cookieObj = {};
    cookieObj.value = await fetchCookie();

    //launch a seperate interval for each search, but with delay to avoid too many simmultaneous requests
    mySearches.forEach((channel, index) => {
        setTimeout(() => runInterval(client, processedArticleIds, channel, cookieObj), index*500);
    });

    //fetch a new cookie and cean ProcessedArticleIDs every hour    
    setInterval(async () => {
        cookieObj.value = await fetchCookie();

        const halfSize = Math.floor(processedArticleIds.size / 2);
        let count = 0;
        for (let id of processedArticleIds) {
            if (count >= halfSize) break;
            processedArticleIds.delete(id);
            count++;
        }
            
        console.log("\nNew cookie fetched & Processed articles cleaned\n");
    }, config.INTERVAL_TIME*60*60*1000);
};