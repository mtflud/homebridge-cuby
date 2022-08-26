"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const consts_1 = require("../consts");
class CubyStateManager {
    constructor(cubyClient, log, device, updateInterval) {
        this.cubyClient = cubyClient;
        this.log = log;
        this.device = device;
        this.updateInterval = updateInterval;
        this.acState = {
            mode: types_1.ACMode.COOL,
            eco: types_1.OnOffProperty.OFF,
            fan: types_1.FanMode.MEDIUM,
            display: types_1.OnOffProperty.ON,
            long: types_1.OnOffProperty.OFF,
            power: types_1.OnOffProperty.ON,
            horizontalVane: types_1.HorizontalVaneMode.AUTO,
            temperature: consts_1.MIN_TEMPERATURE_C,
            turbo: types_1.OnOffProperty.OFF,
            verticalVane: types_1.VerticalVaneMode.AUTO,
        };
        this.deviceState = {
            rssi: '',
            humidity: '50',
            mode: types_1.ACMode.COOL,
            temperature: consts_1.MIN_TEMPERATURE_C.toString(),
            uptime: '1',
            currentTime: new Date().toTimeString(),
        };
        const validUpdateInterval = updateInterval < 10 ? consts_1.DEFAULT_POLL_INTERVAL_S : updateInterval;
        this.startPollingForStatus(validUpdateInterval * 1000);
    }
    async startPollingForStatus(intervalInSeconds) {
        await this.updateStatus();
        setInterval(async () => {
            await this.updateStatus();
        }, intervalInSeconds);
    }
    async getDeviceState() {
        const { data } = await this.cubyClient.getDevice(this.device.id);
        return data;
    }
    async getACState() {
        return await this.cubyClient.getACState(this.device.id);
    }
    async updateStatus() {
        try {
            const [acState, deviceState] = await Promise.all([this.getACState(), this.getDeviceState()]);
            this.acState = acState;
            this.deviceState = deviceState;
        }
        catch (error) {
            this.log.error('Error while fetching device status: ' + (error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.status));
        }
    }
}
exports.default = CubyStateManager;
//# sourceMappingURL=CubyStateManager.js.map