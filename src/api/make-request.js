import fetch from 'node-fetch';
import { authManager } from './auth-manager.js';

const ua = authManager.getUserAgent();
const xAnonId = authManager.getXAnonId();

//general fucntion to make an authorized request
export const authorizedRequest = async ({method, url, oldUrl = null , data = null, auth = false, search = false, logs = true} = {}) => {
    try {
        const headers = {
            "User-Agent": ua,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Host": new URL(url).host,
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "TE": "Trailers",
        };
        if (search) {
            const cookies = authManager.getCookies();
            headers["Cookie"] = `refresh_token_web=${cookies.refresh}; access_token_web=${cookies.access}`;
            headers["Referer"] = oldUrl;
            headers["Origin"] = oldUrl;
            headers["X-Anon-Id"] = xAnonId;
        }
        if (auth) {
            const tokens = authManager.getTokens();
            headers["Authorization"] = `Bearer ${tokens.access_token}`;
            headers["Cookie"] = `refresh_token_web=${tokens.refresh_token}; access_token_web=${tokens.access_token}`;
            headers["X-CSRF-Token"] = "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e"; //this is a static token, it doesn't change with users
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
            throw `HTTP status: ${response.status}`;
        }
        if (response.headers.get('Content-Type')?.includes('text/html')) {
            return response;
        }
        if (auth && !url.includes('web/api/auth/refresh')) {
            await authManager.updateFromResponseHeaders(response.headers);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        throw "While making request: " + error;
    }
};