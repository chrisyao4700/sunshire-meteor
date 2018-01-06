var moment = require('moment');

function combineDateAndTime(date, time) {
    //console.log(date+' '+time);
    return moment(date + ' ' + time).format('YYYY-MM-DD HH:mm:ss');
}

function formateDate(date) {
    return date.replace(/(\d\d)\/(\d\d)\/(\d{4})/, "$3/$1/$2");
}

function verifyValidPickupTime(date, time) {
    var today = moment();
    var pickuptime = moment(date + ' ' + time);
    if(today.add(8,'hour') < pickuptime){
        return true;
    }else{
        return false;
    }
}

module.exports.combineDateAndTime = combineDateAndTime;
module.exports.formateDate = formateDate;