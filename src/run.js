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
        console.error('\nError running bot:', err);
    }
};

//run the search and set a timeout to run it again   
const runInterval = async (client, processedArticleIds, channel, cookieObj) => {
    await runSearch(client, processedArticleIds, channel, cookieObj);
    setTimeout(() => runInterval(client, processedArticleIds, channel, cookieObj), channel.frequency*1000);
};

//define the order of steps to run
export const run = async (client, mySearches) => {
    let cookieObj = {};
    let processedArticleIds = new Set();
    
    //initialise cookie
    cookieObj.value = await fetchCookie();

    //launch a seperate interval for each search after having logged the 96 current articles, 
    //but with delay to stagger and avoid too many simmultaneous requests
    mySearches.forEach((channel, index) => {
        setTimeout(async () => {
            try {
                const initArticles = await vintedSearch(channel, cookieObj.value, processedArticleIds);
                initArticles.forEach(article => { processedArticleIds.add(article.id); });
            } catch (err) {
                console.error('\nError in initializing articles', err);
            }
            await runInterval(client, processedArticleIds, channel, cookieObj);
        }, index*1000);
    });

    //fetch a new cookie and cean ProcessedArticleIDs at interval    
    setInterval(async () => {
        try {
            cookieObj.value = await fetchCookie();
            console.log('reducing processed articles size');
            const halfSize = Math.floor(processedArticleIds.size / 2);
            processedArticleIds = new Set([...processedArticleIds].slice(halfSize)); // convert to an array and keep only the last half of the elements
        } catch (err) {
            console.error('\nError getting new cookie:', err);
        }
    }, 1*60*60*1000); //set interval to 1h
};