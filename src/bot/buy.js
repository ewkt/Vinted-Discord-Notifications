import { authorizedRequest } from "../api/request.js";
import { tokenManager } from "../api/tokens.js";
import { purchaseMessage } from "./post.js";

//convert itemid to transactionid
const getTransactionId = async (itemId, sellerId, userTokens) => {
    console.log("getting transaction id");
    try {
        const data = {
            "initiator": "buy",
            "item_id": itemId,
            "opposite_user_id": sellerId
        };
        const responseData = await authorizedRequest({
            method: "POST",
            url: process.env.BASE_URL+"api/v2/conversations", 
            data: data, 
            tokens: userTokens 
        });
        const id = responseData.conversation.transaction.id
        const convId = responseData.conversation.id
        return [id, convId];
    } catch(error){
        console.error(error);
    }
  }

//pipeline to pay for item
const payItem = async (interaction, itemId, transactionId, conversationId, userTokens) => {
    try {
        console.log('selecting shipping point')
        const shipts = await authorizedRequest({
            method: "GET", 
            url: process.env.BASE_URL+`api/v2/transactions/${transactionId}/nearby_shipping_options?country_code=FR&latitude=${userTokens.latitude}&longitude=${userTokens.longitude}&should_label_nearest_points=true`,
            tokens: userTokens
        });
        
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
        const purchaseInfo = {
            pointName: shipts.nearby_shipping_points[point_id].point.name,
            pointAddress: shipts.nearby_shipping_points[point_id].point.address_line_1,
            carrier: shipts.nearby_shipping_options[carrier_id].carrier_code,
            itemId: itemId,
            conversationId: conversationId
        }

        //checkout the item and get the checksum
        console.log('checking out')
        const article = await authorizedRequest({
            method: "PUT",
            url: process.env.BASE_URL+`api/v2/transactions/${transactionId}/checkout`,
            data: data_shipping, 
            tokens: userTokens 
        });

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
        const buy = await authorizedRequest({
            method: "POST", 
            url: process.env.BASE_URL+`api/v2/transactions/${transactionId}/checkout/payment`, 
            data: data_payment, 
            tokens: userTokens 
        });
        
        if (buy.debit_status == 40){
            console.log("payment successful");
            await interaction.editReply('Purchase succesful!');
            await purchaseMessage(interaction, purchaseInfo);
        } else if (buy.debit_status == 20) {
            console.log("waiting for 3DS");
            const redirectUrl = buy.pay_in_redirect_url;
            await interaction.editReply('Waiting for 3DS confirmation', {embeds: [{title: 'Confirm payment', url: redirectUrl}]});
            await purchaseMessage(interaction, purchaseInfo);
        }
        else {
            console.log("Payment failed");
        }
    } catch(error) {
        console.error("Error in buying process", error);
    }
}

//function to buy an item
export const autobuy = async (interaction, itemId, sellerId) => {
    await interaction.deferReply();
    //step1: check and refresh tokens if needed
    await tokenManager.refreshIfNeeded();
    let tokens = tokenManager.getTokens();
    try {
        //step2: get the transaction id
        const [transactionId, conversationId] = await getTransactionId(itemId, sellerId, tokens);
        if (transactionId) {
            //step3: pay for the item
            let tokens = tokenManager.getTokens();
            await payItem(interaction, itemId, transactionId, conversationId, tokens);
        }
    } catch (error) {
        console.error("Error during autobuy:", error);
        interaction.reply('error');
    }
}