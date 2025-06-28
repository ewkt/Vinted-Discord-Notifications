import fs from 'fs';
import path from 'path';

import { fetchTokens } from './fetch-auth.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class authenticationManager {
    constructor(basePath) {
        this.tokensPath = basePath + "autobuy.json";
        this.cookiesPath = basePath + "cookies.json";
        this.tokens = JSON.parse(fs.readFileSync(this.tokensPath, 'utf-8'));
        this.cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf-8'));
        this.refreshInProgress = null;
        this.xAnonId = null;
    }

    //updates the tokens with double-check locking
    async refreshTokens() {
        try {
            if (this.refreshInProgress) {
                return;
            }
            if (this.tokens.expiry > Date.now()) {
                return;
            }

            this.refreshInProgress = true;
            await fetchTokens(this.tokens);
            await this.saveTokens();
        } catch (error) {
            console.error("\nError while refreshing tokens:", error);
        } finally {
            this.refreshInProgress = null;
        }
    }

    //updates token values from set-cookie headers returned by authorized requests
    async updateFromResponseHeaders(headers) {
        const cookieHeader = headers.raw()['set-cookie'].join('; ');
        if (cookieHeader && cookieHeader.length > 0) {
            const access_token = cookieHeader.match(/access_token_web=([^;]+)/);
            const refresh_token = cookieHeader.match(/refresh_token_web=([^;]+)/);
            if (access_token && refresh_token && !this.refreshInProgress) {
                this.setTokens({newAccess: access_token, newRefresh: refresh_token});
                console.log("auto-updated tokens from headers");
            }
        }
    }

    //saves current tokens to disk asynchronously.
    async saveTokens() {
        try {
            await fs.promises.writeFile(this.tokensPath, JSON.stringify(this.tokens, null, 2));
        } catch (error) {
            console.error("\nError saving tokens:", error);
        }
    }

    //saves current cookies to disk asynchronously.
    async saveCookies() {
        try {
            await fs.promises.writeFile(this.cookiesPath, JSON.stringify(this.cookies, null, 2));
        } catch (error) {
            console.error("\nError saving cookies:", error);
        }
    }

    setXAnonId(xAnonId) {
        this.xAnonId = xAnonId;
    }

    setCookies(cookies) {
        this.cookies = cookies;
    }

    setTokens({newAccess, newRefresh, newExpiry = null}) {
        this.tokens.access_token = newAccess;
        this.tokens.refresh_token = newRefresh;
        if (newExpiry) {
            this.tokens.expiry = newExpiry;
        }
    }

    getXAnonId() {
        return this.xAnonId;
    }

    getTokens() {
        return this.tokens;
    }

    getCookies() {
        return this.cookies;
    }

    getUserAgent() {
        return this.tokens.user_agent;
    }

    getGeoLocation() {
        const geo = {
            latitude: this.tokens.latitude,
            longitude: this.tokens.longitude
        };
        return geo;
    }
}

export const authManager = new authenticationManager(path.join(__dirname, '../../config/'));