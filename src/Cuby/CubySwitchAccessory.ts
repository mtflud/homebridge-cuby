import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge'
import CubyAdapter, { Commands } from './CubyAdapter'
import { CubyDevice, OnOffProperty } from './types'
import CubyPlatform from '../CubyPlatform'
import CubyStateManager from './CubyStateManager'

export enum SwitchControllableProperty {
  DISPLAY = 'display',
  TURBO = 'turbo',
  LONG = 'long',
  ECO = 'eco',
}

export const getSwitchName = ({
  device,
  controllableProperty,
}: {
  device: CubyDevice
  controllableProperty: SwitchControllableProperty
}) => {
  return `${device.name ?? 'Unknown Name'} ${
    controllableProperty.charAt(0).toUpperCase() + controllableProperty.slice(1)
  }`
}

class CubySwitchAccessory implements CubyPlatformAccessoryInterface {
  private service: Service
  private readonly device: CubyDevice
  private currentState: OnOffProperty

  constructor(
    private readonly platform: CubyPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly deviceAdapter: CubyAdapter,
    private readonly controllableProperty: SwitchControllableProperty,
    private readonly stateManager: CubyStateManager
  ) {
    this.device = accessory.context.device as CubyDevice
    this.currentState = OnOffProperty.OFF

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Arteko Electronics')
      .setCharacteristic(this.platform.Characteristic.Model, this.device.model.toString() ?? 'Cuby')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.device.id ?? 'Unknown Serial'
      )

    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch)
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      getSwitchName({ device: this.device, controllableProperty: this.controllableProperty })
    )

    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this))
  }

  private acStatePropertyToCommand() {
    switch (this.controllableProperty) {
      case SwitchControllableProperty.DISPLAY:
        return Commands.SetDisplay
      case SwitchControllableProperty.ECO:
        return Commands.SetEco
      case SwitchControllableProperty.TURBO:
        return Commands.SetTurbo
      case SwitchControllableProperty.LONG:
        return Commands.SetLong
    }
  }

  private async setActive(value: CharacteristicValue) {
    const newActive = value ? OnOffProperty.ON : OnOffProperty.OFF

    try {
      await this.deviceAdapter.sendACCommand({
        command: this.acStatePropertyToCommand(),
        commandArgument: newActive,
      })
      this.stateManager.acState[this.controllableProperty] = newActive
    } catch (error) {
      this.platform.log.error('Cannot set device active', error)
    }
  }

  private async getActive() {
    try {
      const data = this.stateManager.acState
      return data[this.controllableProperty] === OnOffProperty.ON ? 1 : 0
    } catch (error) {
      this.platform.log.error('Cannot get device active', error)
      return 0
    }
  }

  updateCharacteristics(): void {
    setInterval(() => {
      const currentACState = this.stateManager.acState
      this.service
        .getCharacteristic(this.platform.Characteristic.On)
        ?.updateValue(currentACState[this.controllableProperty] === OnOffProperty.ON ? 1 : 0)
    }, 5000)
  }
}

export default CubySwitchAccessory
