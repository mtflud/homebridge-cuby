import axios, { AxiosInstance } from 'axios'
import { CubyDevice, DeviceState, ACState } from './types'

const API_BASE_URL = 'https://cuby.cloud/api/v2'

class Cuby {
  private client: AxiosInstance
  private token: string | null = null

  private readonly username: string
  private readonly password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Accept: 'application/json',
      },
    })
  }

  public async getAndSetToken(): Promise<void> {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/token/${this.username}`, {
        password: this.password,
        expiration: 999999999999,
      })
      this.token = data?.token || ''
      this.client.defaults.headers.common = {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
      }
    } catch (err) {
      throw err
    }
  }

  public async getDevices(): Promise<Array<CubyDevice>> {
    try {
      !this.token && (await this.getAndSetToken())
      const { data } = await this.client.get('/devices')
      return data
    } catch (err) {
      throw err
    }
  }

  public async getDevice(deviceId: string): Promise<CubyDevice & { data: DeviceState }> {
    try {
      !this.token && (await this.getAndSetToken())
      const { data } = await this.client.get(`/devices/${deviceId}?getState=true`)
      return data
    } catch (err) {
      throw err
    }
  }

  public async getACState(deviceId: string): Promise<ACState> {
    try {
      !this.token && (await this.getAndSetToken())
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
      !this.token && (await this.getAndSetToken())
      const { data } = await this.client.post(`/state/${deviceId}`, deviceState)
      return data
    } catch (err) {
      throw err
    }
  }
}

export default Cuby
