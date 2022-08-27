"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwitchName = exports.SwitchControllableProperty = void 0;
const CubyAdapter_1 = require("./CubyAdapter");
const types_1 = require("./types");
var SwitchControllableProperty;
(function (SwitchControllableProperty) {
    SwitchControllableProperty["DISPLAY"] = "display";
    SwitchControllableProperty["TURBO"] = "turbo";
    SwitchControllableProperty["LONG"] = "long";
    SwitchControllableProperty["ECO"] = "eco";
})(SwitchControllableProperty = exports.SwitchControllableProperty || (exports.SwitchControllableProperty = {}));
const getSwitchName = ({ device, controllableProperty, }) => {
    var _a;
    return `${(_a = device.name) !== null && _a !== void 0 ? _a : 'Unknown Name'} ${controllableProperty.charAt(0).toUpperCase() + controllableProperty.slice(1)}`;
};
exports.getSwitchName = getSwitchName;
class CubySwitchAccessory {
    constructor(platform, accessory, deviceAdapter, controllableProperty, stateManager) {
        var _a, _b;
        this.platform = platform;
        this.accessory = accessory;
        this.deviceAdapter = deviceAdapter;
        this.controllableProperty = controllableProperty;
        this.stateManager = stateManager;
        this.device = accessory.context.device;
        this.currentState = types_1.OnOffProperty.OFF;
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Arteko Electronics')
            .setCharacteristic(this.platform.Characteristic.Model, (_a = this.device.model.toString()) !== null && _a !== void 0 ? _a : 'Cuby')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, (_b = this.device.id) !== null && _b !== void 0 ? _b : 'Unknown Serial');
        this.service =
            this.accessory.getService(this.platform.Service.Switch) ||
                this.accessory.addService(this.platform.Service.Switch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, (0, exports.getSwitchName)({ device: this.device, controllableProperty: this.controllableProperty }));
        this.service
            .getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));
    }
    acStatePropertyToCommand() {
        switch (this.controllableProperty) {
            case SwitchControllableProperty.DISPLAY:
                return CubyAdapter_1.Commands.SetDisplay;
            case SwitchControllableProperty.ECO:
                return CubyAdapter_1.Commands.SetEco;
            case SwitchControllableProperty.TURBO:
                return CubyAdapter_1.Commands.SetTurbo;
            case SwitchControllableProperty.LONG:
                return CubyAdapter_1.Commands.SetLong;
        }
    }
    async setActive(value) {
        const newActive = value ? types_1.OnOffProperty.ON : types_1.OnOffProperty.OFF;
        try {
            await this.deviceAdapter.sendACCommand({
                command: this.acStatePropertyToCommand(),
                commandArgument: newActive,
            });
            this.stateManager.acState[this.controllableProperty] = newActive;
        }
        catch (error) {
            this.platform.log.error('Cannot set device active', error);
        }
    }
    async getActive() {
        try {
            const data = this.stateManager.acState;
            return data[this.controllableProperty] === types_1.OnOffProperty.ON ? 1 : 0;
        }
        catch (error) {
            this.platform.log.error('Cannot get device active', error);
            return 0;
        }
    }
    updateCharacteristics() {
        setInterval(() => {
            var _a;
            const currentACState = this.stateManager.acState;
            (_a = this.service
                .getCharacteristic(this.platform.Characteristic.On)) === null || _a === void 0 ? void 0 : _a.updateValue(currentACState[this.controllableProperty] === types_1.OnOffProperty.ON ? 1 : 0);
        }, 5000);
    }
}
exports.default = CubySwitchAccessory;
//# sourceMappingURL=CubySwitchAccessory.js.map