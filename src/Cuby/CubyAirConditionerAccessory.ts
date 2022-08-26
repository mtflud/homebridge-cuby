import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge'
import CubyAdapter, { Commands } from './CubyAdapter'
import { CubyDevice, OnOffProperty, VerticalVaneMode } from './types'
import CubyPlatform from '../CubyPlatform'
import { MAX_TEMPERATURE_C, MIN_TEMPERATURE_C } from '../consts'
import CubyStateManager from './CubyStateManager'

class CubyAirConditionerAccessory implements CubyPlatformAccessoryInterface {
  private service: Service
  private device: CubyDevice

  constructor(
    private readonly platform: CubyPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly deviceAdapter: CubyAdapter,
    private readonly stateManager: CubyStateManager
  ) {
    this.device = accessory.context.device as CubyDevice
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Arteko Electronics')
      .setCharacteristic(this.platform.Characteristic.Model, this.device.model.toString() ?? 'Cuby')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.device.id ?? 'Unknown Serial'
      )

    this.service =
      this.accessory.getService(this.platform.Service.HeaterCooler) ||
      this.accessory.addService(this.platform.Service.HeaterCooler)
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      this.device.name ?? 'Unknown Name'
    )

    this.service
      .getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this))

    const temperatureProperties = {
      maxValue: MAX_TEMPERATURE_C,
      minValue: MIN_TEMPERATURE_C,
      minStep: 1,
    }

    this.service
      .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
      .setProps(temperatureProperties)
      .onGet(this.getCoolingTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
      .setProps(temperatureProperties)
      .onGet(this.getCoolingTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onGet(this.getHeaterCoolerState.bind(this))
      .onSet(this.setHeaterCoolerState.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getCurrentHumidity.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .onGet(this.getRotationSpeed.bind(this))
      .onSet(this.setRotationSpeed.bind(this))

    this.service
      .getCharacteristic(this.platform.Characteristic.SwingMode)
      .onGet(this.getSwingMode.bind(this))
      .onSet(this.setSwingMode.bind(this))
  }

  updateCharacteristics(): void {
    setInterval(() => {
      const currentACState = this.stateManager.acState
      const currentDeviceState = this.stateManager.deviceState

      this.service
        .getCharacteristic(this.platform.Characteristic.Active)
        ?.updateValue(currentACState.power === OnOffProperty.ON ? 1 : 0)

      this.service
        .getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
        ?.updateValue(+currentACState.temperature)

      this.service
        .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
        ?.updateValue(+currentACState.temperature)

      this.service
        .getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
        ?.updateValue(this.deviceAdapter.fromCubyACMode(currentACState.mode))

      this.service
        .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
        ?.updateValue(+currentDeviceState.temperature)

      this.service
        .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
        ?.updateValue(+currentDeviceState.humidity)

      this.service
        .getCharacteristic(this.platform.Characteristic.RotationSpeed)
        ?.updateValue(this.deviceAdapter.fromCubyFanMode(currentACState.fan))

      this.service
        .getCharacteristic(this.platform.Characteristic.SwingMode)
        ?.updateValue(
          currentACState.verticalVane === VerticalVaneMode.OFF
            ? this.platform.Characteristic.SwingMode.SWING_DISABLED
            : this.platform.Characteristic.SwingMode.SWING_ENABLED
        )
    }, 5000)
  }

  private getHeaterCoolerState(): CharacteristicValue {
    return this.deviceAdapter.fromCubyACMode(this.stateManager.acState.mode)
  }

  private getCoolingTemperature(): CharacteristicValue {
    return this.stateManager.acState.temperature
  }

  private getRotationSpeed(): CharacteristicValue {
    return this.deviceAdapter.fromCubyFanMode(this.stateManager.acState.fan)
  }

  private getSwingMode(): CharacteristicValue {
    return this.stateManager.acState.verticalVane !== VerticalVaneMode.OFF
      ? this.platform.Characteristic.SwingMode.SWING_ENABLED
      : this.platform.Characteristic.SwingMode.SWING_DISABLED
  }

  private getActive(): CharacteristicValue {
    return this.stateManager.acState.power === 'on' ? 1 : 0
  }

  private getCurrentTemperature(): CharacteristicValue {
    return +this.stateManager.deviceState.temperature
  }

  private getCurrentHumidity(): CharacteristicValue {
    return +this.stateManager.deviceState.humidity
  }

  private async setActive(value: CharacteristicValue) {
    const isActive = value === 1

    try {
      await this.deviceAdapter.sendACCommand({
        command: Commands.SetActive,
        commandArgument: isActive ? OnOffProperty.ON : OnOffProperty.OFF,
      })
      this.stateManager.acState.power = isActive ? OnOffProperty.ON : OnOffProperty.OFF
    } catch (error) {
      this.platform.log.error('Cannot set device active', error)
    }
  }

  private async setHeaterCoolerState(value: CharacteristicValue) {
    const mode = this.deviceAdapter.toCubyACMode(value)

    try {
      await this.deviceAdapter.sendACCommand({
        command: Commands.SetAirConditionerMode,
        commandArgument: mode,
      })
      this.stateManager.acState.mode = mode
    } catch (error) {
      this.platform.log.error('Cannot set device mode', error)
    }
  }

  private async setSwingMode(value: CharacteristicValue) {
    try {
      const newVerticalVaneValue =
        value === this.platform.Characteristic.SwingMode.SWING_ENABLED
          ? VerticalVaneMode.AUTO
          : VerticalVaneMode.OFF
      await this.deviceAdapter.sendACCommand({
        command: Commands.SetSwingMode,
        commandArgument: newVerticalVaneValue,
      })
      this.stateManager.acState.verticalVane = newVerticalVaneValue
    } catch (error) {
      this.platform.log.error('Cannot set vertical vane mode', error)
    }
  }

  private async setTargetTemperature(value: CharacteristicValue) {
    const targetTemperature = value as number

    try {
      await this.deviceAdapter.sendACCommand({
        command: Commands.SetCoolingTemperature,
        commandArgument: targetTemperature,
      })
      this.stateManager.acState.temperature = targetTemperature
    } catch (error) {
      this.platform.log.error('Cannot set device temperature', error)
    }
  }

  private async setRotationSpeed(value: CharacteristicValue) {
    const mode = this.deviceAdapter.toCubyFanMode(value)

    // Homekit already triggers power off command, so no need to execute a fan mode change
    if (mode === 0) {
      return
    }

    try {
      await this.deviceAdapter.sendACCommand({
        command: Commands.SetFanMode,
        commandArgument: mode,
      })
      this.stateManager.acState.fan = mode
      /*
       * RotationSpeed is not linear with what Cuby returns, so we set the service characteristic value right away.
       * This gives the user immediate feedback
       */
      this.service
        .getCharacteristic(this.platform.Characteristic.RotationSpeed)
        ?.updateValue(this.deviceAdapter.fromCubyFanMode(mode))
    } catch (error) {
      this.platform.log.error('Cannot set fan mode', error)
    }
  }
}

export default CubyAirConditionerAccessory
