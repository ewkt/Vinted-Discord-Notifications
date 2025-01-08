import fetch from 'node-fetch';
import UserAgent from 'user-agents';

//general fucntion to make an authorized request
export const authorizedRequest = async (method, url, data, tokens, cookies, c = false, t = false, logging = true) => {
    try {
        let urlObj = new URL(url);
        const headers = {
            "user-agent": new UserAgent().toString(),
            "Host": urlObj.host,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Referer": `https://${urlObj.host}/`,
            "Origin": `https://${urlObj.host}`,
            "DNT": "1",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Content-Length": "0",
            "Content-Type": "*/*",
        };

        if (c) {
            headers["Cookie"] = cookies;
        }

        if (t) {
            headers["Authorization"] = `Bearer ${tokens.access}`;
            headers["X-CSRF-Token"] = tokens.xcsrf;
        }

        const options = {
            "credentials": "include",
            "headers": headers,
            "method": method,
            "mode": "cors",
            "redirect": "manual",
            "timeout": 5000
        };

        if (method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(data);
        }

        let response = await fetch(url, options);

        if (logging){
            console.log("making an authed request to " + url);
        }

        while ([301, 302, 303, 307, 308].includes(response.status)) {
            const newUrl = response.headers.get('Location');
            console.log(`redirected to ${newUrl}`);
            response = await fetch(newUrl, options);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (response.headers.get('Content-Type').includes('text/html')) {
            return response;
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error during authorized request:', error);
        throw error;
    }
};