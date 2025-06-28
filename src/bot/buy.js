import { authorizedRequest } from "../api/make-request.js";
import { authManager } from "../api/auth-manager.js";
import { purchaseMessage } from "./post.js";

const geo = authManager.getGeoLocation();

//convert itemid to transactionid
const getTransactionIds = async (itemId, sellerId) => {
    console.log("getting transaction id");
    try {
        const data = {
            "initiator": "ask_seller",
            "item_id": itemId,
            "opposite_user_id": sellerId
        };   

        const responseData = await authorizedRequest({
            method: "POST",
            url: process.env.BASE_URL+"/api/v2/conversations", 
            data: data, 
            auth: true,
            oldUrl: process.env.BASE_URL+"/items/"+itemId+"?referrer=catalog",
        });

        const dataBuild = {
            "purchase_items": [
                {
                    "id": responseData.conversation.transaction.id,
                    "type": "transaction",
                }
            ],
        };

        const responseDataBuild = await authorizedRequest({
            method: "POST",
            url: process.env.BASE_URL+"/api/v2/purchases/checkout/build", 
            data: dataBuild, 
            auth: true 
        });

        const ids = {
            transactionId: responseData.conversation.transaction.id,
            convId: responseData.conversation.id,
            shippingId: responseData.conversation.transaction.shipping_order_id,
            checkoutId: responseDataBuild.checkout.id,
            itemId: itemId,
            conversationId: responseData.conversation.id,
            photoUrl: responseData.conversation.transaction.item_photo.url,
            title: responseData.conversation.transaction.item_title,
        };

        return ids;
    } catch(error){
        throw "While getting transaction id: " + error;
    }
}

//let user choose closest shipping point
const selectShipping = async (ids) => {
    try{
        console.log('selecting shipping point')
        const url = new URL(process.env.BASE_URL);
        const countryCode = url.hostname.split('.').pop().toUpperCase();
        const responseDataShip = await authorizedRequest({
            method: "GET", 
            url: process.env.BASE_URL+`/api/v2/shipping_orders/${ids.shippingId}/nearby_pickup_points?country_code=${countryCode}&latitude=${geo.latitude}&longitude=${geo.longitude}`,
            auth: true
        });

        const shipOps = responseDataShip.nearby_shipping_options;
        const shipPts = responseDataShip.nearby_shipping_points;
        
        //select closest shipping point and get corresponding carrier id
        const point_id = 0;
        let carrier_id = -1;
        for (let k = 0; k < shipOps.length; k++) {
            if (shipPts[point_id].point.carrier_code == shipOps[k].carrier_code) {
                carrier_id = k;
                break;
            }
        }
        const data_shipping = {
            components:{
                additional_service: {},
                payment_method: {},
                shipping: {
                    package_type_id: shipOps[carrier_id].package_type_id,
                    point_code: shipPts[point_id].point.code,
                    point_uuid: shipPts[point_id].point.uuid,
                    rate_uuid: shipOps[carrier_id].rate_uuid,
                },
                shipping_address: {}
            }
        } 
        //checkout the item with selected point and get the checksum
        console.log('checking out')
        const responseData = await authorizedRequest({
            method: "PUT",
            url: process.env.BASE_URL+`/api/v2/purchases/${ids.checkoutId}/checkout`,
            data: data_shipping, 
            auth: true
        });
        
        const priceDetail = responseData.checkout.components.order_summary_v2.subtotal.price;
        const purchaseInfo = {
            pointName: shipPts[point_id].point.name,
            pointAddress: shipPts[point_id].point.address_line1,
            carrier: shipOps[carrier_id].carrier_code,
            checksum: responseData.checkout.checksum,
            price: priceDetail.amount + priceDetail.currency_code,
            photoUrl: ids.photoUrl,
            title: ids.title,
            checkoutId: ids.checkoutId,
            itemId: ids.itemId,
            conversationId: ids.conversationId,
        }

        return purchaseInfo;
    } catch (error) {
        throw "While selecting shipping point: " + error;
    }
};

//pipeline to pay for item
const payItem = async (interaction, purchaseInfo) => {
    try {
        console.log('buying item')
        const data_payment = {
            "checksum":purchaseInfo.checksum,
            "payment_options":{
                "browser_info": {
                    "color_depth": 24,
                    "java_enabled": false,
                    "language": "en-US",
                    "screen_height": 800,
                    "screen_width": 1600,
                    "timezone_offset": -120
                },
            }
        };

        //pay for the item
        const responseData = await authorizedRequest({
            method: "POST", 
            url: process.env.BASE_URL+`/api/v2/purchases/${purchaseInfo.checkoutId}/checkout/payment`, 
            data: data_payment, 
            auth: true
        });
        
        if (responseData.payment.status == "success"){
            console.log("payment successful");
            await interaction.editReply('Purchase succesful!');
            await purchaseMessage(interaction, purchaseInfo);
        } else if (responseData.payment.status == "pending") {
            console.log("waiting for 3DS");
            const redirectUrl = responseData.action.parameters.url;
            await interaction.editReply('Waiting for 3DS confirmation', {embeds: [{title: 'Confirm payment', url: redirectUrl}]});
            await purchaseMessage(interaction, purchaseInfo);
        }
        else if (responseData.payment.status == "failed") {
            console.log("Payment failed");
        }
        else {
            console.log("Payment status: " + responseData.payment.status);
        }
    } catch(error) {
        throw "During payment: " + error;
    }
}

//function to buy an item
export const autobuy = async (interaction, itemId, sellerId) => {
    await interaction.deferReply();
    //step1: check and refresh tokens if needed
    await authManager.refreshTokens();
    try {
        //step2: get the required ids
        const ids = await getTransactionIds(itemId, sellerId);
        //step3: select shipping point
        const purchaseInfo = await selectShipping(ids);
        //step4: pay for the item
        await payItem(interaction, purchaseInfo);
    } catch (error) {
        console.error("\nError during autobuy:", error);
        interaction.editReply('Purchase failed');
    }
}