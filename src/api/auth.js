import { authorizedRequest } from './request.js';

//fetch cookies for the domain with advancded option to have cloudfare cookie
export const fetchCookie = async () => {
    //fetch the standard cookies
    console.log('fetching cookies');
    const response = await authorizedRequest({
        method: "GET", 
        url: process.env.BASE_URL+"how_it_works", 
    });

    const sessionCookies = response.headers.get('set-cookie');
    if (!sessionCookies) throw new Error("set-cookie headers not found in the response");
    const cookiesArray = sessionCookies.split(',');
    const parsedCookies = cookiesArray.reduce((acc, cookieHeader) => {
        const cookies = cookieHeader.split(';').map(cookie => cookie.trim().split('=').map(part => part.trim()));
        cookies.forEach(([name, value]) => {
            acc[name] = value;
        });
        return acc;
    }, {});

    const requiredCookies = ['access_token_web', '_vinted_fr_session'];
    let cookieHeader = requiredCookies
        .filter(cookie => parsedCookies[cookie])
        .map(cookie => `${cookie}=${parsedCookies[cookie]}`)
        .join('; ');

    return cookieHeader;
};

//refresh the access token
export const newToken = async (tokens) => {
    console.log('fetching tokens');
    const body = {
        "refresh_token": tokens.refresh_token
    };

    try {
        const refreshed = await authorizedRequest({
            method: "POST", 
            url: process.env.BASE_URL+"web/api/auth/refresh", 
            data: body, 
            tokens: tokens
        });

        const expiry = (refreshed.created_at + refreshed.expires_in) * 1000;

        return [refreshed.access_token, refreshed.refresh_token, refreshed.expires_in, expiry];
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return [null, null, null, null];
    }
};

//function to fecth the CSRF token even though it seems to be a universal value
export const getCsrf = async (tokens) => {
    console.log('fetching CSRF');
    const response = await authorizedRequest({
        method: "GET", 
        url: process.env.BASE_URL+"inbox", 
        tokens: tokens, 
    });

    const html = await response.text();

    try {
        let csrfToken = html.match(/"CSRF_TOKEN":"([a-f0-9\-]+)"/i)[1];
        if (!csrfToken) {
            throw new Error('CSRF token not found');
        }
        return csrfToken;
    } catch (error) {
        console.error('Exception while gathering CSRF:', error);
        throw new Error('Failed to gather CSRF token');
    }
};