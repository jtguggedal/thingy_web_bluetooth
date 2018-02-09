// @ts-check

import Sensor from "./Sensor.js";

class Gas extends Sensor {
  constructor(device) {
    super(device, "gas");

    // gatt service and characteristic used to communicate with Thingy's gas sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_GAS_UUID,
        decoder: this.decodeGasData.bind(this),
      },
    };
  }

  decodeGasData(data) {
    try {
      const littleEndian = true;
      const eco2 = data.getUint16(0, littleEndian);
      const tvoc = data.getUint16(2, littleEndian);
      const formattedData = {
        eCO2: {
          value: eco2,
          unit: "ppm",
        },
        TVOC: {
          value: tvoc,
          unit: "ppb",
        },
      };
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Gas;
