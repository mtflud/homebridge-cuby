"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CubyAdapter_1 = require("./CubyAdapter");
const types_1 = require("./types");
const consts_1 = require("../consts");
class CubyAirConditionerAccessory {
    constructor(platform, accessory, deviceAdapter, stateManager) {
        var _a, _b, _c;
        this.platform = platform;
        this.accessory = accessory;
        this.deviceAdapter = deviceAdapter;
        this.stateManager = stateManager;
        this.device = accessory.context.device;
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Arteko Electronics')
            .setCharacteristic(this.platform.Characteristic.Model, (_a = this.device.model.toString()) !== null && _a !== void 0 ? _a : 'Cuby')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, (_b = this.device.id) !== null && _b !== void 0 ? _b : 'Unknown Serial');
        this.service =
            this.accessory.getService(this.platform.Service.HeaterCooler) ||
                this.accessory.addService(this.platform.Service.HeaterCooler);
        this.service.setCharacteristic(this.platform.Characteristic.Name, (_c = this.device.name) !== null && _c !== void 0 ? _c : 'Unknown Name');
        this.service
            .getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));
        const temperatureProperties = {
            maxValue: consts_1.MAX_TEMPERATURE_C,
            minValue: consts_1.MIN_TEMPERATURE_C,
            minStep: 1,
        };
        this.service
            .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .setProps(temperatureProperties)
            .onGet(this.getCoolingTemperature.bind(this))
            .onSet(this.setTargetTemperature.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
            .setProps(temperatureProperties)
            .onGet(this.getCoolingTemperature.bind(this))
            .onSet(this.setTargetTemperature.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
            .onGet(this.getHeaterCoolerState.bind(this))
            .onSet(this.setHeaterCoolerState.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.getCurrentTemperature.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
            .onGet(this.getCurrentHumidity.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onGet(this.getRotationSpeed.bind(this))
            .onSet(this.setRotationSpeed.bind(this));
        this.service
            .getCharacteristic(this.platform.Characteristic.SwingMode)
            .onGet(this.getSwingMode.bind(this))
            .onSet(this.setSwingMode.bind(this));
    }
    updateCharacteristics() {
        setInterval(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const currentACState = this.stateManager.acState;
            const currentDeviceState = this.stateManager.deviceState;
            (_a = this.service
                .getCharacteristic(this.platform.Characteristic.Active)) === null || _a === void 0 ? void 0 : _a.updateValue(currentACState.power === types_1.OnOffProperty.ON ? 1 : 0);
            (_b = this.service
                .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)) === null || _b === void 0 ? void 0 : _b.updateValue(+currentACState.temperature);
            (_c = this.service
                .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)) === null || _c === void 0 ? void 0 : _c.updateValue(+currentACState.temperature);
            (_d = this.service
                .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)) === null || _d === void 0 ? void 0 : _d.updateValue(this.deviceAdapter.fromCubyACMode(currentACState.mode));
            (_e = this.service
                .getCharacteristic(this.platform.Characteristic.CurrentTemperature)) === null || _e === void 0 ? void 0 : _e.updateValue(+currentDeviceState.temperature);
            (_f = this.service
                .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)) === null || _f === void 0 ? void 0 : _f.updateValue(+currentDeviceState.humidity);
            (_g = this.service
                .getCharacteristic(this.platform.Characteristic.RotationSpeed)) === null || _g === void 0 ? void 0 : _g.updateValue(this.deviceAdapter.fromCubyFanMode(currentACState.fan));
            (_h = this.service
                .getCharacteristic(this.platform.Characteristic.SwingMode)) === null || _h === void 0 ? void 0 : _h.updateValue(currentACState.verticalVane === types_1.VerticalVaneMode.OFF
                ? this.platform.Characteristic.SwingMode.SWING_DISABLED
                : this.platform.Characteristic.SwingMode.SWING_ENABLED);
        }, 5000);
    }
    getHeaterCoolerState() {
        return this.deviceAdapter.fromCubyACMode(this.stateManager.acState.mode);
    }
    getCoolingTemperature() {
        return this.stateManager.acState.temperature;
    }
    getRotationSpeed() {
        return this.deviceAdapter.fromCubyFanMode(this.stateManager.acState.fan);
    }
    getSwingMode() {
        return this.stateManager.acState.verticalVane !== types_1.VerticalVaneMode.OFF
            ? this.platform.Characteristic.SwingMode.SWING_ENABLED
            : this.platform.Characteristic.SwingMode.SWING_DISABLED;
    }
    getActive() {
        return this.stateManager.acState.power === 'on' ? 1 : 0;
    }
    getCurrentTemperature() {
        return +this.stateManager.deviceState.temperature;
    }
    getCurrentHumidity() {
        return +this.stateManager.deviceState.humidity;
    }
    async setActive(value) {
        const isActive = value === 1;
        try {
            await this.deviceAdapter.sendACCommand({
                command: CubyAdapter_1.Commands.SetActive,
                commandArgument: isActive ? types_1.OnOffProperty.ON : types_1.OnOffProperty.OFF,
            });
            this.stateManager.acState.power = isActive ? types_1.OnOffProperty.ON : types_1.OnOffProperty.OFF;
        }
        catch (error) {
            this.platform.log.error('Cannot set device active', error);
        }
    }
    async setHeaterCoolerState(value) {
        const mode = this.deviceAdapter.toCubyACMode(value);
        try {
            await this.deviceAdapter.sendACCommand({
                command: CubyAdapter_1.Commands.SetAirConditionerMode,
                commandArgument: mode,
            });
            this.stateManager.acState.mode = mode;
        }
        catch (error) {
            this.platform.log.error('Cannot set device mode', error);
        }
    }
    async setSwingMode(value) {
        try {
            const newVerticalVaneValue = value === this.platform.Characteristic.SwingMode.SWING_ENABLED
                ? types_1.VerticalVaneMode.AUTO
                : types_1.VerticalVaneMode.OFF;
            await this.deviceAdapter.sendACCommand({
                command: CubyAdapter_1.Commands.SetSwingMode,
                commandArgument: newVerticalVaneValue,
            });
            this.stateManager.acState.verticalVane = newVerticalVaneValue;
        }
        catch (error) {
            this.platform.log.error('Cannot set vertical vane mode', error);
        }
    }
    async setTargetTemperature(value) {
        const targetTemperature = value;
        try {
            await this.deviceAdapter.sendACCommand({
                command: CubyAdapter_1.Commands.SetCoolingTemperature,
                commandArgument: targetTemperature,
            });
            this.stateManager.acState.temperature = targetTemperature;
        }
        catch (error) {
            this.platform.log.error('Cannot set device temperature', error);
        }
    }
    async setRotationSpeed(value) {
        var _a;
        const mode = this.deviceAdapter.toCubyFanMode(value);
        // Homekit already triggers power off command, so no need to execute a fan mode change
        if (mode === 0) {
            return;
        }
        try {
            await this.deviceAdapter.sendACCommand({
                command: CubyAdapter_1.Commands.SetFanMode,
                commandArgument: mode,
            });
            this.stateManager.acState.fan = mode;
            /*
             * RotationSpeed is not linear with what Cuby returns, so we set the service characteristic value right away.
             * This gives the user immediate feedback
             */
            (_a = this.service
                .getCharacteristic(this.platform.Characteristic.RotationSpeed)) === null || _a === void 0 ? void 0 : _a.updateValue(this.deviceAdapter.fromCubyFanMode(mode));
        }
        catch (error) {
            this.platform.log.error('Cannot set fan mode', error);
        }
    }
}
exports.default = CubyAirConditionerAccessory;
//# sourceMappingURL=CubyAirConditionerAccessory.js.map