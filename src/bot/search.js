import { authorizedRequest } from "../api/make-request.js";

//send the authenticated request
export const vintedSearch = async (channel, processedArticleIds) => {
    const url = new URL(channel.url);
    const ids = handleParams(url);
    const apiUrl = new URL(`https://${url.host}/api/v2/catalog/items`);
    apiUrl.search = new URLSearchParams({
        page: '1',
        per_page: '96',
        time: Math.floor(Date.now()/1000 - Math.random()*60*3), //mimic random time, often with a delay in vinted
        search_text: ids.text,
        catalog_ids: ids.catalog,
        price_from: ids.min,
        price_to: ids.max,
        currency: ids.currency,
        order: 'newest_first',
        size_ids: ids.size,
        brand_ids: ids.brand,
        status_ids: ids.status,
        color_ids: ids.colour,
        material_ids: ids.material,
    }).toString();
    const responseData = await authorizedRequest({method: "GET", url: apiUrl.href, oldUrl: channel.url, search: true, logs: false});
    const articles = selectNewArticles(responseData, processedArticleIds, channel);
    return articles;
};

//chooses only articles not already seen & posted in the last 10min
const selectNewArticles = (articles, processedArticleIds, channel) => {
    const items = Array.isArray(articles.items) ? articles.items : [];
    const titleBlacklist = Array.isArray(channel.titleBlacklist) ? channel.titleBlacklist : [];
    const userBlacklist = Array.isArray(channel.userBlacklist) ? channel.userBlacklist : [];
    const filteredArticles = items.filter(({ photo, id, title, user }) => 
      photo && 
      photo.high_resolution.timestamp * 1000 >  Date.now() - (1000 * 60 * 10) && 
      !processedArticleIds.has(id) &&
      !titleBlacklist.some(word => title.toLowerCase().includes(word)) &&
      !userBlacklist.some(word => user.login.toLowerCase().includes(word))
    );
    return filteredArticles;
  };

const handleParams = (url) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const idMap = {
        text: params.get('search_text') || '',
        catalog: params.getAll('catalog[]').join(',') || '',
        min: params.get('price_from') || '',
        max: params.get('price_to') || '',
        currency: params.get('currency') || '',
        size: params.getAll('size_ids[]').join(',') || '',
        brand: params.getAll('brand_ids[]').join(',') || '',
        status: params.getAll('status_ids[]').join(',') || '',
        colour: params.getAll('color_ids[]').join(',') || '',
        material: params.getAll('material_ids[]').join(',') || '',
    };
    return idMap;
};