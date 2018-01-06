function toggleOnlineChatting() {
    Tawk_API.toggle();
}

function initAutoComplete() {
    var autocomplete_air_address = new google.maps.places.Autocomplete(
        (document.getElementById('airport_customer_address')),
        {types: ['geocode']}
    );
    autocomplete_air_address.addListener('place_changed', fillInFromAddress);

    var p2p_from_address = new google.maps.places.Autocomplete(
        (document.getElementById('p2p_org')),
        {types: ['geocode']}
    );
    p2p_from_address.addListener('place_changed', fillInFromAddress);

    var p2p_to_address = new google.maps.places.Autocomplete(
        (document.getElementById('p2p_des')),
        {types: ['geocode']}
    );
    p2p_to_address.addListener('place_changed', fillInFromAddress);

}

function fillInFromAddress() {

}

$(function () {

    var today = new Date();
    var start_date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    $('input#p2p-pickupDate').datepicker({
        format: 'yyyy-mm-dd',
        startDate:start_date,
        autoclose: true,
        orientation: 'bottom auto'
    });
    $('input#p2p-pickupTime').clockpicker({
        autoclose: true,
        placement: 'bottom'
    });
    $('input#airport-pickupDate').datepicker({
        format: 'yyyy-mm-dd',
        startDate:start_date,
        autoclose: true,
        orientation: 'bottom auto'
    });
    $('input#airport-pickupTime').clockpicker({
        autoclose: true,
        placement: 'bottom'
    });

    $('input#flight-departure-date').datepicker({
        startDate:start_date,
        autoclose: true,
        orientation: 'bottom auto'
        }
    );

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

function initGoogle() {
    initAutoComplete();
}

