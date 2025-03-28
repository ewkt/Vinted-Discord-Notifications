import { vintedSearch } from "./bot/search.js";
import { postArticles } from "./bot/post.js";
import { fetchCookie } from "./api/auth.js";

const runSearch = async (client, processedArticleIds, channel, cookieObj) => {
    try {
        process.stdout.write('.');
        const articles = await vintedSearch(channel, cookieObj.value, processedArticleIds);

        //if new articles are found post them
        if (articles && articles.length > 0) {
            process.stdout.write('\n' + channel.channelName + ' => +' + articles.length);
            articles.forEach(article => { processedArticleIds.add(article.id); });
            await postArticles(articles, client.channels.cache.get(channel.channelId));
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
export const run = async (client, processedArticleIds, mySearches) => {

    //initialise cookie
    let cookieObj = {};
    cookieObj.value = await fetchCookie();

    //launch a separate interval for each search, but with delay to avoid too many simultaneous requests
    mySearches.forEach((channel, index) => {
        setTimeout(() => runInterval(client, processedArticleIds, channel, cookieObj), index*1000);
    });

    //fetch a new cookie and clean ProcessedArticleIDs every hour
    setInterval(async () => {
        cookieObj.value = await fetchCookie();
        console.log('reducing processed articles size');
        const halfSize = Math.floor(processedArticleIds.size / 2);
        let count = 0;
        for (let id of processedArticleIds) {
            if (count >= halfSize) break;
            processedArticleIds.delete(id);
            count++;
        }
    }, process.env.INTERVAL_TIME*60*60*1000);
};