import axios, { AxiosInstance } from 'axios'
import { CubyDevice, DeviceState, ACState } from './types'

class Cuby {
  private client: AxiosInstance

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://cuby.cloud/api/v2',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
  }

  public async getDevices(): Promise<Array<CubyDevice>> {
    try {
      const { data } = await this.client.get('/devices')
      return data
    } catch (err) {
      throw err
    }
  }

  public async getDevice(deviceId: string): Promise<CubyDevice & { data: DeviceState }> {
    try {
      const { data } = await this.client.get(`/devices/${deviceId}?getState=true`)
      return data
    } catch (err) {
      throw err
    }
  }

  public async getACState(deviceId: string): Promise<ACState> {
    try {
      const { data } = await this.client.get(`/state/${deviceId}`)
      return data
    } catch (err) {
      throw err
    }
  }

  public async setACState(
    deviceId: string,
    deviceState: ACState
  ): Promise<{
    status: 'ok' | 'timeout'
    payload: ACState
  }> {
    try {
      const { data } = await this.client.post(`/state/${deviceId}`, deviceState)
      return data
    } catch (err) {
      throw err
    }
  }
}

export default Cuby
