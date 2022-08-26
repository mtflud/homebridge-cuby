"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorizontalVaneMode = exports.VerticalVaneMode = exports.FanMode = exports.OnOffProperty = exports.ACMode = void 0;
var ACMode;
(function (ACMode) {
    ACMode["COOL"] = "cool";
    ACMode["HEAT"] = "heat";
    ACMode["FAN"] = "fan";
    ACMode["DRY"] = "dry";
    ACMode["AUTO"] = "auto";
})(ACMode = exports.ACMode || (exports.ACMode = {}));
var OnOffProperty;
(function (OnOffProperty) {
    OnOffProperty["ON"] = "on";
    OnOffProperty["OFF"] = "off";
})(OnOffProperty = exports.OnOffProperty || (exports.OnOffProperty = {}));
var FanMode;
(function (FanMode) {
    FanMode["LOW"] = "low";
    FanMode["MEDIUM"] = "medium";
    FanMode["HIGH"] = "high";
    FanMode["AUTO"] = "auto";
})(FanMode = exports.FanMode || (exports.FanMode = {}));
var VerticalVaneMode;
(function (VerticalVaneMode) {
    VerticalVaneMode["TOP"] = "top";
    VerticalVaneMode["TOP_CENTER"] = "topcenter";
    VerticalVaneMode["CENTER"] = "center";
    VerticalVaneMode["BOTTOM_CENTER"] = "bottomcenter";
    VerticalVaneMode["BOTTOM"] = "bottom";
    VerticalVaneMode["AUTO"] = "auto";
    VerticalVaneMode["OFF"] = "off";
})(VerticalVaneMode = exports.VerticalVaneMode || (exports.VerticalVaneMode = {}));
var HorizontalVaneMode;
(function (HorizontalVaneMode) {
    HorizontalVaneMode["LEFT"] = "left";
    HorizontalVaneMode["LEFT_CENTER"] = "leftcenter";
    HorizontalVaneMode["CENTER"] = "center";
    HorizontalVaneMode["RIGHT_CENTER"] = "rightcenter";
    HorizontalVaneMode["RIGHT"] = "right";
    HorizontalVaneMode["SIDES"] = "sides";
    HorizontalVaneMode["AUTO"] = "auto";
    HorizontalVaneMode["OFF"] = "off";
})(HorizontalVaneMode = exports.HorizontalVaneMode || (exports.HorizontalVaneMode = {}));
//# sourceMappingURL=types.js.map