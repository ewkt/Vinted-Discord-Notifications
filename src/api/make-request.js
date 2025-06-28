import fetch from 'node-fetch';

import { authManager } from './auth-manager.js';
import { updateFromResponseHeaders } from './fetch-auth.js';

const ua = authManager.getUserAgent();

//general fucntion to make an authorized request
export const authorizedRequest = async ({
    method, 
    url, 
    oldUrl = null,
    data = null,
    auth = false,
    search = false,
    logs = true
} = {}) => {
    try {
        const headers = {
            "User-Agent": ua,
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
        if (auth) { //cookies from tokens.json
            const tokens = authManager.getTokens();
            headers["Authorization"] = `Bearer ${tokens.access_token_web}`;
            headers["Cookie"] = Object.entries(tokens)
                .filter(([, value]) => value)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            headers["X-CSRF-Token"] = "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e"; //static token
            headers["Accept"] = "application/json, text/plain, */*";
            headers["Accept-Language"] = "en-fr";
            headers["Content-Type"] = "application/json";
            headers["X-Anon-Id"] = "79ed4b98-4a4d-4d95-83a8-4aaeba47b63b"; //static token
            headers["Origin"] = process.env.BASE_URL;
            headers["Sec-GPC"] = "1";
            headers["Sec-Fetch-Dest"] = "empty";
            headers["Sec-Fetch-Mode"] = "cors";
            headers["Sec-Fetch-Site"] = "same-origin";
            headers["Priority"] = "u=0";
        }
        if (logs) {
            console.log("making an authed request to " + url);
        }

        const options = {
            "method": method,
            "headers": headers,
        };

        if (method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(data);
        }
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
        if (auth) {
            await updateFromResponseHeaders(response.headers);
        }

        return await response.json();
    } catch (error) {
        throw "While making request: " + error;
    }
};