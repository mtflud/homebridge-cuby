import Cuby from './Cuby'
import { Logger } from 'homebridge'
import {
  ACMode,
  ACState,
  CubyDevice,
  DeviceState,
  FanMode,
  HorizontalVaneMode,
  OnOffProperty,
  VerticalVaneMode,
} from './types'
import { DEFAULT_POLL_INTERVAL_S, MIN_TEMPERATURE_C } from '../consts'

class CubyStateManager {
  public acState: ACState
  public deviceState: DeviceState

  constructor(
    private readonly cubyClient: Cuby,
    private readonly log: Logger,
    private readonly device: CubyDevice,
    private updateInterval: number
  ) {
    this.acState = {
      mode: ACMode.COOL,
      eco: OnOffProperty.OFF,
      fan: FanMode.MEDIUM,
      display: OnOffProperty.ON,
      long: OnOffProperty.OFF,
      power: OnOffProperty.ON,
      horizontalVane: HorizontalVaneMode.AUTO,
      temperature: MIN_TEMPERATURE_C,
      turbo: OnOffProperty.OFF,
      verticalVane: VerticalVaneMode.AUTO,
    }

    this.deviceState = {
      rssi: '',
      humidity: '50',
      mode: ACMode.COOL,
      temperature: MIN_TEMPERATURE_C.toString(),
      uptime: '1',
      currentTime: new Date().toTimeString(),
    }

    const validUpdateInterval =
      isNaN(updateInterval) || updateInterval < 10 ? DEFAULT_POLL_INTERVAL_S : updateInterval
    this.startPollingForStatus(validUpdateInterval * 1000)
  }

  private async startPollingForStatus(intervalInSeconds: number) {
    await this.updateStatus()
    setInterval(async () => {
      await this.updateStatus()
    }, intervalInSeconds)
  }

  private async getDeviceState(): Promise<DeviceState | undefined> {
    try {
      const { data } = await this.cubyClient.getDevice(this.device.id)
      return data
    } catch (error: any) {
      this.log.error('Error while fetching device state: ' + error?.message || error?.status)
    }
  }

  private async getACState(): Promise<ACState | undefined> {
    try {
      return await this.cubyClient.getACState(this.device.id)
    } catch (error: any) {
      this.log.error('Error while fetching AC state: ' + error?.message || error?.status)
    }
  }

  public async updateStatus() {
    try {
      const [acState, deviceState] = await Promise.all([this.getACState(), this.getDeviceState()])
      if (acState) {
        this.acState = acState
      }
      if (deviceState) {
        this.deviceState = deviceState
      }
    } catch (error: any) {
      this.log.error('Error while fetching device status: ' + error?.message || error?.status)
    }
  }
}

export default CubyStateManager
