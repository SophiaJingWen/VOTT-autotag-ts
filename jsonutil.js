"use strict";
exports.__esModule = true;
var fs = require("fs");
var fsutil = require("./fsutil");
function fromFile(path) {
    var result = fs.readFileSync(path, 'utf8');
    return eval('(' + result + ')');
}
exports.fromFile = fromFile;
function fromDir(dir) {
    return fsutil.listFile(dir).map(function (path) { return fromFile(path); });
}
exports.fromDir = fromDir;
function delDir(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory() && file != "vott-json-export") {
                delDir(curPath); //递归删除文件夹
            }
            else if (fs.statSync(curPath).isFile() && file != "test.vott") {
                fs.unlinkSync(curPath); //删除文件
            }
        });
    }
}
exports.delDir = delDir;
