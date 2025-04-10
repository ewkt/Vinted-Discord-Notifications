import { authorizedRequest } from "../api/make-request.js";
import { authManager } from "../api/auth-manager.js";
import { purchaseMessage } from "./post.js";

const geo = authManager.getGeoLocation();

//convert itemid to transactionid
const getTransactionId = async (itemId, sellerId) => {
    console.log("getting transaction id");
    try {
        const data = {
            "initiator": "buy",
            "item_id": itemId,
            "opposite_user_id": sellerId
        };
        const responseData = await authorizedRequest({
            method: "POST",
            url: process.env.BASE_URL+"/api/v2/conversations", 
            data: data, 
            auth: true 
        });
        const id = responseData.conversation.transaction.id
        const convId = responseData.conversation.id
        return [id, convId];
    } catch(error){
        throw new Error("while getting transaction id: " + error);
    }
  }

//pipeline to pay for item
const payItem = async (interaction, itemId, transactionId, conversationId) => {
    try {
        console.log('selecting shipping point')
        const url = new URL(process.env.BASE_URL);
        const countryCode = url.hostname.split('.').pop().toUpperCase();
        let responseData = await authorizedRequest({
            method: "GET", 
            url: process.env.BASE_URL+`/api/v2/transactions/${transactionId}/nearby_shipping_options?country_code=${countryCode}&latitude=${geo.latitude}&longitude=${geo.longitude}&should_label_nearest_points=true`,
            auth: true
        });

        const shipOps = responseData.nearby_shipping_options;
        const shipPts = responseData.nearby_shipping_points;
        
        //select closest shipping point and get corresponding carrier id
        const point_id = 0;
        let carrier_id = -1;
        for (let k = 0; k < shipOps.length; k++) {
            if (shipPts[point_id].point.carrier_id == shipOps[k].carrier_id) {
                carrier_id = k;
                break;
            }
        }
        const data_shipping = {
            "transaction": {
                "shipment": {
                    "package_type_id": shipOps[carrier_id].id,
                    "pickup_point_code": shipPts[point_id].point.code,
                    "point_uuid": shipPts[point_id].point.uuid,
                    "rate_uuid": shipOps[carrier_id].rate_uuid,
                    "root_rate_uuid": shipOps[carrier_id].root_rate_uuid
                }
            }
        };
        const purchaseInfo = {
            pointName: shipPts[point_id].point.name,
            pointAddress: shipPts[point_id].point.address_line_1,
            carrier: shipOps[carrier_id].carrier_code,
            itemId: itemId,
            conversationId: conversationId
        }

        //checkout the item and get the checksum
        console.log('checking out')
        responseData = await authorizedRequest({
            method: "PUT",
            url: process.env.BASE_URL+`/api/v2/transactions/${transactionId}/checkout`,
            data: data_shipping, 
            auth: true
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
            "checksum":responseData.checkout.checksum
        };

        //pay for the item
        responseData = await authorizedRequest({
            method: "POST", 
            url: process.env.BASE_URL+`/api/v2/transactions/${transactionId}/checkout/payment`, 
            data: data_payment, 
            auth: true
        });
        
        if (responseData.debit_status == 40){
            console.log("payment successful");
            await interaction.editReply('Purchase succesful!');
            await purchaseMessage(interaction, purchaseInfo);
        } else if (responseData.debit_status == 20) {
            console.log("waiting for 3DS");
            const redirectUrl = responseData.pay_in_redirect_url;
            await interaction.editReply('Waiting for 3DS confirmation', {embeds: [{title: 'Confirm payment', url: redirectUrl}]});
            await purchaseMessage(interaction, purchaseInfo);
        }
        else {
            console.log("Payment failed");
        }
    } catch(error) {
        throw new Error("while during payment: " + error);
    }
}

//function to buy an item
export const autobuy = async (interaction, itemId, sellerId) => {
    await interaction.deferReply();
    //step1: check and refresh tokens if needed
    await authManager.refreshTokens();
    try {
        //step2: get the transaction id
        const [transactionId, conversationId] = await getTransactionId(itemId, sellerId);
        if (transactionId) {
            //step3: pay for the item
            await payItem(interaction, itemId, transactionId, conversationId);
        }
    } catch (error) {
        console.error("\nError during autobuy:", error);
        interaction.reply('error');
    }
}