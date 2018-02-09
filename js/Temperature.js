// @ts-check

import Sensor from "./Sensor.js";

class Temperature extends Sensor {
  constructor(device) {
    super(device, "temperature");

    // gatt service and characteristic used to communicate with Thingy's temperature sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_TEMP_UUID,
        decoder: this.decodeTemperature.bind(this),
      },
    };
  }

  decodeTemperature(data) {
    try {
      const integer = data.getUint8(0);
      const decimal = data.getUint8(1);
      const temperature = integer + decimal / 100;

      const decodedTemperature = {
        value: temperature,
        unit: "Celsius",
      };

      return decodedTemperature;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Temperature;
