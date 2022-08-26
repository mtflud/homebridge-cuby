"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const types_1 = require("./types");
const definitions_1 = require("hap-nodejs/dist/lib/definitions");
var Commands;
(function (Commands) {
    Commands["SetAirConditionerMode"] = "SetAirConditionerMode";
    Commands["SetFanMode"] = "SetFanMode";
    Commands["SetSwingMode"] = "SetSwingMode";
    Commands["SetCoolingTemperature"] = "SetCoolingTemperature";
    Commands["SetActive"] = "SetActive";
    Commands["SetDisplay"] = "SetDisplay";
    Commands["SetTurbo"] = "SetTurbo";
    Commands["SetLong"] = "SetLong";
    Commands["SetEco"] = "SetEco";
})(Commands = exports.Commands || (exports.Commands = {}));
class CubyAdapter {
    constructor(device, platform, log, cubyClient, stateManager) {
        this.device = device;
        this.platform = platform;
        this.log = log;
        this.cubyClient = cubyClient;
        this.stateManager = stateManager;
    }
    toCubyACMode(value) {
        switch (value) {
            case definitions_1.TargetHeaterCoolerState.HEAT:
                return types_1.ACMode.HEAT;
            case definitions_1.TargetHeaterCoolerState.COOL:
                return types_1.ACMode.COOL;
            default:
                return types_1.ACMode.AUTO;
        }
    }
    fromCubyACMode(state) {
        switch (state) {
            case types_1.ACMode.COOL:
                return definitions_1.TargetHeaterCoolerState.COOL;
            case types_1.ACMode.HEAT:
                return definitions_1.TargetHeaterCoolerState.HEAT;
            default:
                return definitions_1.TargetHeaterCoolerState.AUTO;
        }
    }
    fromCubyFanMode(state) {
        if (this.stateManager.acState.power === types_1.OnOffProperty.OFF) {
            return 0;
        }
        switch (state) {
            case types_1.FanMode.LOW:
                return 33;
            case types_1.FanMode.MEDIUM:
                return 66;
            default:
                return 100;
        }
    }
    toCubyFanMode(value) {
        const numericValue = Number(value);
        if (numericValue === 0) {
            return 0;
        }
        if (numericValue <= 33) {
            return types_1.FanMode.LOW;
        }
        if (numericValue > 33 && numericValue <= 66) {
            return types_1.FanMode.MEDIUM;
        }
        return types_1.FanMode.HIGH;
    }
    async sendACCommand({ command, commandArgument }) {
        this.log.info('Execute ' + command + ' - ' + commandArgument);
        if (command === Commands.SetActive) {
            if (this.stateManager.acState.power === commandArgument) {
                return;
            }
            await this.executeAcCommand({ power: commandArgument });
        }
        if (command === Commands.SetSwingMode) {
            if (this.stateManager.acState.verticalVane === commandArgument) {
                return;
            }
            await this.executeAcCommand({ verticalVane: commandArgument });
        }
        if (command === Commands.SetCoolingTemperature) {
            if (this.stateManager.acState.temperature === commandArgument) {
                return;
            }
            await this.executeAcCommand({ temperature: commandArgument });
        }
        if (command === Commands.SetAirConditionerMode) {
            if (this.stateManager.acState.mode === commandArgument) {
                return;
            }
            await this.executeAcCommand({ mode: commandArgument });
        }
        if (command === Commands.SetFanMode) {
            if (this.stateManager.acState.fan === commandArgument) {
                return;
            }
            await this.executeAcCommand({ fan: commandArgument });
        }
        if (command === Commands.SetDisplay) {
            if (this.stateManager.acState.display === commandArgument) {
                return;
            }
            await this.executeAcCommand({ display: commandArgument });
        }
        if (command === Commands.SetTurbo) {
            if (this.stateManager.acState.turbo === commandArgument) {
                return;
            }
            await this.executeAcCommand({ turbo: commandArgument });
        }
        if (command === Commands.SetLong) {
            if (this.stateManager.acState.long === commandArgument) {
                return;
            }
            await this.executeAcCommand({ long: commandArgument });
        }
        if (command === Commands.SetEco) {
            if (this.stateManager.acState.eco === commandArgument) {
                return;
            }
            await this.executeAcCommand({ eco: commandArgument });
        }
        this.log.debug('Command executed');
    }
    executeAcCommand(acCommand) {
        return this.cubyClient.setACState(this.device.id, {
            ...this.stateManager.acState,
            ...acCommand,
        });
    }
}
exports.default = CubyAdapter;
//# sourceMappingURL=CubyAdapter.js.map