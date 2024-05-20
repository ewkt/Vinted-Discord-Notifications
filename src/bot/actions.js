import { getTransactionId, payItem } from "../api/buy.js";

export async function autobuy(interaction, itemId, sellerId, access_token, xcsrf_token, latitude, longitude){
    try {
        const transactionId = await getTransactionId(itemId, sellerId, access_token, xcsrf_token);
        if (transactionId) {
            await payItem(transactionId, access_token, xcsrf_token, latitude, longitude);
    }} catch (error) {
        console.error(error);
        interaction.reply('error');
    }
}

    // Function to refresh tokens if needed
export async function checkAndRefreshTokens() {
    if (tokens.expiry < Date.now()) {
        try {
            const [newAccessToken, newRefreshToken, newExpiry] = await newToken(tokens.refresh_token, tokens.access_token, tokens.xcsrf_token);
            // Update the tokens object
            tokens.access_token = newAccessToken;
            tokens.refresh_token = newRefreshToken;
            tokens.expiry = newExpiry;
            // Write updated tokens to file
            await fs.promises.writeFile('tokens.json', JSON.stringify(tokens));
        } catch (err) {
            console.error('Error refreshing tokens:', err);
        }
    }
}
