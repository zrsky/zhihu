var fs = require('fs');

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

//在指定目录下创建一个文件夹
function mkDir(dirpath, dirname){
    if(!fs.existsSync(dirpath + dirname)){
        return fs.mkdirSync(dirpath + dirname);
    }
    else{
        // 文件夹已经存在了，一般不太可能
        console.warn("dir:" + dirname + "is existed!");
    }
};

exports.mkDir = mkDir;

/*  返回一个优化的时间
* 今天，显示【08:23】
* 昨天，显示【昨天 8:23】
* 昨天之前，显示【2016-12-22】
* */
function dateFormat(date){
    var now = new Date();
    var yesterday = new Date(now - 1000 * 60 * 60 * 24);
    if(now.getFullYear() == date.getFullYear()
        && now.getMonth() == date.getMonth()
        && now.getDate() == date.getDate()){
        return date.getHours() + ':' + date.getMinutes();
    }
    else if(yesterday.getFullYear() == date.getFullYear()
            && yesterday.getMonth() == date.getMonth()
            && yesterday.getDate() == date.getDate()){
        return '昨天 ' + date.getHours() + ':' + date.getMinutes();
    }
    else{
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
}
exports.dateFormat = dateFormat;