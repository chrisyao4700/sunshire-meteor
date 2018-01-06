var express = require('express');
var router = express.Router();
var api = require('../modules/app_socket');
var functions = require('../modules/cy_functions');

/* GET home page. */
router.get('/', function (req, res, next) {
    //console.log('I AM WORKING!!!!');
    //console.log(req.cookies);
    req.session.hints = null;
    if (!req.session.segIndex) {
        req.session.segIndex = 0;
    }
    if (!req.session.segMax) {
        req.session.segMax = 0;
    }

    refreshPage(null, req, res);

});

router.post('/submit', function (req, res, next) {
    console.log(req.body);
    req.session.hints = null;
    var pre_order_id = req.body.pre_order_id;
    if (pre_order_id && pre_order_id !== "") {
        req.session.pre_order_id = pre_order_id;
    }
    if (req.body.service_code === 'confirm_location') {
        sunshireUpdateLocationAndTime(req.body, function (data) {
            if (data.status === true) {
                sunshireGetPriceQuote({
                    pre_order_id: pre_order_id
                }, function (price_data) {
                    console.log(price_data);
                    if (price_data.status === true) {
                        req.session.segIndex = 1;
                        if (req.session.segMax < 1) {
                            req.session.segMax = 1;
                        }
                        refreshPage(req.body.pre_order_id, req, res);
                    } else {
                        req.session.hints = [price_data.message];
                        if(price_data.to_price_data){
                            if(price_data.to_price_data.status === false){
                                req.session.hints.push('TO TRIP - ' +price_data.to_price_data.message);
                            }
                        }
                        if(price_data.return_price_data){
                            if(price_data.return_price_data.status === false){
                                req.session.hints.push('RETURN TRIP - '+ price_data.return_price_data.message);
                            }
                        }
                        refreshPage(req.body.pre_order_id, req, res);
                    }

                }, function (price_err) {
                    console.log(price_err);
                    res.redirect('/');
                });

            } else {
                req.session.hints = [data.message];
                refreshPage(req.body.pre_order_id, req, res);
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });
    }
    if (req.body.service_code === 'create_return_trip') {
        sunshireUpdateLocationAndTime(req.body, function (data) {
            // console.log('UPDATE TRIP');
            // console.log(data);
            if (data.status === true) {

                api.appSendNormalRequest(api.appPrepareUploadPack('create_return_trip', {
                    pre_trip_id: req.body.to_trip_id
                }), function (return_data) {
                    // console.log('CREATED PRE-TRIP');
                    // console.log(return_data);
                    req.session.segIndex = 0;
                    if (return_data.status === true) {
                        //SUCCESS
                        refreshPage(pre_order_id, req, res);
                    } else {
                        req.session.hints = [return_data.message];
                        refreshPage(pre_order_id, req, res);
                    }
                }, function (err) {
                    console.log(err);
                    res.redirect('/');
                });
            } else {
                req.session.hints = [data.message];
                refreshPage(req.body.pre_order_id, req, res);
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });

    }
    if (req.body.service_code === 'remove_return_trip') {
        sunshireUpdateLocationAndTime(req.body, function (data) {
            if (data.status === true) {

                api.appSendNormalRequest(api.appPrepareUploadPack('remove_return_trip', {
                    id: pre_order_id ? pre_order_id : req.session.pre_order_id
                }), function (data) {
                    req.session.segIndex = 0;
                    if (data.status === true) {
                        //SUCCESS
                        refreshPage(pre_order_id, req, res);
                    } else {
                        req.session.hints = [data.message];
                        refreshPage(pre_order_id, req, res);
                    }
                }, function (err) {
                    console.log(err);
                    res.redirect('/');
                });
            } else {
                req.session.hints = [data.message];
                refreshPage(req.body.pre_order_id, req, res);
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });

    }
    if (req.body.service_code === 'vehicle_type') {
        api.appSendNormalRequest(api.appPrepareUploadPack('update_pretrip_vehicle', {
            vehicle_type: req.body.type,
            pre_order_id: pre_order_id,
            pre_trip_id: req.body.pre_trip_id
        }), function (data) {
            console.log(data);
            if (data.status === true) {
                req.session.segIndex = 1;
                req.session.segMax = 1;
                refreshPage(pre_order_id, req, res);

            } else {
                req.session.segIndex = 1;
                req.session.segMax = 1;
                req.session.hints = [data.message];
                refreshPage(pre_order_id, req, res);
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });
    }
    if (req.body.service_code === 'back_to_location') {
        req.session.segIndex = 0;
        req.session.segMax = 1;
        refreshPage(pre_order_id, req, res);
    }
    if (req.body.service_code === 'confirm_price') {
        req.session.segIndex = 2;
        req.session.segMax = 2;
        refreshPage(pre_order_id, req, res);
    }
    if (req.body.service_code === 'back_to_service') {
        req.session.segIndex = 1;
        req.session.segMax = 2;
        refreshPage(pre_order_id, req, res);
    }
    if (req.body.service_code === 'confirm_contact') {

        api.appSendNormalRequest(api.appPrepareUploadPack('preorder_update_customer', {
            pre_order_id: pre_order_id,
            customer: {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email
            },
            note: req.body.note
        }), function (data) {
            console.log(data);
            if (data.status === true) {
                req.session.segIndex = 3;
                req.session.segIndex = 3;
                refreshPage(pre_order_id, req, res);
            } else {
                req.session.hints = [data.message];
                refreshPage(pre_order_id, req, res);
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });
    }
    if (req.body.service_code === 'back_to_contact') {
        req.session.segIndex = 2;
        req.session.segMax = 3;
        refreshPage(pre_order_id, req, res);

    }
    if (req.body.service_code === 'confirm_payment') {
        api.appSendPaymentRequest(api.appPrepareUploadPack('make_payment', {
            payment_method_nonce: req.body.paymentMethodNonce,
            pre_order_id: pre_order_id ? pre_order_id : req.session.pre_order_id
        }), function (data) {
            console.log(data);
            res.send(data);

        }, function (err) {
            console.log(err);
            res.redirect('/');
        })
    }
    if (req.body.service_code === 'apply_coupon') {
        api.appSendNormalRequest(api.appPrepareUploadPack('apply_coupon',req.body), function (data) {
            console.log(data);
           if(data.status === true){
               refreshPage(pre_order_id,req,res);
           } else{
               req.session.hints=[data.message];
               refreshPage(pre_order_id,req,res);
           }
        },function (err) {
            console.log(err);
            res.redirect('/');
        });
    }

});


function refreshPage(pre_order_id, req, res) {

    var payment_token = null;
    if (req.session.segIndex === 3) {
        payment_token = getPaymentToken();
    }
    if (!pre_order_id) {
        if (req.cookies.pre_order_id) {
            sunshireGetPreOrder(req.cookies.pre_order_id, function (data) {
                if (data.status === true) {
                    // var pre_order = data.record;
                    // var to_trip = pre_order.to_trip.record;
                    // console.log(to_trip);

                    res.render('price', {
                        title: 'Sunshire Meteor',
                        pageName: 'Home',
                        pre_order: data.record,
                        segIndex: req.session.segIndex,
                        segMax: req.session.segMax,
                        hints: req.session.hints,
                        payment_token: payment_token
                    });
                } else {
                    //alert(data.message);
                    //console.log(data);
                    res.redirect('/');
                }
            }, function (err) {
                // alert(err);
                console.log(err);
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }

    } else {
        sunshireGetPreOrder(pre_order_id, function (data) {
            if (data.status === true) {
                // var pre_order = data.record;
                // var to_trip = pre_order.to_trip.record;
                // console.log(to_trip);
                res.render('price', {
                    title: 'Sunshire Meteor',
                    pageName: 'Home',
                    pre_order: data.record,
                    segIndex: req.session.segIndex,
                    segMax: req.session.segMax,
                    hints: req.session.hints,
                    payment_token: payment_token

                });
            } else {
                //alert(data.message);
                //console.log(data);
                res.redirect('/');
            }
        }, function (err) {
            // alert(err);
            console.log(err);
            res.redirect('/');
        })
    }
}

router.post('/', function (req, res, next) {
    req.session.hints = null;
    if (!req.segIndex) {
        req.session.segIndex = 0;
    }
    if (!req.segMax) {
        req.session.segMax = 0;
    }

    var pre_order_id = req.body.pre_order_id;
    refreshPage(pre_order_id, req, res);

});


function sunshireGetPreOrder(pre_order_id, success, fail) {
    api.appSendNormalRequest(api.appPrepareUploadPack("find_pre_order", {
        id: pre_order_id
    }), success, fail);
}

function preparePreTripUpdatePack(data) {
    var to_trip = {
        id: data.to_trip_id,
        location_from: data.toTrip_location_from,
        location_to: data.toTrip_location_to,
        pickup_time: functions.combineDateAndTime(data.toTrip_pickup_date, data.toTrip_pickup_time),
        flight_num: data.toTrip_flight_num
    };

    var pack = {
        pre_order_id: data.pre_order_id,
        to_trip: to_trip
    };
    if (data.return_trip_id) {
        var trip = {
            id: data.return_trip_id,
            location_from: data.returnTrip_location_from,
            location_to: data.returnTrip_location_to,
            pickup_time: functions.combineDateAndTime(data.returnTrip_pickup_date, data.returnTrip_pickup_time),
            flight_num: data.returnTrip_flight_num
        };
        pack.return_trip = trip;
    }
    //console.log(pack);
    return pack;
}

function sunshireUpdateLocationAndTime(pack, success, fail) {
    api.appSendNormalRequest(api.appPrepareUploadPack('update_pretrip_location', preparePreTripUpdatePack(pack)), success, fail);
}

function sunshireGetPriceQuote(pack, success, fail) {
    api.appSendNormalRequest(api.appPrepareUploadPack('get_preorder_price', {
        pre_order_id: pack.pre_order_id
    }), success, fail);
}

function getPaymentToken() {
    //return 'MIIBCgKCAQEAv54tDgj7JGah5QikDLjS9Z0i2oxX6k6IryAhRu4JwbboZ4jUVcwZ7L+dIOtbTAcHSl4arwZxY5zsruqKE2V17RSL9rgJKhpkic6WqV2UcBLhFHj7iYPY0R9Rn0v45lofMYtozagBCMjjvpp8f0yl+GzEJHhC5AdJ+jlyQMEHT56PmvDflzgQKRvF0Hy6TdEt7/qWRhRqyYV9DLg0yVEMHivVFEBRewG6lfWZ6LOWZ3pAvKKnoJkrUAbOtMmWwqasL8Mjam4hUNVCmGVyXEVhFeictKj8fEp29rVTQcaDKi+oEQcBsp+RwNHah1oxWfWlibn0Xk8yGQcBbu+uLOL8YwIDAQAB';
    return 'production_7383h4b5_th6m2z8qfjsvwpb4';
}

// router.post('/', function(req, res, next){
//     res.render
// });


module.exports = router;
