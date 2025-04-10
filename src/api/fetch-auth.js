import { authorizedRequest } from './make-request.js';
import { authManager } from './auth-manager.js';

//fetch cookies for the search session with no privileges
export const fetchCookies = async () => {
    console.log('fetching cookies');
    try{
        const response = await authorizedRequest({
            method: "GET", 
            url: process.env.BASE_URL+"/how_it_works",
            search: true
        });
        
        const xAnonId = response.headers.get('x-anon-id') || null;
        if (xAnonId) {
            authManager.setXAnonId(xAnonId);
        }
    
        const sessionCookiesArray = response.headers.raw()['set-cookie'];
        if (!sessionCookiesArray || sessionCookiesArray.length === 0) {
            throw new Error("Set-Cookie headers not found in the response");
        }
        
        //get all set-cookies and extract their values to construct the cookie string
        const cookieHeader = sessionCookiesArray
            .map(cookie => cookie.split(';')[0].trim())
            .join('; ');

        const cookieObject = {
            refresh: cookieHeader.match(/refresh_token_web=([^;]+)/)[1],
            access: cookieHeader.match(/access_token_web=([^;]+)/)[1]
        }
        authManager.setCookies(cookieObject);
    } catch (error) {
        throw new Error("Error fetching cookies: " + error);
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

        const expiry = (responseData.created_at + responseData.expires_in) * 1000;
        authManager.setTokens({newAccess: responseData.access_token, newRefresh: responseData.refresh_token, newExpiry: expiry});
    } catch (error) {
        throw new Error("Error fetching tokens: " + error);
    }
};