// @ts-check

import Sensor from "./Sensor.js";

class Pressure extends Sensor {
  constructor(device) {
    super(device, "pressure");

    // gatt service and characteristic used to communicate with Thingy's pressure sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_PRESSURE_UUID,
        decoder: this.decodePressureData.bind(this),
      },
    };
  }

  decodePressureData(data) {
    try {
      const littleEndian = true;
      const integer = data.getUint32(0, littleEndian);
      const decimal = data.getUint8(4);
      const pressure = integer + decimal / 100;
      const formattedData = {
        value: pressure,
        unit: "hPa",
      };
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Pressure;
