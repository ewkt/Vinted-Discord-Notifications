import * as cheerio from 'cheerio';
import { authorizedRequest } from './request.js';

//fetch cookies for the domain with advancded option to have cloudfare cookie
export const fetchCookie = async (adv = false) => {
    //fetch the standard cookies
    console.log('fetching cookies');
    const response = await authorizedRequest(
        "GET", 
        `https://www.vinted.fr/how_it_works`, 
        null, 
        null, 
        null,
        false, 
        false
    );

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

    const requiredCookies = ['access_token_web', 'v_sid', 'v_udt', '_vinted_fr_session'];
    let cookieHeader = requiredCookies
        .filter(cookie => parsedCookies[cookie])
        .map(cookie => `${cookie}=${parsedCookies[cookie]}`)
        .join('; ');

    return cookieHeader;
};

//refresh the access token
export const newToken = async (refresh_token, access_token, cookies) => {
    console.log('fetching new tokens');
    const body = {
        "client_id": "web",
        "scope": "user",
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    };

    try {
        const refreshed = await authorizedRequest(
            "POST", 
            process.env.API_URL+"auth/refresh", 
            body, 
            access_token, 
            cookies, 
            true, 
            true
        );

        const expiry = (refreshed.created_at + refreshed.expires_in) * 1000;

        return [refreshed.access_token, refreshed.refresh_token, expiry];
    } catch (error) {
        console.log('error refreshing tokens');
        console.error(error);
        return [null, null, null, null];
    }
};


export const getCsrf = async (access_token, cookies) => {
    const response = await authorizedRequest(
        "GET", 
        "https://www.vinted.fr/catalog?search_text=zara&order=newest_first&per_page=10", 
        null, 
        access_token, 
        cookies, 
        true, 
        true
    );

    const html = await response.text();
    const $ = cheerio.load(html);

    try {
        const csrfToken = $('meta[name="CSRF_TOKEN"]').attr('content');
        if (!csrfToken) {
            throw new Error('CSRF token not found');
        }
        return csrfToken;
    } catch (error) {
        console.error('Exception while gathering CSRF:', error);
        throw new Error('Failed to gather CSRF token');
    }
};