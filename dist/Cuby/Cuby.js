"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class Cuby {
    constructor(token) {
        this.client = axios_1.default.create({
            baseURL: 'https://cuby.cloud/api/v2',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });
    }
    async getDevices() {
        try {
            const { data } = await this.client.get('/devices');
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async getDevice(deviceId) {
        try {
            const { data } = await this.client.get(`/devices/${deviceId}?getState=true`);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async getACState(deviceId) {
        try {
            const { data } = await this.client.get(`/state/${deviceId}`);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async setACState(deviceId, deviceState) {
        try {
            const { data } = await this.client.post(`/state/${deviceId}`, deviceState);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
}
exports.default = Cuby;
//# sourceMappingURL=Cuby.js.map