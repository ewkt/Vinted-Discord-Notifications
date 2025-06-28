import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class authenticationManager {
    constructor(basePath) {
        this.cookiesPath = basePath + "cookies.json";
        this.cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf-8'));
    }

    //saves current cookies to disk asynchronously.
    async saveCookies() {
        try {
            await fs.promises.writeFile(this.cookiesPath, JSON.stringify(this.cookies, null, 2));
        } catch (error) {
            console.error("\nError saving cookies:", error);
        }
    }

    async setCookies(cookies) {
        this.cookies = cookies;
        await this.saveCookies();
    }

    getCookies() {
        const cookieMapping = {
            refresh_token_web: this.cookies.refresh,
            access_token_web: this.cookies.access,
            _vinted_fr_session: this.cookies.vinted,
        };
        return cookieMapping;
    }
}

export const authManager = new authenticationManager(path.join(__dirname, '../../config/'));