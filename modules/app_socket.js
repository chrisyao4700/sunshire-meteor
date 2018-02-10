// const mysql = require('mysql');
//var md5 = require('md5');
const request = require('request');
//
// var pool = mysql.createPool({
//     connectionLimit: 4,
//     host: "sunshire-web-db.cuvnsskekykr.us-east-1.rds.amazonaws.com",
//     user: "chrisyao4700",
//     password: "19900908",
//     database: "sunshire_cloud"
// });

function performQuery(query, success, fail) {

    pool.query(query, function (err, result, fields) {
        if (err) {
            if (fail) {
                fail(err);
            }
        } else {
            if (success) {
                success(result, fields);
            }
        }
    });
}

function prepareUploadPack(service_code, data_pack) {
    return {
        json: {
            "service_code": service_code,
            "api_key": "chrisyao19900908",
            "version_code": "web.node.1.001",
            "data_pack": data_pack
        }
    };
}



function sendNormalRequest(pack, success, fail){
    // console.log('UPLOAD PACK');
    // console.log(pack);
    request.post(
        'https://sunshireshuttle.com/chrisyao4701/app_socket.php',
        pack,
        function (error, response, body) {
            //console.log('SEARCH FLIGHT SENDING PACKAGE');
            //console.log(response);
            if (!error && response.statusCode === 200) {

                success(body);
            } else {
                fail(error);
            }
        }
    );
}
function sendPaymentRequest(pack,success, fail) {
    request.post(
        'https://sunshireshuttle.com/chrisyao4701/app_payment.php',
        pack,
        function (error, response, body) {
            //console.log('SEARCH FLIGHT SENDING PACKAGE');
            //console.log(response);
            if (!error && response.statusCode === 200) {
                success(body);
            } else {
                fail(error);
            }
        }
    );
}

module.exports.appPerformQuery = performQuery;
module.exports.appSendNormalRequest = sendNormalRequest;
module.exports.appSendPaymentRequest = sendPaymentRequest;
module.exports.appPrepareUploadPack =prepareUploadPack;