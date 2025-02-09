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