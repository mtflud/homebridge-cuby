"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = 'https://cuby.cloud/api/v2';
class Cuby {
    constructor(username, password) {
        this.token = null;
        this.username = username;
        this.password = password;
        this.client = axios_1.default.create({
            baseURL: API_BASE_URL,
            headers: {
                Accept: 'application/json',
            },
        });
    }
    async getAndSetToken() {
        try {
            const { data } = await axios_1.default.post(`${API_BASE_URL}/token/${this.username}`, {
                password: this.password,
                expiration: 999999999999,
            });
            this.token = (data === null || data === void 0 ? void 0 : data.token) || '';
            this.client.defaults.headers.common = {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
            };
        }
        catch (err) {
            throw err;
        }
    }
    async getDevices() {
        try {
            !this.token && (await this.getAndSetToken());
            const { data } = await this.client.get('/devices');
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async getDevice(deviceId) {
        try {
            !this.token && (await this.getAndSetToken());
            const { data } = await this.client.get(`/devices/${deviceId}?getState=true`);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async getACState(deviceId) {
        try {
            !this.token && (await this.getAndSetToken());
            const { data } = await this.client.get(`/state/${deviceId}`);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
    async setACState(deviceId, deviceState) {
        try {
            !this.token && (await this.getAndSetToken());
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