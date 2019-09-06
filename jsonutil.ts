import * as fs from 'fs'
var fsutil = require("./fsutil")

export function fromFile(path){
    let result = fs.readFileSync(path,'utf8');
    return eval('(' + result + ')'); 
}

export function fromDir(dir) {
    return fsutil.listFile(dir).map(path => fromFile(path));
}

export function delDir(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory() && file != "vott-json-export"){
                delDir(curPath); //递归删除文件夹
            }else if(fs.statSync(curPath).isFile() && file != "test.vott"){
                fs.unlinkSync(curPath); //删除文件
            }
        });
    }
}