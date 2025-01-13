import { authorizedRequest } from "../api/request.js";

//send the authenticated request
export const vintedSearch = async (channel, cookie, processedArticleIds) => {
    try {
        const url = new URL(channel.url);
        const ids = handleParams(url);
        const apiUrl = `https://www.vinted.fr/api/v2/catalog/items?search_text=${ids.text}&catalog_ids=${ids.catalog}&price_from=${ids.min}&price_to=${ids.max}&currency=${ids.currency}&catalog_from=0&size_ids=${ids.size}&brand_ids=${ids.brand}&status_ids=${ids.status}&color_ids=${ids.colour}&patterns_ids=${ids.pattern}&material_ids=${ids.material}&order=newest_first&page=1&per_page=10`;
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

const handleParams = (url) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const idMap = {
        text: params.get('search_text') || '',
        catalog: params.getAll('catalog[]') || '',
        min: params.get('price_from') || '',
        max: params.get('price_to') || '',
        currency: params.get('currency') || 'EUR',
        brand: params.getAll('brand_ids[]').join(',') || '',
        size: params.getAll('size_ids[]').join(',') || '',
        status: params.getAll('status_ids[]').join(',') || '',
        colour: params.getAll('color_ids[]').join(',') || '',
        pattern: params.getAll('patterns_ids[]').join(',') || '',
        material: params.getAll('material_ids[]').join(',') || '',
    };
    return idMap;
};
