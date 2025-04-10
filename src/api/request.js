import fetch from 'node-fetch';
import { tokenManager } from './tokens.js';

const ua = tokenManager.userAgent();

//general function to make an authorized request
export const authorizedRequest = async ({method, url, oldUrl = null , data = null, tokens = null, cookies = null, logs = true} = {}) => {
    try {
        const headers = {
            "User-Agent": ua,
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
        };
        if (cookies) {
            headers["Cookie"] = cookies;
            headers["Referer"] = oldUrl;
            headers["Origin"] = oldUrl;
        }
        if (tokens) {
            headers["Authorization"] = `Bearer ${tokens.access_token}`;
            headers["Cookie"] = `refresh_token_web=${tokens.refresh_token}; access_token_web=${tokens.access_token}`;
            headers["X-CSRF-Token"] = "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e";
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
        if (tokens) {
            tokenManager.updateFromResponseHeaders(response.headers);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error during authorized request:', error);
        throw error;
    }
};