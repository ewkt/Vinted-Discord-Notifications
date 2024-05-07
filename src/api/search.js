import fetch from "node-fetch";
import UserAgent from "user-agents";

//prepares the url for the fetch request
function parseVintedURL(params,per_page=10) {
  return `https://www.vinted.fr/api/v2/catalog/items?${params}&order=newest_first&page=1&per_page=${per_page}`;
}


//send the authenticated request
const vintedSearch = (params = {},cookie, agent) => {
  return new Promise(async (resolve, reject) => {
    const controller = new AbortController();
    fetch(parseVintedURL(params), {
      headers: {
        "user-agent": new UserAgent().toString(),
        "Cookie": cookie,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "DNT": "1",
        "Upgrade-Insecure-Requests": "1",
      },
      agent: agent,
    })
    .then((res) => {
      controller.abort();
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      resolve(data);
    })
    .catch((err) => {
      controller.abort();
      console.error('Error during fetch:', err);
      resolve({ items: [] });
    });
});
};

export default vintedSearch;