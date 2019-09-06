"use strict";
exports.__esModule = true;
var fs = require("fs");
var jsonutil = require("./jsonutil");
var fsutil = require("./fsutil");
var Asset = /** @class */ (function () {
    function Asset(option, assetId, assetName, width, height) {
        this.assetObj = {
            "asset": {
                "format": "jpeg",
                "id": assetId,
                "name": assetName,
                "path": 'file:' + (option.picPath + "/" + assetName),
                "size": {
                    width: width,
                    height: height
                },
                "state": 2,
                "type": 1
            },
            "regions": [],
            "version": "2.1.0"
        };
    }
    Asset.prototype.addRegions = function (regions) {
        var regionsArray = [];
        for (var _i = 0, _a = Object.keys(regions); _i < _a.length; _i++) {
            var regionId = _a[_i];
            var _b = regions[regionId], top = _b[0], left = _b[1], width = _b[2], height = _b[3];
            var regionObj = {
                "id": regionId,
                "type": "RECTANGLE",
                "tags": [
                    "未标注"
                ],
                "boundingBox": {
                    height: height,
                    width: width,
                    left: left,
                    top: top
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
            };
            regionsArray.push(regionObj);
        }
        this.assetObj.regions = regionsArray;
    };
    Asset.prototype.save = function (path) {
        fs.writeFileSync(path + "/" + this.getId() + "-asset.json", JSON.stringify(this.assetObj, null, 4));
    };
    Asset.prototype.getAssetInfo = function () {
        return this.assetObj.asset;
    };
    Asset.prototype.getId = function () {
        return this.assetObj.asset.id;
    };
    Asset.prototype.getName = function () {
        return this.assetObj.asset.name;
    };
    return Asset;
}());
var ExportSrc = /** @class */ (function () {
    function ExportSrc(filepath) {
        this.exportVottObj = jsonutil.fromFile(filepath);
    }
    ExportSrc.prototype.getExportVottObj = function () {
        return this.exportVottObj;
    };
    ExportSrc.prototype.getAssets = function () {
        return this.exportVottObj.assets;
    };
    ExportSrc.prototype.getName = function (assetId) {
        return this.exportVottObj["assets"][assetId]["asset"]["name"];
    };
    ExportSrc.prototype.getWidth = function (lastId) {
        return this.exportVottObj["assets"][lastId]["asset"]["size"]["width"];
    };
    ExportSrc.prototype.getHeight = function (lastId) {
        return this.exportVottObj["assets"][lastId]["asset"]["size"]["height"];
    };
    return ExportSrc;
}());
var Exporter = /** @class */ (function () {
    function Exporter(option) {
        this.exporterOption = option;
    }
    Exporter.prototype["export"] = function () {
        this.clean();
        var assets = this.createAssets();
        this.updateFile(assets);
    };
    Exporter.prototype.clean = function () {
        jsonutil.delDir(this.exporterOption.outputPath);
    };
    //生产assets
    Exporter.prototype.createAssets = function () {
        var exportVottObj = new ExportSrc(this.exporterOption.exportVottPath);
        var boxObj = jsonutil.fromFile(this.exporterOption.boxPath);
        var assets = [];
        this.setImageSize();
        for (var _i = 0, _a = Object.keys(exportVottObj.getAssets()); _i < _a.length; _i++) {
            var assetId = _a[_i];
            var assetName = exportVottObj.getName(assetId);
            var regions = boxObj[assetName];
            if (regions) {
                var asset = new Asset(this.exporterOption, assetId, assetName, this.width, this.height);
                asset.addRegions(regions);
                asset.save(this.exporterOption.outputPath);
                assets.push(asset);
            }
        }
        return assets;
    };
    Exporter.prototype.setImageSize = function () {
        var _a = this.getLastImageSize(), width = _a[0], height = _a[1];
        this.width = width;
        this.height = height;
    };
    //在test.vott中更新project中assets的数据
    Exporter.prototype.updateFile = function (assets) {
        var testVottObj = jsonutil.fromFile(this.exporterOption.testVottPath);
        for (var _i = 0, assets_1 = assets; _i < assets_1.length; _i++) {
            var asset = assets_1[_i];
            var assetId = asset.getId();
            if (testVottObj[assetId]) {
                testVottObj[assetId].state = 2;
            }
            else {
                testVottObj[assetId] = asset.getAssetInfo();
            }
        }
        fs.writeFileSync(this.exporterOption.testVottPath, JSON.stringify(testVottObj, null, 4));
    };
    Exporter.prototype.getLastImageSize = function () {
        var exportVottObj = new ExportSrc(this.exporterOption.exportVottPath);
        var lastId = Object.keys(exportVottObj.getAssets())[Object.keys(exportVottObj.getAssets()).length - 1];
        var width = exportVottObj.getWidth(lastId);
        var height = exportVottObj.getHeight(lastId);
        return [width, height];
    };
    return Exporter;
}());
var option = {
    boxPath: "C:/Users/sophiawen/Desktop/数据/Vott/yly2_box.json",
    exportVottPath: "C:/Users/sophiawen/Desktop/test-output/vott-json-export/test-export.json",
    testVottPath: "C:/Users/sophiawen/Desktop/test-output/test.vott",
    outputPath: "C:/Users/sophiawen/Desktop/test-output",
    picPath: "C:/Users/sophiawen/Desktop/数据/Vott/yly2"
};
var myExporter = new Exporter(option);
myExporter["export"]();
