"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const CubyPlatform_1 = __importDefault(require("./CubyPlatform"));
const consts_1 = require("./consts");
module.exports = (api) => {
    api.registerPlatform(consts_1.PLATFORM_NAME, CubyPlatform_1.default);
};
//# sourceMappingURL=index.js.map