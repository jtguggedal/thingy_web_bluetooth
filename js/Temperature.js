// @ts-check

import Sensor from "./Sensor.js";

class Temperature extends Sensor {
  constructor(device) {
    super(device, "temperature");

    // gatt service and characteristic used to communicate with thingy's temperature sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_TEMP_UUID,
        decoder: this.decodeTemperature.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
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
      if (interval < 100 || interval > 60000) {
        return Promise.reject(new RangeError("The temperature sensor update interval must be in the range 100 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("config");
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;

      await this._write(dataArray, "config");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Temperature;
