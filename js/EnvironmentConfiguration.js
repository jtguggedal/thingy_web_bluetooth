// @ts-check

import Sensor from "./Sensor.js";

class EnvironmentConfiguration extends Sensor {
  constructor(device) {
    super(device, "environmentconfiguration");

    // gatt service and characteristic used to communicate with thingy's environment configuration characteristic
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
      },
    };
  }

  decodeConfigData(data) {
    try {
      const littleEndian = true;
      const tempInterval = data.getUint16(0, littleEndian);
      const pressureInterval = data.getUint16(2, littleEndian);
      const humidityInterval = data.getUint16(4, littleEndian);
      const colorInterval = data.getUint16(6, littleEndian);
      const gasMode = data.getUint8(8);
      const colorSensorRed = data.getUint8(9);
      const colorSensorGreen = data.getUint8(10);
      const colorSensorBlue = data.getUint8(11);

      const formattedData = {
        tempInterval: tempInterval,
        pressureInterval: pressureInterval,
        humidityInterval: humidityInterval,
        colorInterval: colorInterval,
        gasMode: gasMode,
        colorSensorRed: colorSensorRed,
        colorSensorGreen: colorSensorGreen,
        colorSensorBlue: colorSensorBlue,
      };

      return formattedData;
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

  async setTemperatureInterval(interval) {
    try {
      if (interval < 100 || interval > 60000) {
        const e = new RangeError("The temperature sensor sampling interval must be in the range 100 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setPressureInterval(interval) {
    try {
      if (interval < 50 || interval > 60000) {
        const e = new RangeError("The pressure sensor sampling interval must be in the range 50 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[2] = interval & 0xff;
      dataArray[3] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setHumidityInterval(interval) {
    try {
      if (interval < 100 || interval > 60000) {
        const e = new RangeError("The humidity sensor sampling interval must be in the range 100 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = interval & 0xff;
      dataArray[5] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setColorInterval(interval) {
    try {
      if (interval < 200 || interval > 60000) {
        const e = new RangeError("The color sensor sampling interval must be in the range 200 ms - 60 000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = interval & 0xff;
      dataArray[7] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setGasInterval(interval) {
    try {
      let mode;

      if (interval === 1) {
        mode = 1;
      } else if (interval === 10) {
        mode = 2;
      } else if (interval === 60) {
        mode = 3;
      } else {
        const e = new RangeError("The gas sensor sampling interval has to be 1, 10 or 60 seconds.");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = mode;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async calibrateColorSensor(red, green, blue) {
    try {
      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[9] = red;
      dataArray[10] = green;
      dataArray[11] = blue;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default EnvironmentConfiguration;
