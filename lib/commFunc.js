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