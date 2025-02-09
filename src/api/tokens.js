import fs from 'fs';
import { newToken } from './auth.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TokenManager {
    constructor(tokensPath) {
        this.tokensPath = tokensPath;
        this.tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
        this.refreshInProgress = null;
        this.schedulePreemptiveRefresh();
    }

    //schedules a refresh 2min before token expiry
    schedulePreemptiveRefresh() {
        const refreshDelay = Math.max(this.tokens.expires_in - 2, 0);
        setTimeout(async () => {
        try {
            await this.refreshIfNeeded();
        } catch (e) {
            console.error("Preemptive refresh error:", e);
        }
        this.schedulePreemptiveRefresh();
        }, refreshDelay*60000);
    }

    //double-check locking: if a refresh is already on progress, then wait on it.
    async refreshIfNeeded() {
        if (this.refreshInProgress) {
            return this.refreshInProgress;
        }
        if (this.tokens.expires_in > Date.now()) {
            return this.tokens;
        }
        this.refreshInProgress = this.performRefresh();
        await this.refreshInProgress;
        this.refreshInProgress = null;
        return this.tokens;
    }

    //updates csrf if missing, and tokens if expired.
    async performRefresh() {
        try {
            const [newAccess, newRefresh, newIn, newExpiry] = await newToken(this.tokens);
            if (newAccess != null) {
                this.tokens.access_token = newAccess;
                this.tokens.refresh_token = newRefresh;
                this.tokens.expires_in = newIn;
                this.tokens.expiry = newExpiry;
                await this.saveTokens();
            }
        } catch (error) {
        console.error("Error during performRefresh:", error);
        }
    }

    //updates token values from set-cookie headers returned by authorized requests
    updateFromResponseHeaders(headers) {
        const setCookie = headers.get('set-cookie');
        if (setCookie) {
            const newAccess = setCookie.match(/access_token_web=([^;]+)/)?.[1];
            const newRefresh = setCookie.match(/refresh_token_web=([^;]+)/)?.[1];
            if (newAccess && newRefresh) {
                this.tokens.access_token = newAccess;
                this.tokens.refresh_token = newRefresh;
                this.saveTokens();
                console.log("auto-updated tokens from headers");
            }
        }
    }

    //saves current tokens to disk asynchronously.
    async saveTokens() {
        try {
            await fs.promises.writeFile(this.tokensPath, JSON.stringify(this.tokens, null, 2));
        } catch (error) {
            console.error("Error saving tokens:", error);
        }
    }

    getTokens() {
        return this.tokens;
    }

    userAgent() {
        return this.tokens.user_agent;
    }
}

export const tokenManager = new TokenManager(path.join(__dirname, '../../config/autobuy.json'));