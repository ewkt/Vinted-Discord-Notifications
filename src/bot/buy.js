import {getCsrf, newToken} from "../api/auth.js";
import {authorizedRequest} from "../api/request.js";
import fs from 'fs';

//function to refresh tokens if needed
const checkAndRefreshTokens = async(tokens) => {
    if (!csrf_token) {
        tokens.csrf_token = await getCsrf(tokens.access_token, null);
    }
    if (tokens.expiry < Date.now()) {
        try {
            const [newAccessToken, newRefreshToken, newExpiry] = await newToken(tokens.refresh_token, tokens.access_token);
            //update the tokens object
            tokens.access_token = newAccessToken;
            tokens.refresh_token = newRefreshToken;
            tokens.expiry = newExpiry;
            //write updated tokens to file
            await fs.promises.writeFile('../../config/autobuy.json', JSON.stringify(tokens, null, 2));
        } catch (err) {
            console.error('Error refreshing tokens:', err);
        }
    }
}

//convert itemid to transactionid
const getTransactionId = async (itemId, sellerId, tokens) => {
    console.log("getting transaction id");
    try {
        const data = {
            "initiator": "buy",
            "item_id": itemId,
            "opposite_user_id": sellerId
        };

        const responseData = await authorizedRequest(
            "POST",
            process.env.API_URL+"conversations", 
            data, 
            tokens, 
            null, 
            c= false, 
            t= true
        );

        const id = responseData.conversation.transaction.id
        return id;
    } catch(error){
        console.error(error);
    }
  }

//pipeline to pay for item
const payItem = async (transactionId, tokens) => {
    try {
        console.log('selecting shipping point')
        const shipts = await authorizedRequest(
            "GET", 
            process.env.API_URL+`transactions/${transactionId}/nearby_shipping_options?country_code=FR&latitude=${tokens.latitude}&longitude=${tokens.longitude}&should_label_nearest_points=true`,
            undefined, 
            tokens, 
            null, 
            false, 
            true
        );
        
        //select closest shipping point and get corresponding carrier id
        const point_id = 0;
        let carrier_id = -1;
        for (let k = 0; k < shipts.nearby_shipping_options.length; k++) {
            if (shipts.nearby_shipping_points[point_id].point.carrier_id == shipts.nearby_shipping_options[k].carrier_id) {
                carrier_id = k;
                break;
            }
        }
        const data_shipping = {
            "transaction": {
                "shipment": {
                    "package_type_id": shipts.nearby_shipping_options[carrier_id].id,
                    "pickup_point_code": shipts.nearby_shipping_points[point_id].point.code,
                    "point_uuid": shipts.nearby_shipping_points[point_id].point.uuid,
                    "rate_uuid": shipts.nearby_shipping_options[carrier_id].rate_uuid,
                    "root_rate_uuid": shipts.nearby_shipping_options[carrier_id].root_rate_uuid
                }
            }
        };

        //checkout the item and get the checksum
        console.log('checking out')
        const article = await authorizedRequest(
            "PUT",
            process.env.API_URL+`transactions/${transactionId}/checkout`,
            data_shipping, 
            tokens, 
            null, 
            false, 
            true
        );

        console.log('buying item')
        const data_payment = {
            "browser_attributes": {
                "color_depth": 24,
                "java_enabled": false,
                "language": "en-US",
                "screen_height": 800,
                "screen_width": 1600,
                "timezone_offset": -120
            },
            "checksum":article.checkout.checksum
        };

        //pay for the item
        const buy = await authorizedRequest(
            "POST", 
            process.env.API_URL+`transactions/${transactionId}/checkout/payment`, 
            data_payment, 
            tokens, 
            null, 
            false, 
            true
        );
        
        if (buy.debit_status == 40){
            console.log("Payment successful");
        } else if (buy.debit_status == 20) {
            console.log("waiting for 3DS");
            console.log(buy);
        }
        else {
            console.log("Payment failed");
        }
    } catch(error) {
        console.error(error);
    }
}

//function to buy an item
export const autobuy = async (interaction, itemId, sellerId, tokens) => {
    //step1: check and refresh tokens if needed
    await checkAndRefreshTokens(tokens);
    tokens = JSON.parse(fs.readFileSync('../../config/autobuy.json'));
    try {
        //step2: get the transaction id
        const transactionId = await getTransactionId(itemId, sellerId, tokens);
        if (transactionId) {
            //step3: pay for the item
            await payItem(transactionId, tokens);
    }} catch (error) {
        console.error(error);
        interaction.reply('error');
    }
}