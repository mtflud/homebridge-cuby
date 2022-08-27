# homebridge-cuby

[![npm](https://img.shields.io/npm/v/homebridge-cuby.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-cuby)
[![npm](https://img.shields.io/npm/dt/homebridge-cuby.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-cuby)
[![GitHub last commit](https://img.shields.io/github/last-commit/mtflud/homebridge-cuby.svg?style=flat-square)](https://github.com/mtflud/homebridge-cuby)

## Info

This is a plugin for [Homebridge](https://github.com/nfarina/homebridge) to control your [**Cuby**](https://cuby.mx/collections/cuby) devices. Currently only minisplit controllers are supported.

This plugin supports following functions:

- **Thermostat:** Control Cool, Auto, heat and Off modes
- **Fan Speed:** Control Low, medium and High settings.
- **Current Temperature:** Measured from your Cuby Device
- **Current Relative Humidity:** Measured from your Cuby Device
- **Oscillation:** Only on or off supported. Maps to vertical vane oscillation.
- **Switches:** To toggle "eco", "turbo" and "long" modes in you minisplit. A toggle for the display is also supported.

## Installation instructions

After [Homebridge](https://github.com/nfarina/homebridge) has been installed:

```sudo npm i -g homebridge-cuby@latest```


## Configuration (Config UI X)

This plugin supports a custom user interface making configuration via **homebridge-config-ui-x** even easier! To use the custom user interface you need at least homebridge-config-ui-x v4.34.0!


## Configuration (Manually)

If you cannot use the custom user interface or want to edit the config.json manually, you can use this template:

## Example BASIC config

 ```javascript
{
 "bridge": {
   ...
},
 "accessories": [
   ...
],
 "platforms": [
    {
      "platform": "Cuby"
      "name": "Cuby",
      "username": "username@mail.com",
      "password": "mycubypassword"  ,
    }
 ]
}

 ```

## Options General

| **Attributes** | **Required** | **Usage**                                                              | **Default** | **Options** |
|----------------|--------------|------------------------------------------------------------------------|-------------|-------------|
| name           | **X** | Name for the log.                                                      | `Cuby`      
| username       | **X** | Your Cuby's account username                                           | `''`        | N/A
| password       | **X** | Your Cuby's account password                                           | `''`        | N/A
| pollInterval           |  | Time in seconds the plugin will poll for updates on your devices       | `30`        | N/A
| displaySwitchesEnabled          |  | Whether or not to enable the "display" switch for each of your devices | `true`      | `true`, `false`
| turboSwitchesEnabled          |  | Whether or not to enable the "turbo" switch for each of your devices   | `true`      | `true`, `false`
| longSwitchesEnabled          |  | Whether or not to enable the "long" switch for each of your devices    | `true`      | `true`, `false`
| ecoSwitchesEnabled          |  | Whether or not to enable the "eco" switch for each of your devices     | `true`      | `true`, `false`


## Contributing

You can contribute to this homebridge plugin in following ways:

- [Report issues](https://github.com/mtflud/homebridge-cuby/issues) and help verify fixes as they are checked in.
- Review the [source code changes](https://github.com/mtflud/homebridge-cuby/pulls).
- Contribute bug fixes.
- Contribute changes to extend the capabilities

Pull requests are accepted.

## Disclaimer

All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
