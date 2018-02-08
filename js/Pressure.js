// @ts-check

import Sensor from "./Sensor.js";

class Pressure extends Sensor {
  constructor(device) {
    super(device, "pressure");

    // gatt service and characteristic used to communicate with thingy's pressure sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_PRESSURE_UUID,
        decoder: this.decodePressureData.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
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
      if (interval < 50 || interval > 60000) {
        const e = new RangeError("The pressure sensor update interval must be in the range 100 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("config");
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[2] = interval & 0xff;
      dataArray[3] = (interval >> 8) & 0xff;

      await this._write(dataArray, "config");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Pressure;
