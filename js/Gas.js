// @ts-check

import Sensor from "./Sensor.js";

class Gas extends Sensor {
  constructor(device) {
    super(device, "gas");

    // gatt service and characteristic used to communicate with thingy's gas sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_GAS_UUID,
        decoder: this.decodeGasData.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
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

  decodeConfigData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeConfigData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setInterval(interval) {
    try {
      let mode;

      if (interval === 1) {
        mode = 1;
      } else if (interval === 10) {
        mode = 2;
      } else if (interval === 60) {
        mode = 3;
      } else {
        const e = new RangeError("The gas sensor interval has to be 1, 10 or 60 seconds.");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("config");
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = mode;

      await this._write(dataArray, "config");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Gas;
