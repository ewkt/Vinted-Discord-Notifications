import fetch from "node-fetch";
import UserAgent from "user-agents";

//prepares the url for the fetch request
const parseVintedURL = (params,per_page=10) => {
    return `https://www.vinted.fr/api/v2/catalog/items?${params}&order=newest_first&page=1&per_page=${per_page}`;
}

//send the authenticated request
export const vintedSearch = async (params = {}, cookie) => {
    try {
        const response = await fetch(parseVintedURL(params), {
            headers: {
                "user-agent": new UserAgent().toString(),
                "Cookie": cookie,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Connection": "keep-alive",
                "DNT": "1",
                "Upgrade-Insecure-Requests": "1",
            },
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error during fetch:', err);
        return { items: [] };
    }
};