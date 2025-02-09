import fetch from 'node-fetch';
import UserAgent from 'user-agents';

//general fucntion to make an authorized request
export const authorizedRequest = async ({method, url, oldUrl = null , data = null, cookies = null, logs = true} = {}) => {
    try {
        const headers = {
            "user-agent": new UserAgent().toString(),
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "DNT": "1",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "Content-Length": "0",
            "Content-Type": "*/*",
        };
        if (cookies) {
            headers["Cookie"] = cookies;
            headers["Referer"] = oldUrl;
            headers["Origin"] = oldUrl;
        }
        const options = {
            "headers": headers,
            "method": method,
        };
        if (method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(data);
        }
        if (logs) {
            console.log("making an authed request to " + url);
        }
        let response = await fetch(url, options);

        while ([301, 302, 303, 307, 308].includes(response.status)) {
            const newUrl = response.headers.get('Location');
            console.log(`redirected to ${newUrl}`);
            response = await fetch(newUrl, options);
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (response.headers.get('Content-Type')?.includes('text/html')) {
            return response;
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error during authorized request:', error);
        throw error;
    }
};