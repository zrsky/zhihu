function validatemobile(mobile){
    if(mobile.length == 0 || mobile.length != 11){
        return false;
    }
    var reg = /^1\d{10}$/;
    if(reg.test(mobile)){
        return true;
    }
    else{
        return false;
    }
}

exports.validatemobile = validatemobile;