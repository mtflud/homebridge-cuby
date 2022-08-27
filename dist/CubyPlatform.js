"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubyAccessoryType = void 0;
const Cuby_1 = __importDefault(require("./Cuby/Cuby"));
const CubyAdapter_1 = __importDefault(require("./Cuby/CubyAdapter"));
const CubyAirConditionerAccessory_1 = __importDefault(require("./Cuby/CubyAirConditionerAccessory"));
const consts_1 = require("./consts");
const CubySwitchAccessory_1 = __importStar(require("./Cuby/CubySwitchAccessory"));
const wait_1 = __importDefault(require("./utils/wait"));
const CubyStateManager_1 = __importDefault(require("./Cuby/CubyStateManager"));
let hap;
var CubyAccessoryType;
(function (CubyAccessoryType) {
    CubyAccessoryType["HeaterCooler"] = "HeaterCooler";
    CubyAccessoryType["Switch"] = "Switch";
})(CubyAccessoryType = exports.CubyAccessoryType || (exports.CubyAccessoryType = {}));
class CubyPlatform {
    constructor(log, config, api) {
        this.accessories = [];
        this.cachedAccessories = [];
        this.api = api;
        hap = this.api.hap;
        this.log = log;
        this.config = config;
        this.Service = hap.Service;
        this.Characteristic = hap.Characteristic;
        this.cubyClient = new Cuby_1.default((config === null || config === void 0 ? void 0 : config.username) || '', (config === null || config === void 0 ? void 0 : config.password) || '');
        if (!api || !config) {
            return;
        }
        /*
         * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
         * after this event was fired, in order to ensure they weren't added to homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        api.on("didFinishLaunching" /* APIEvent.DID_FINISH_LAUNCHING */, async () => {
            let initialized = false;
            while (!initialized) {
                try {
                    const devices = await this.cubyClient.getDevices();
                    for (const device of devices) {
                        const stateManager = new CubyStateManager_1.default(this.cubyClient, this.log, device, this.config.pollInterval || consts_1.DEFAULT_POLL_INTERVAL_S);
                        await this.addHeaterCoolerAccessory({ device, stateManager });
                        this.config.displaySwitchesEnabled &&
                            (await this.addSwitchAccessory({
                                device,
                                controllableProperty: CubySwitchAccessory_1.SwitchControllableProperty.DISPLAY,
                                stateManager,
                            }));
                        this.config.ecoSwitchesEnabled &&
                            (await this.addSwitchAccessory({
                                device,
                                controllableProperty: CubySwitchAccessory_1.SwitchControllableProperty.ECO,
                                stateManager,
                            }));
                        this.config.turboSwitchesEnabled &&
                            (await this.addSwitchAccessory({
                                device,
                                controllableProperty: CubySwitchAccessory_1.SwitchControllableProperty.TURBO,
                                stateManager,
                            }));
                        this.config.longSwitchesEnabled &&
                            (await this.addSwitchAccessory({
                                device,
                                controllableProperty: CubySwitchAccessory_1.SwitchControllableProperty.LONG,
                                stateManager,
                            }));
                        initialized = true;
                    }
                }
                catch (err) {
                    this.log.warn("Something went wrong while contacting Cuby's servers. Retrying in 30 seconds...");
                    if (!this.config.username || !this.config.password) {
                        this.log.error('No username or password were specified on the configuration file');
                    }
                    await (0, wait_1.default)(30000);
                }
            }
            this.api.registerPlatformAccessories(consts_1.PLUGIN_NAME, this.config.name || consts_1.PLATFORM_NAME, this.accessories.filter((a) => !this.cachedAccessories.find((ca) => ca.UUID === a.UUID)));
            this.api.unregisterPlatformAccessories(consts_1.PLUGIN_NAME, this.config.name || consts_1.PLATFORM_NAME, this.cachedAccessories.filter((a) => !this.accessories.find((ca) => ca.UUID === a.UUID)));
        });
    }
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        this.cachedAccessories.push(accessory);
        this.accessories.push(accessory);
    }
    async addHeaterCoolerAccessory({ device, stateManager, }) {
        const uuid = hap.uuid.generate(device.id);
        const existingAccessory = this.accessories.find((accessory) => accessory.UUID == uuid);
        if (existingAccessory) {
            return this.createCubyAccessory({
                accessory: existingAccessory,
                device,
                type: CubyAccessoryType.HeaterCooler,
                stateManager,
            });
        }
        return this.createNewHeaterCoolerAccessory({ device, uuid, stateManager });
    }
    async addSwitchAccessory({ device, controllableProperty, stateManager, }) {
        const uuid = hap.uuid.generate(`${device.id}-${controllableProperty.toUpperCase()}`);
        const existingAccessory = this.accessories.find((accessory) => accessory.UUID == uuid);
        if (existingAccessory) {
            return this.createCubyAccessory({
                accessory: existingAccessory,
                device,
                type: CubyAccessoryType.Switch,
                controllableProperty,
                stateManager,
            });
        }
        return this.createNewSwitchAccessory({
            device,
            uuid,
            controllableProperty,
            stateManager,
        });
    }
    async createNewHeaterCoolerAccessory({ device, uuid, stateManager, }) {
        const name = device.name;
        this.log.info('Registering new HeaterCooler device:', name);
        const accessory = this.createPlatformAccessory({ device, uuid, name });
        this.createCubyAccessory({
            accessory,
            device,
            type: CubyAccessoryType.HeaterCooler,
            stateManager,
        });
        this.accessories.push(accessory);
    }
    async createNewSwitchAccessory({ device, uuid, controllableProperty, stateManager, }) {
        const name = (0, CubySwitchAccessory_1.getSwitchName)({ device, controllableProperty });
        this.log.info('Registering new Switch device:', name);
        const accessory = this.createPlatformAccessory({ device, uuid, name });
        this.createCubyAccessory({
            accessory,
            device,
            type: CubyAccessoryType.Switch,
            controllableProperty,
            stateManager,
        });
        this.accessories.push(accessory);
    }
    createPlatformAccessory({ device, uuid, name, }) {
        const accessory = new this.api.platformAccessory(name, uuid);
        accessory.context.device = device;
        return accessory;
    }
    createCubyAccessory({ accessory, device, type, controllableProperty, stateManager, }) {
        const deviceAdapter = new CubyAdapter_1.default(device, this, this.log, this.cubyClient, stateManager);
        if (type === CubyAccessoryType.HeaterCooler) {
            new CubyAirConditionerAccessory_1.default(this, accessory, deviceAdapter, stateManager);
        }
        if (type === CubyAccessoryType.Switch) {
            new CubySwitchAccessory_1.default(this, accessory, deviceAdapter, controllableProperty, stateManager);
        }
    }
}
exports.default = CubyPlatform;
//# sourceMappingURL=CubyPlatform.js.map