import * as fs from "fs";
var jsonutil = require("./jsonutil");
var fsutil = require("./fsutil");

interface optionType {
    boxPath : string,
    exportVottPath : string,
    testVottPath : string,
    outputPath : string
    picPath : string
}


class Asset {

    constructor(option, assetId, assetName, width, height){


        this.assetObj = {
            "asset": {
                "format": "jpeg",
                "id": assetId, 
                "name": assetName,
                "path": 'file:' + `${option.picPath}/${assetName}`,
                "size": {
                    width, 
                    height
                },
                "state": 2,
                "type": 1
            },
            "regions": [
                
            ],
            "version": "2.1.0"
        }

    }


    addRegions(regions){

        var regionsArray = []

        for (let regionId of Object.keys(regions)){

            var [top,left,width,height] = regions[regionId]

            var regionObj = {
                "id": regionId,
                "type": "RECTANGLE",
                "tags": [
                    "未标注"
                ],
                
                "boundingBox": {
                    height,
                    width,
                    left,
                    top
                },
                "points": [
                    {
                        "x": left, 
                        "y": top 
                    },
                    { 
                        "x": left + width, 
                        "y": top 
                    },
                    {
                        "x": left + width, 
                        "y": top + height
                    },
                    {
                        "x": left, 
                        "y": top + height 
                    }
                ]
            }

            regionsArray.push(regionObj)

        }

        this.assetObj.regions = regionsArray

    }

    save(path){
        fs.writeFileSync(`${path}/${this.getId()}-asset.json`, JSON.stringify(this.assetObj,null,4));
    }

    getAssetInfo(){
        return this.assetObj.asset
    }

    getId(){
        return this.assetObj.asset.id
    }

    getName(){
        return this.assetObj.asset.name
    }

    private assetObj 
}

class ExportSrc{
    constructor(filepath){
        this.exportVottObj = jsonutil.fromFile(filepath)
    }

    public getExportVottObj(){
        return this.exportVottObj
    }

    public getAssets(){
        return this.exportVottObj.assets
    }

    public getName(assetId){
        return this.exportVottObj["assets"][assetId]["asset"]["name"]
    }

    public getWidth(lastId){
        return this.exportVottObj["assets"][lastId]["asset"]["size"]["width"]
    }

    public getHeight(lastId){
        return this.exportVottObj["assets"][lastId]["asset"]["size"]["height"]
    }

    private exportVottObj
}



class Exporter{

    constructor(option){
        this.exporterOption = option;
    }

    public export(){ //主函数
        this.clean();
        const assets = this.createAssets(); 
        this.updateFile(assets);
    }

    public clean(){
        jsonutil.delDir(this.exporterOption.outputPath)
    }

    //生产assets
    public createAssets(){

        var exportVottObj = new ExportSrc(this.exporterOption.exportVottPath)
        var boxObj = jsonutil.fromFile(this.exporterOption.boxPath)
        var assets = []
        this.setImageSize()

        for (let assetId of Object.keys(exportVottObj.getAssets())) {

            const assetName = exportVottObj.getName(assetId)
            const regions = boxObj[assetName]

            if(regions){

                var asset = new Asset(this.exporterOption, assetId, assetName, this.width, this.height)
                asset.addRegions(regions)
                asset.save(this.exporterOption.outputPath)
                assets.push(asset)

            }
            
        }

        return assets
        
    }

    public setImageSize(){
        const [width, height] = this.getLastImageSize()
        this.width = width
        this.height = height
    }

    //在test.vott中更新project中assets的数据
    public updateFile(assets){
        var testVottObj = jsonutil.fromFile(this.exporterOption.testVottPath)
        
        for(var asset of assets){
            const assetId = asset.getId()

            if(testVottObj[assetId]){
                testVottObj[assetId].state = 2
            }else{
                testVottObj[assetId] = asset.getAssetInfo()
            }
        }

        fs.writeFileSync(this.exporterOption.testVottPath, JSON.stringify(testVottObj,null,4));
    }

    public getLastImageSize(){

        var exportVottObj = new ExportSrc(this.exporterOption.exportVottPath)
        const lastId = Object.keys(exportVottObj.getAssets())[Object.keys(exportVottObj.getAssets()).length - 1]
        const width = exportVottObj.getWidth(lastId)
        const height = exportVottObj.getHeight(lastId)
        return [width,height]
        
    }

    private exporterOption : optionType;
    private width
    private height

}

const option = {
    boxPath : "C:/Users/sophiawen/Desktop/数据/Vott/yly2_box.json",
    exportVottPath : "C:/Users/sophiawen/Desktop/test-output/vott-json-export/test-export.json",
    testVottPath : "C:/Users/sophiawen/Desktop/test-output/test.vott",
    outputPath : "C:/Users/sophiawen/Desktop/test-output",
    picPath : "C:/Users/sophiawen/Desktop/数据/Vott/yly2"
}

const myExporter = new Exporter(option);
myExporter.export();


