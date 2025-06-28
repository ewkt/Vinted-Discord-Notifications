import { authorizedRequest } from './make-request.js';
import { authManager } from './auth-manager.js';

//helper to extract cookie value from the header string
const extractCookieValue = (header, name) => {
    const regex = new RegExp(`${name}=([^;]+)`);
    const match = header.match(regex);
    return match ? match[1] : null;
};

//fetch cookies for the search session with no privileges
export const fetchCookies = async () => {
    try{
        const headers = await authorizedRequest({
            method: "HEAD", 
            url: process.env.BASE_URL+"/how_it_works"
        });
    
        const setCookie = headers.raw()['set-cookie'];
        const sessionCookiesArray = Array.isArray(setCookie) ? setCookie : (setCookie ? [setCookie] : []);
        if (!sessionCookiesArray || sessionCookiesArray.length === 0) {
            throw "Set-Cookie headers not found in the response";
        }
        const cookieHasAccessToken = sessionCookiesArray.some(cookie => cookie.includes('access_token_web'));
        if (cookieHasAccessToken) {
            console.log('refreshing cookies');
            //get all set-cookies and extract their values to construct the cookie string
            const cookieHeader = sessionCookiesArray
                .map(cookie => cookie.split(';')[0].trim())
                .join('; ');
            const cookieObject = {
                refresh: extractCookieValue(cookieHeader, 'refresh_token_web'),
                access: extractCookieValue(cookieHeader, 'access_token_web'),
                vinted: extractCookieValue(cookieHeader, '_vinted_fr_session')
            };
            await authManager.setCookies(cookieObject);
        }
    } catch (error) {
        throw "While fetching cookies: " + error;
    }
};

//fetch tokens for authed activity by refreshing the current ones
export const fetchTokens = async (tokens) => {
    console.log('fetching tokens');
    const body = {
        "refresh_token": tokens.refresh_token
    };

    try {
        const responseData = await authorizedRequest({
            method: "POST", 
            url: process.env.BASE_URL+"/web/api/auth/refresh", 
            data: body, 
            auth: true
        });

        const tokens = {
            access_token_web: responseData.access_token,
            refresh_token_web: responseData.refresh_token,
            expiry: (responseData.created_at + responseData.expires_in) * 1000
        }
        await authManager.setTokens(tokens);
    } catch (error) {
        throw "While fetching tokens: " + error;
    }
};

//updates token values from set-cookie headers returned by authorized requests
export const updateFromResponseHeaders = async (headers) => {
    try {
        const setCookie = headers['set-cookie'];
        const sessionCookiesArray = Array.isArray(setCookie) ? setCookie : (setCookie ? [setCookie] : []);
        const cookieHeader = sessionCookiesArray.join('; ');
        if (cookieHeader && cookieHeader.length > 0) {
            const newTokens = {
                access_token_web : cookieHeader.match(/access_token_web=([^;]+)/),
                refresh_token_web : cookieHeader.match(/refresh_token_web=([^;]+)/),
                _vinted_fr_session : cookieHeader.match(/_vinted_fr_session=([^;]+)/),
                expiry : Date.now() + 7200 * 1000,
            }
            if (newTokens.access_token_web && !this.refreshInProgress) {
                await authManager.setTokens(newTokens);
                console.log("auto-updated tokens from headers");
            }
        }
    } catch (error) {
        throw "While updating tokens from response headers: " + error;
    }
};