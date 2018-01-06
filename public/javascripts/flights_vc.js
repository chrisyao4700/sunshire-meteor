function toggleOnlineChatting() {
    Tawk_API.toggle();
}

$(function () {

    $('input#flight-departure-date').datepicker();

    var recent_flight_source = function (request, response) {
        $.post("/flights/recent-flight", {
            text: request.term
        }, function (data, status) {
            response(data.records);
        });
    };

    $('input#flight-num').autocomplete({
        source: recent_flight_source,
        minLength: 2,
        maxShowItems: 5
    });
});
function selectFlightWithIndex(index){
    //res.cookie('cookiename', 'cookievalue', { maxAge: 900000 });
    $.post("/flights/select-flight",{
        flight_index:index
    },function (data, status) {
        if (data.status === false){
            //alert(data.message);
            toggleOnlineChatting();
        }else{
            $('div#airport-selection-'+index).modal('show');
            var pre_order_container = document.createElement("div");
            pre_order_container.id = 'pre-order-container';
            pre_order_container.setAttribute('pre_order_id', data.pre_order_id);
            document.body.appendChild(pre_order_container);

        }
    });
}
function selectServiceWithFlight(flight_index, is_pickup){
    //$('form#'+form_id).submit();a\
    var pre_order_id = $('div#pre-order-container').attr('pre_order_id');
    $.post("/flights/select-service", {
        flight_index: flight_index,
        is_pickup:is_pickup,
        pre_order_id:pre_order_id
    },function (data, status) {
        cyPost('/price',{
            pre_order_id:data.pre_order_id
        })
    });
}

function cyPost(path, params) {
    var form = document.createElement("form");
    form.setAttribute("method", 'post');
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}


// function selectFlightWithIndex(index){
//
//     //alert('I AM WORKING.');
//     // //res.cookie('cookiename', 'cookievalue', { maxAge: 900000 });
//     $.post("/flights/select-flight",{
//         flight_index:index
//     });
//
//     //$('div#airport-selection-'+index).modal('show');
// }
// function selectFlightWithIndex(index){
//     //res.cookie('cookiename', 'cookievalue', { maxAge: 900000 });
//     $.post("/flights/test",{
//
//     },function (data, status) {
//        if (data.status !== false){
//            //alert(data.message);
//            //toggleOnlineChatting();
//            alert(data.pre_order_id);
//            //$('div#airport-selection-'+index).modal('show');
//        }
//     });
//
// }
function backToHome() {
    window.location.replace('/');
}
