import {authorizedRequest} from "./auth.js";

//convert itemid to transactionid
export async function getTransactionId(itemId, sellerId, access_token, xcsrf_token){
    console.log("getting transaction id");
    try {
        const data = {
            "initiator": "buy",
            "item_id": itemId,
            "opposite_user_id": sellerId
        };
        const responseData = await authorizedRequest("POST","https://www.vinted.fr/api/v2/conversations", data, access_token, xcsrf_token);
        const id = responseData.conversation.transaction.id
        return id;
    } catch(error){
        console.error(error);
    }
  }

export async function payItem(transactionId, access_token, xcsrf_token){
    try {
        console.log('getting checksum')
        const article = await authorizedRequest("PUT", `https://www.vinted.fr/api/v2/transactions/${transactionId}/checkout`, undefined, access_token, xcsrf_token);

        console.log('selecting shipping point')
        const shipts = await authorizedRequest("GET", `https://www.vinted.fr/api/v2/transactions/${transactionId}/nearby_shipping_options?country_code=FR&latitude=48.9194618&longitude=2.1881309&should_label_nearest_points=true`, undefined, access_token, xcsrf_token);
        
        //select closest shipping point
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
        await authorizedRequest("PUT", `https://www.vinted.fr/api/v2/transactions/${transactionId}/checkout`, data_shipping, access_token, xcsrf_token);

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
        const buy = await authorizedRequest("POST", `https://www.vinted.fr/api/v2/transactions/${transactionId}/checkout/payment`, data_payment, access_token, xcsrf_token);
        
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