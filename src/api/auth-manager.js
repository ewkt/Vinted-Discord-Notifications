import fs from 'fs';
import path from 'path';

import { fetchTokens } from './fetch-auth.js';
import { fileURLToPath } from 'url';

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
        } catch (error) {
            console.error("\nError while refreshing tokens:", error);
        } finally {
            this.refreshInProgress = null;
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

    async setCookies(cookies) {
        this.cookies = cookies;
        await this.saveCookies();
    }

    async setTokens(newTokens) {
        this.tokens = { ...this.tokens, ...newTokens };
        await this.saveTokens();
    }

    getXAnonId() {
        return this.xAnonId;
    }

    getTokens() {
        const tokenMapping = {
            access_token_web: this.tokens.access_token_web,
            refresh_token_web: this.tokens.refresh_token_web,
            _vinted_fr_session: this.tokens._vinted_fr_session,
        };
        return tokenMapping;
    }

    getCookies() {
        const cookieMapping = {
            refresh_token_web: this.cookies.refresh,
            access_token_web: this.cookies.access,
            _vinted_fr_session: this.cookies.vinted,
        };
        return cookieMapping;
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