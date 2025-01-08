import { authorizedRequest } from "../api/request.js";

//send the authenticated request
export const vintedSearch = async (channel, cookie, processedArticleIds) => {
    try {
        const url = new URL(channel.url);
        const apiUrl = `https://${url.host}/api/v2/catalog/items${url.search}&order=newest_first&page=1&per_page=10`;
        const response = await authorizedRequest("GET", apiUrl, null, null, cookie, true, false, false);
        const articles = selectNewArticles(response, processedArticleIds, channel);
        return articles;
    } catch (err) {
        console.error('Error during search:', err);
        return null;
    }
};

//chooses only articles not already seen & posted in the last 10min
const selectNewArticles = (articles, processedArticleIds, channel) => {
    const items = Array.isArray(articles.items) ? articles.items : [];
    const titleBlacklist = Array.isArray(channel.titleBlacklist) ? channel.titleBlacklist : [];
    
    const filteredArticles = items.filter(({ photo, id, title, user }) => 
        photo && 
        photo.high_resolution.timestamp * 1000 > Date.now() - 60000 && 
        !processedArticleIds.has(id) &&
        !titleBlacklist.some(word => title.toLowerCase().includes(word))
    );
    return filteredArticles;
  };
