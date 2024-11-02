import fetch from 'node-fetch';
import UserAgent from 'user-agents';

//fetch the cookies from the vinted website to authenticate the requests
export const fetchCookie = async (domain = "fr") => {
    const response = await fetch(`https://vinted.${domain}/catalog`, {
        headers: { "user-agent": new UserAgent().toString() },
    });

    if (!response.ok) throw new Error(`Failed to fetch cookies. Status: ${response.status}`);

    const sessionCookies = response.headers.raw()["set-cookie"];
    if (!sessionCookies) throw new Error("set-cookie headers not found in the response");

    const parsedCookies = Object.fromEntries(
        sessionCookies.flatMap(cookieHeader => 
        cookieHeader.split(';').map(cookie => cookie.trim().split('=').map(part => part.trim()))
        )
    );
    const requiredCookies = ['access_token_web', 'v_udt', 'v_sid','_vinted_fr_session','anon_id'];
    const cookieHeader = requiredCookies.reduce((acc, cookie) => {
        return parsedCookies[cookie] ? `${acc}${cookie}=${parsedCookies[cookie]}; ` : acc;
    }, '');

    return cookieHeader;
};

//configure authenticated post requests
export const authorizedRequest = async (method, url, data, access_token) => {
    const response = await fetch(url, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
        },
        "body": JSON.stringify(data),
        "method": method,
        "mode": "cors"
    });
    console.log("making an authed request to "+url);
    
    if (response.headers.get('Content-Type').includes('text/html')) {
        console.log(response);
    }
    const responseData = await response.json();
    return responseData;
}

//renew user token with refresh
export const newToken = async(refresh_token, access_token) => {
    console.log('fetching new tokens');
    const body = {
        "client_id": "web",
        "scope": "user",
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    };

    try {
        const newTokens = await authorizedRequest("POST","https://www.vinted.fr/oauth/token", body, access_token);
        const expiry = (newTokens.created_at + newTokens.expires_in)*1000;
        return [newTokens.access_token, newTokens.refresh_token, expiry];
    } catch (error) {
        console.log('error refreshing tokens');
        console.error(error);
        return [null, null, null];
    }
}