$(function () {
    var today = new Date();
    var start_date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    $('input#toTrip-pickupDate').datepicker({
        format: 'yyyy-mm-dd',
        startDate:start_date,
        autoclose: true,
        orientation: 'bottom auto'
    });
    $('input#toTrip-pickupTime').clockpicker({
        autoclose: true,
        placement: 'bottom',
        format: 'HH:MM'
    });

    $('input#returnTrip-pickupDate').datepicker({
        format: 'yyyy-mm-dd',
        startDate:start_date,
        autoclose: true,
        orientation: 'bottom auto'
    });
    $('input#returnTrip-pickupTime').clockpicker({
        autoclose: true,
        placement: 'bottom',
        format: 'HH:MM'
    });

    //initAutocomplete();
});

function back_to_service() {
    cyPost('/price/submit',{

        pre_order_id:$('#pre_order_id').val(),
        //pre_order_id:$('div#pre_order_id').val(),
        service_code:"back_to_service"
    });
}

function toggleOnlineChatting() {
    Tawk_API.toggle();
}

function initAutoComplete() {

    var autocomplete_toFrom = new google.maps.places.Autocomplete(
        (document.getElementById('to_location_from')),
        {types: ['geocode']}
    );
    autocomplete_toFrom.addListener('place_changed', fillInFromAddress);

    var autocomplete_toTo = new google.maps.places.Autocomplete(
        (document.getElementById('to_location_to')),
        {types: ['geocode']}
    );
    autocomplete_toTo.addListener('place_changed', fillInFromAddress);

    var autocomplete_returnFrom = new google.maps.places.Autocomplete(
        (document.getElementById('return_location_from')),
        {types: ['geocode']}
    );
    autocomplete_returnFrom.addListener('place_changed', fillInFromAddress);

    var autocomplete_returnTo = new google.maps.places.Autocomplete(
        (document.getElementById('return_location_to')),
        {types: ['geocode']}
    );
    autocomplete_returnTo.addListener('place_changed', fillInFromAddress);


}

function fillInFromAddress() {
}


function initToPriceMap() {
    var mapProp = {
        center: {lat: 34.1080270, lng: -117.7401610},
        draggable: true,
        scrollwheel: false,
        zoom: 14
    };
    var from = $('div#to-trip-from').data('address');
    var to = $('div#to-trip-to').data('address');

    var to_map = new google.maps.Map(document.getElementById("to-quote-map"), mapProp);
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(to_map);
    directionsService.route({
        origin: from,
        destination: to,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            //alert(JSON.stringify(response));
            directionsDisplay.setDirections(response);

        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}

function initReturnPriceMap() {
    var mapProp = {
        center: {lat: 34.1080270, lng: -117.7401610},
        draggable: true,
        scrollwheel: false,
        zoom: 14
    };
    var from = $('div#return-trip-from').data('address');
    var to = $('div#return-trip-to').data('address');

    var to_map = new google.maps.Map(document.getElementById("return-quote-map"), mapProp);
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(to_map);
    directionsService.route({
        origin: from,
        destination: to,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            //alert(JSON.stringify(response));
            directionsDisplay.setDirections(response);

        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}

function initGoogle() {

    var seg = $('div#seg-index').data('value');
    if (seg === 0) {
        initAutoComplete();
    }
    if (seg === 1 || seg === 3) {
        initToPriceMap();
        var has_return = $('div#check-return').data('has');
        if (has_return === true) {
            initReturnPriceMap();
        }

    }

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