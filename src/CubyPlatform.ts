import {
  API,
  APIEvent,
  Characteristic,
  DynamicPlatformPlugin,
  HAP,
  Logging,
  PlatformAccessory,
  PlatformConfig,
  Service,
  UnknownContext,
} from 'homebridge'
import Cuby from './Cuby/Cuby'
import { CubyDevice } from './Cuby/types'
import CubyAdapter from './Cuby/CubyAdapter'
import CubyAirConditionerAccessory from './Cuby/CubyAirConditionerAccessory'
import { DEFAULT_POLL_INTERVAL_S, PLATFORM_NAME, PLUGIN_NAME, SUPPORTED_MODELS } from './consts'
import CubySwitchAccessory, {
  getSwitchName,
  SwitchControllableProperty,
} from './Cuby/CubySwitchAccessory'
import { CubyPlatformConfig } from './types'
import wait from './utils/wait'
import CubyStateManager from './Cuby/CubyStateManager'

let hap: HAP

export enum CubyAccessoryType {
  HeaterCooler = 'HeaterCooler',
  Switch = 'Switch',
}

class CubyPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service
  public readonly Characteristic: typeof Characteristic
  public readonly log: Logging
  public readonly config: PlatformConfig & CubyPlatformConfig

  private readonly accessories: PlatformAccessory[] = []
  private readonly cachedAccessories: PlatformAccessory[] = []
  private readonly api: API
  private readonly cubyClient: Cuby

  constructor(log: Logging, config: PlatformConfig & CubyPlatformConfig, api: API) {
    this.api = api
    hap = this.api.hap

    this.log = log
    this.config = config
    this.Service = hap.Service
    this.Characteristic = hap.Characteristic
    this.cubyClient = new Cuby(config?.username || '', config?.password || '')

    if (!api || !config?.username || !config?.password) {
      this.log.error('Skipping initialization. Configuration parameters not provided.')
      return
    }

    /*
     * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
     * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
     * after this event was fired, in order to ensure they weren't added to homebridge already.
     * This event can also be used to start discovery of new accessories.
     */
    api.on(APIEvent.DID_FINISH_LAUNCHING, async () => {
      let initialized = false

      while (!initialized) {
        try {
          const devices = await this.cubyClient.getDevices()
          for (const device of devices) {
            if (!SUPPORTED_MODELS.includes(device.model.toString())) {
              this.log.warn('Skipping device initialization for device:', device.name)
              this.log.warn(
                'Cannot confirm if device is supported. Please open an issue if you think this is an error. Model is:',
                device.model.toString()
              )
              continue
            }
            const stateManager = new CubyStateManager(
              this.cubyClient,
              this.log,
              device,
              this.config.pollInterval || DEFAULT_POLL_INTERVAL_S
            )

            await this.addHeaterCoolerAccessory({ device, stateManager })
            this.config.displaySwitchesEnabled &&
              (await this.addSwitchAccessory({
                device,
                controllableProperty: SwitchControllableProperty.DISPLAY,
                stateManager,
              }))
            this.config.ecoSwitchesEnabled &&
              (await this.addSwitchAccessory({
                device,
                controllableProperty: SwitchControllableProperty.ECO,
                stateManager,
              }))
            this.config.turboSwitchesEnabled &&
              (await this.addSwitchAccessory({
                device,
                controllableProperty: SwitchControllableProperty.TURBO,
                stateManager,
              }))
            this.config.longSwitchesEnabled &&
              (await this.addSwitchAccessory({
                device,
                controllableProperty: SwitchControllableProperty.LONG,
                stateManager,
              }))

            initialized = true
          }
        } catch (err) {
          this.log.warn(
            "Something went wrong while contacting Cuby's servers. Retrying in 30 seconds..."
          )
          await wait(30000)
        }
      }

      this.api.registerPlatformAccessories(
        PLUGIN_NAME,
        this.config.name || PLATFORM_NAME,
        this.accessories.filter((a) => !this.cachedAccessories.find((ca) => ca.UUID === a.UUID))
      )

      this.api.unregisterPlatformAccessories(
        PLUGIN_NAME,
        this.config.name || PLATFORM_NAME,
        this.cachedAccessories.filter((a) => !this.accessories.find((ca) => ca.UUID === a.UUID))
      )
    })
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName)
    this.cachedAccessories.push(accessory)
    this.accessories.push(accessory)
  }

  async addHeaterCoolerAccessory({
    device,
    stateManager,
  }: {
    device: CubyDevice
    stateManager: CubyStateManager
  }) {
    const uuid = hap.uuid.generate(device.id)

    const existingAccessory = this.accessories.find((accessory) => accessory.UUID == uuid)
    if (existingAccessory) {
      return this.createCubyAccessory({
        accessory: existingAccessory,
        device,
        type: CubyAccessoryType.HeaterCooler,
        stateManager,
      })
    }

    return this.createNewHeaterCoolerAccessory({ device, uuid, stateManager })
  }

  async addSwitchAccessory({
    device,
    controllableProperty,
    stateManager,
  }: {
    device: CubyDevice
    controllableProperty: SwitchControllableProperty
    stateManager: CubyStateManager
  }) {
    const uuid = hap.uuid.generate(`${device.id}-${controllableProperty.toUpperCase()}`)
    const existingAccessory = this.accessories.find((accessory) => accessory.UUID == uuid)
    if (existingAccessory) {
      return this.createCubyAccessory({
        accessory: existingAccessory,
        device,
        type: CubyAccessoryType.Switch,
        controllableProperty,
        stateManager,
      })
    }

    return this.createNewSwitchAccessory({
      device,
      uuid,
      controllableProperty,
      stateManager,
    })
  }

  private async createNewHeaterCoolerAccessory({
    device,
    uuid,
    stateManager,
  }: {
    device: CubyDevice
    uuid: string
    stateManager: CubyStateManager
  }) {
    const name = device.name
    this.log.info('Registering new HeaterCooler device:', name)
    const accessory = this.createPlatformAccessory({ device, uuid, name })
    this.createCubyAccessory({
      accessory,
      device,
      type: CubyAccessoryType.HeaterCooler,
      stateManager,
    })

    this.accessories.push(accessory)
  }

  private async createNewSwitchAccessory({
    device,
    uuid,
    controllableProperty,
    stateManager,
  }: {
    device: CubyDevice
    uuid: string
    controllableProperty: SwitchControllableProperty
    stateManager: CubyStateManager
  }) {
    const name = getSwitchName({ device, controllableProperty })
    this.log.info('Registering new Switch device:', name)
    const accessory = this.createPlatformAccessory({ device, uuid, name })

    this.createCubyAccessory({
      accessory,
      device,
      type: CubyAccessoryType.Switch,
      controllableProperty,
      stateManager,
    })

    this.accessories.push(accessory)
  }

  private createPlatformAccessory({
    device,
    uuid,
    name,
  }: {
    device: CubyDevice
    uuid: string
    name: string
  }): PlatformAccessory<UnknownContext> {
    const accessory = new this.api.platformAccessory(name, uuid)
    accessory.context.device = device
    return accessory
  }

  private createCubyAccessory({
    accessory,
    device,
    type,
    controllableProperty,
    stateManager,
  }:
    | {
        accessory: PlatformAccessory<UnknownContext>
        device: CubyDevice
        type: CubyAccessoryType.HeaterCooler
        stateManager: CubyStateManager
        controllableProperty?: SwitchControllableProperty
      }
    | {
        accessory: PlatformAccessory<UnknownContext>
        device: CubyDevice
        type: CubyAccessoryType.Switch
        stateManager: CubyStateManager
        controllableProperty: SwitchControllableProperty
      }) {
    const deviceAdapter = new CubyAdapter(device, this, this.log, this.cubyClient, stateManager)

    if (type === CubyAccessoryType.HeaterCooler) {
      new CubyAirConditionerAccessory(this, accessory, deviceAdapter, stateManager)
    }

    if (type === CubyAccessoryType.Switch) {
      new CubySwitchAccessory(this, accessory, deviceAdapter, controllableProperty, stateManager)
    }
  }
}

export default CubyPlatform
