export interface CubyDevice {
  id: string
  name: string
  model: number
  firmwareVersion: string
  owner: string
  status: string
  timezone: string
  data?: DeviceState
}

export enum ACMode {
  COOL = 'cool',
  HEAT = 'heat',
  FAN = 'fan',
  DRY = 'dry',
  AUTO = 'auto',
}

export interface DeviceState {
  temperature: string
  humidity: string
  currentTime: string
  uptime: string
  rssi: string
  mode: ACMode
}

export enum OnOffProperty {
  ON = 'on',
  OFF = 'off',
}

export enum FanMode {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  AUTO = 'auto',
}

export enum VerticalVaneMode {
  TOP = 'top',
  TOP_CENTER = 'topcenter',
  CENTER = 'center',
  BOTTOM_CENTER = 'bottomcenter',
  BOTTOM = 'bottom',
  AUTO = 'auto',
  OFF = 'off',
}

export enum HorizontalVaneMode {
  LEFT = 'left',
  LEFT_CENTER = 'leftcenter',
  CENTER = 'center',
  RIGHT_CENTER = 'rightcenter',
  RIGHT = 'right',
  SIDES = 'sides',
  AUTO = 'auto',
  OFF = 'off',
}

export interface ACState {
  type?:
    | 'power'
    | 'mode'
    | 'fan'
    | 'temperature'
    | 'verticalVane'
    | 'horizontalVane'
    | 'display'
    | 'turbo'
    | 'long'
    | 'eco'
  power: OnOffProperty
  mode: ACMode
  fan: FanMode
  temperature: number
  verticalVane?: VerticalVaneMode
  horizontalVane?: HorizontalVaneMode
  display?: OnOffProperty
  turbo?: OnOffProperty
  long?: OnOffProperty
  eco?: OnOffProperty
}
