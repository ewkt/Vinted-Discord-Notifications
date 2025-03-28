import { authorizedRequest } from './request.js';

//fetch cookies for the domain with advanced option to have cloudflare cookie
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