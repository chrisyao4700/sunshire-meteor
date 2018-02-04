var express = require('express');
var router = express.Router();

//const moment = require('moment');

var flight_list = [];


const api = require('../modules/app_socket');


router.post('/recent-flight', function (req, res) {
    // console.log('FLIGHT PACK');
    // console.log(flight_pack);
    api.appSendNormalRequest(api.appPrepareUploadPack("recent_flight", {}), function (data) {
        //console.log(data);
        var results = {
            records: handleReceivedFlightData(data)
        };
        //console.log(results);

        res.send(results);
    }, function (error_text) {
        console.log('RECENT-FLIGHT FAIL CONNECTION FAIL ' + error_text);
    });

});

router.post('/search-flight', function (req, res) {
    //console.log(req.body);
    api.appSendNormalRequest(parseFlightInfo("search_flight", req.body), function (data) {
        if (data.status === true) {
            flight_list = data.records;
            res.render('flights', {
                title: 'Sunshire Meteor',
                pageName: 'Flights',
                pageMode: 'flight_result',
                flightList: data.records
            });
        } else {
            if (data.message === 'NO RESULT FOUND') {
                api.appSendNormalRequest(parseFlightInfo("search_future_flight", req.body), function (future_data) {
                    // console.log('FUTURE FLIGHT');
                    // console.log(future_data);

                    if (future_data.status === true) {
                        res.render('flights', {
                            title: 'Sunshire Meteor',
                            pageName: 'Flights',
                            pageMode: 'flight_result',
                            flightList: handleReceivedFutureFlightData(future_data.records)
                        });
                    } else {
                        res.render('flights', {
                            title: 'Sunshire Meteor',
                            pageName: 'Flights',
                            pageMode: 'flight_result',
                            flightList: []
                        });
                    }

                }, function (future_err) {
                    console.log(future_err);
                });

            } else {
                res.render('flights', {
                    title: 'Sunshire Meteor',
                    pageName: 'Flights',
                    pageMode: 'flight_result',
                    flightList: []
                });
            }
        }

    }, function (err) {
        console.log(err);
    })

});

router.post('/select-flight', function (req, res) {
    api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_order", {}), function (data) {
        if (data.status === true) {
            req.session.pre_order_id = data.record.id;
            res.cookie('pre_order_id', data.record.id, {maxAge: 300000});
            res.send({
                status: true,
                message: 'PRE-ORDER STORED',
                pre_order_id: data.record.id
            });
        }
    }, function (err) {
        console.log(err);
    });

});
router.post('/select-service', function (req, res) {
    //console.log(req.body);
    //CREATE PRE-TRIP
    //api.appPerformQuery();
    var pre_order_id = req.body.pre_order_id;
    if (!pre_order_id) {
        pre_order_id = req.session.pre_order_id;
    } else {
        req.session.pre_order_id = pre_order_id;
    }
    api.appSendNormalRequest(api.appPrepareUploadPack("create_pre_trip", {
        pre_order_id: pre_order_id,
        location_from: '',
        location_to: '',
        is_pickup: req.body.is_pickup,
        trip_type: 'to_trip'
    }), function (data) {
        if (data.status === true) {
            //CREATED PRE_TRIP
            // console.log(data);
            var flight = flight_list[req.body.flight_index];
            if (flight.flight_id) {
                api.appSendNormalRequest(api.appPrepareUploadPack("pretrip_with_flight", {
                    pre_trip_id: data.record.id,
                    flight_id: flight.flight_id
                }), function (flight_data) {
                    console.log('PRINTING NORMAL FLIGHT DATA');
                    console.log(flight_data);
                    if (flight_data.status === true) {
                        res.send({
                                redirect: '/price',
                                pre_order_id: pre_order_id
                            }
                        );
                    } else {
                        res.send({
                            redirect: '/'
                        });
                    }

                }, function (flight_err) {
                    console.log(flight_err);
                });
                //Normal Flight
            } else {
                api.appSendNormalRequest(api.appPrepareUploadPack("pretrip_with_future", {
                    pre_trip_id: data.record.id,
                    flight: flight

                }), function (flight_data) {
                    console.log('PRINTING FUTURE FLIGHT DATA');
                    console.log(flight_data);
                    if (flight_data.status === true) {
                        res.send({
                                redirect: '/price',
                                pre_order_id: pre_order_id
                            }
                        );
                    } else {
                        res.send({
                            redirect: '/'
                        });
                    }


                }, function (flight_err) {
                    console.log(flight_err);
                });
                //Future Flight
            }

        } else {
            res.send({
                    redirect: '/price'
                }
            );
        }
    }, function (err) {
        console.log(err);
    });


});


// router.post('/test',function(req,res,next){
//     //console.log("RECEIVED PRE-ORDER ID");
//     //console.log(req);
//     var order_id = "420";
//     req.session.pre_order_id = order_id;
//     //res.send(req.session.pre_order_id);
//     //createPreOrderForSession(req,res);
//     res.send({
//         pre_order_id:order_id
//     });
// });
// function createPreOrderForSession(req, res) {
//
//     console.log(req);
//
// }

function parseFlightInfo(service_code, data) {
    var flight_str = data.flight_num.replace(' ', '');
    var departure_date = data.flight_departure_date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3/$1/$2");
    //console.log(departure_date);
    var carrier_code = flight_str.substr(0, 2);
    var flight_num = flight_str.substr(2, flight_str.length);
    return api.appPrepareUploadPack(service_code, {
        carrier_code: carrier_code,
        flight_num: flight_num,
        flight_departure_date: departure_date
    });
}


function handleReceivedFlightData(data) {
    var str_records = [];
    if (data.status === true) {
        //str_records.push('RECENT SEARCH: ');
        data.records.forEach(function (record) {
            str_records.push(record.carrier_code + record.flight_num);
        });
    }
    return str_records;
}

function handleReceivedFutureFlightData(records) {
    var flight_records = [];
    records.forEach(function (t) {
        var dep_date = new Date(t.departureTime);
        var arr_date = new Date(t.arrivalTime);
        //console.log(t);
        var temp = {
            carrier_code: t.carrierFsCode,
            flight_num: t.flightNumber,
            dep_date: dep_date.toLocaleDateString() + ' ' + dep_date.toLocaleTimeString(),
            arr_date: arr_date.toLocaleDateString() + ' ' + arr_date.toLocaleTimeString(),
            dep_port: t.departureAirportFsCode,
            arr_port: t.arrivalAirportFsCode,
            arr_terminal: t.arrivalTerminal ? t.arrivalTerminal : 'N/A',
            dep_terminal: t.departureTerminal ? t.departureTerminal : 'N/A'
        };
        flight_records.push(temp);
    });

    flight_list = flight_records;
    // console.log('HANDLED FUTURE FLIGHT DATA');
    // console.log(flight_records);
    return flight_records;
}


/* GET flights page. */
router.get('/', function (req, res) {
    res.render('flights', {
        title: 'Sunshire Meteor',
        pageName: 'Flights',
        pageMode: 'flight_index'

    });
});


module.exports = router;