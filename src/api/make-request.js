import fetch from 'node-fetch';

import { authManager } from './auth-manager.js';

//general fucntion to make an authorized request
export const authorizedRequest = async ({
    method, 
    url, 
    oldUrl = null,
    search = false,
    logs = true
} = {}) => {
    try {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome",
            "Host": new URL(url).host,
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Connection": "keep-alive",
            "TE": "trailers",
            "DNT": 1
        };

        if (search) { //cookies from cookies.json
            const cookies = authManager.getCookies();
            headers["Cookie"] = Object.entries(cookies)
                .filter(([, value]) => value)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
            headers["Accept-Language"] = "en-US,en;q=0.5";
            headers["Priority"] = "u=0, i";
            headers["Sec-Fetch-Dest"] = "document";
            headers["Sec-Fetch-Mode"] = "navigate";
            headers["Sec-Fetch-Site"] = "cross-site";
            headers["Upgrade-Insecure-Requests"] = "1";
        }
        if (logs) {
            console.log("making an authed request to " + url);
        }

        const options = {
            "method": method,
            "headers": headers,
        };
        if (oldUrl) {
            options.headers["Referer"] = oldUrl;
        }

        let response = await fetch(url, options);

        while ([301, 302, 303, 307, 308].includes(response.status)) {
            const newUrl = response.headers.get('Location');
            console.log(`redirected to ${newUrl}`);
            response = await fetch(newUrl, options);
        }
        if (!response.ok) {
            throw `HTTP status: ${response.status}`;
        }
        if (response.headers.get('Content-Type')?.includes('text/html')) {
            console.warn("Response is HTML")
            return response.headers;
        }

        return await response.json();
    } catch (error) {
        throw "While making request: " + error;
    }
};