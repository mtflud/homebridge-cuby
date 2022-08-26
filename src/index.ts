import { API } from 'homebridge'
import CubyPlatform from './CubyPlatform'
import { PLATFORM_NAME } from './consts'

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, CubyPlatform)
}
