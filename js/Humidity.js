// @ts-check

import Sensor from "./Sensor.js";

class Humidity extends Sensor {
  constructor(device) {
    super(device, "humidity");

    // gatt service and characteristic used to communicate with thingy's humidity sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_HUMIDITY_UUID,
        decoder: this.decodeHumidityData.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
      },
    };
  }

  decodeHumidityData(data) {
    try {
      const humidity = data.getUint8(0);

      const formattedData = {
        value: humidity,
        unit: "%",
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
      if (interval < 100 || interval > 60000) {
        const e = new RangeError("The humidity sensor sampling interval must be in the range 100 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("config");
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = interval & 0xff;
      dataArray[5] = (interval >> 8) & 0xff;

      await this._write(dataArray, "config");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Humidity;
