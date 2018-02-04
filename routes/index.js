var express = require('express');
var router = express.Router();
var api = require('../modules/app_socket');
var functions = require('../modules/cy_functions');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Sunshire Meteor',
        pageName: 'Home'
    });
});
router.get('/success', function (req, res, next) {
    res.render('success', {
        title: 'Sunshire Meteor',
        pageName: 'Home',
        pre_order_id: req.cookies.pre_order_id
    });
});

router.post('/submit', function (req, res, next) {
    console.log(req.body);
    if (req.body.service_code === 'airport') {
        api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_order", {}), function (data) {
            if (data.status === true) {
                //console.log(data);
                req.session.pre_order_id = data.record.id;
                res.cookie('pre_order_id', data.record.id, {maxAge: 900000});
                req.session.segIndex = 0;
                req.session.segMax = 0;

                api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_trip", prepareAirportPackage(data.record.id, req.body)),
                    function (pre_trip_data) {
                        if (pre_trip_data.status === true) {
                            //console.log(pre_trip_data);
                            res.redirect('/price');
                        } else {
                            console.log(pre_trip_data.message);
                            res.redirect('/');
                        }
                    }, function (err) {
                        console.log(err);
                        res.redirect('/');
                    });
            } else {
                console.log(data.message);
                res.redirect('/');
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });
    }
    if (req.body.service_code === 'p2p') {
        api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_order", {}), function (data) {
            if (data.status === true) {
                //console.log(data);
                req.session.pre_order_id = data.record.id;
                res.cookie('pre_order_id', data.record.id, {maxAge: 30000});
                req.session.segIndex = 0;
                req.session.segMax = 0;

                api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_trip", prepareAirportPackage(data.record.id, req.body)),
                    function (pre_trip_data) {
                        if (pre_trip_data.status === true) {
                            //console.log(pre_trip_data);
                            res.redirect('/price');
                        } else {
                            console.log(pre_trip_data.message);
                            res.redirect('/');
                        }
                    }, function (err) {
                        console.log(err);
                        res.redirect('/');
                    });
            } else {
                console.log(data.message);
                res.redirect('/');
            }
        }, function (err) {
            console.log(err);
            res.redirect('/');
        });
    }

});

function prepareAirportPackage(pre_order_id, data) {

    var result = {};
    if (data.is_pickup === '1') {
        result = {
            pre_order_id: pre_order_id,
            location_from: data.airport_address,
            location_to: data.customer_address,
            pickup_time: functions.combineDateAndTime(functions.formateDate(data.pickup_date), data.pickup_time),
            is_pickup: data.is_pickup,
            trip_type: 'to_trip'
        };
    }
    if (data.is_pickup === '0') {
        result = {
            pre_order_id: pre_order_id,
            location_from: data.customer_address,
            location_to: data.airport_address,
            pickup_time: functions.combineDateAndTime(functions.formateDate(data.pickup_date), data.pickup_time),
            is_pickup: data.is_pickup,
            trip_type: 'to_trip'
        };
    }
    if (data.is_pickup === '2') {
        result = {
            pre_order_id: pre_order_id,
            location_from: data.p2p_org,
            location_to: data.p2p_des,
            pickup_time: functions.combineDateAndTime(functions.formateDate(data.pickup_date), data.pickup_time),
            is_pickup: 1,
            trip_type: 'to_trip'
        };
    }

    return result;
}


module.exports = router;
