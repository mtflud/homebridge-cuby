import { CharacteristicValue, Logger } from 'homebridge'
import { ACMode, CubyDevice, FanMode, OnOffProperty, VerticalVaneMode } from './types'
import Cuby from './Cuby'
import CubyPlatform from '../CubyPlatform'
import CubyStateManager from './CubyStateManager'

export enum Commands {
  SetAirConditionerMode = 'SetAirConditionerMode',
  SetFanMode = 'SetFanMode',
  SetSwingMode = 'SetSwingMode',
  SetCoolingTemperature = 'SetCoolingTemperature',
  SetActive = 'SetActive',
  SetDisplay = 'SetDisplay',
  SetTurbo = 'SetTurbo',
  SetLong = 'SetLong',
  SetEco = 'SetEco',
}

type SendACCommandProps =
  | {
      command: Commands.SetAirConditionerMode
      commandArgument: ACMode
    }
  | {
      command: Commands.SetFanMode
      commandArgument: FanMode
    }
  | {
      command: Commands.SetSwingMode
      commandArgument: VerticalVaneMode
    }
  | {
      command: Commands.SetCoolingTemperature
      commandArgument: number
    }
  | {
      command: Commands.SetActive
      commandArgument: OnOffProperty
    }
  | {
      command: Commands.SetDisplay
      commandArgument: OnOffProperty
    }
  | {
      command: Commands.SetTurbo
      commandArgument: OnOffProperty
    }
  | {
      command: Commands.SetLong
      commandArgument: OnOffProperty
    }
  | {
      command: Commands.SetEco
      commandArgument: OnOffProperty
    }

class CubyAdapter {
  constructor(
    private readonly device: CubyDevice,
    private readonly platform: CubyPlatform,
    private readonly log: Logger,
    private readonly cubyClient: Cuby,
    private readonly stateManager: CubyStateManager
  ) {}

  public toCubyACMode(value: CharacteristicValue): ACMode {
    switch (value) {
      case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
        return ACMode.HEAT
      case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
        return ACMode.COOL
      default:
        return ACMode.AUTO
    }
  }

  public fromCubyACMode(state: ACMode): CharacteristicValue {
    switch (state) {
      case ACMode.COOL:
        return this.platform.Characteristic.TargetHeaterCoolerState.COOL
      case ACMode.HEAT:
        return this.platform.Characteristic.TargetHeaterCoolerState.HEAT
      default:
        return this.platform.Characteristic.TargetHeaterCoolerState.AUTO
    }
  }

  public fromCubyFanMode(state: FanMode): CharacteristicValue {
    if (this.stateManager.acState.power === OnOffProperty.OFF) {
      return 0
    }
    switch (state) {
      case FanMode.LOW:
        return 33
      case FanMode.MEDIUM:
        return 66
      default:
        return 100
    }
  }

  public toCubyFanMode(value: CharacteristicValue): FanMode | 0 {
    const numericValue = Number(value)

    if (numericValue === 0) {
      return 0
    }
    if (numericValue <= 33) {
      return FanMode.LOW
    }
    if (numericValue > 33 && numericValue <= 66) {
      return FanMode.MEDIUM
    }

    return FanMode.HIGH
  }

  public async sendACCommand({ command, commandArgument }: SendACCommandProps) {
    this.log.info('Execute ' + command + ' - ' + commandArgument)

    if (command === Commands.SetActive) {
      if (this.stateManager.acState.power === commandArgument) {
        return
      }
      await this.executeAcCommand({ power: commandArgument })
    }

    if (command === Commands.SetSwingMode) {
      if (this.stateManager.acState.verticalVane === commandArgument) {
        return
      }
      await this.executeAcCommand({ verticalVane: commandArgument })
    }

    if (command === Commands.SetCoolingTemperature) {
      if (this.stateManager.acState.temperature === commandArgument) {
        return
      }
      await this.executeAcCommand({ temperature: commandArgument })
    }

    if (command === Commands.SetAirConditionerMode) {
      if (this.stateManager.acState.mode === commandArgument) {
        return
      }
      await this.executeAcCommand({ mode: commandArgument })
    }

    if (command === Commands.SetFanMode) {
      if (this.stateManager.acState.fan === commandArgument) {
        return
      }
      await this.executeAcCommand({ fan: commandArgument })
    }

    if (command === Commands.SetDisplay) {
      if (this.stateManager.acState.display === commandArgument) {
        return
      }
      await this.executeAcCommand({ display: commandArgument })
    }

    if (command === Commands.SetTurbo) {
      if (this.stateManager.acState.turbo === commandArgument) {
        return
      }
      await this.executeAcCommand({ turbo: commandArgument })
    }

    if (command === Commands.SetLong) {
      if (this.stateManager.acState.long === commandArgument) {
        return
      }
      await this.executeAcCommand({ long: commandArgument })
    }

    if (command === Commands.SetEco) {
      if (this.stateManager.acState.eco === commandArgument) {
        return
      }
      await this.executeAcCommand({ eco: commandArgument })
    }

    this.log.debug('Command executed')
  }

  private executeAcCommand(acCommand: { [prop: string]: any }) {
    try {
      return this.cubyClient.setACState(this.device.id, {
        ...this.stateManager.acState,
        ...acCommand,
      })
    } catch (error: any) {
      this.log.error('Error while executing command: ' + error?.message || error?.status)
    }
  }
}

export default CubyAdapter
