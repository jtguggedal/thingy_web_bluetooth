import Sensor from "./Sensor.js";

class Color extends Sensor {
  constructor(device) {
    super(device, "color");

    // gatt service and characteristic used to communicate with thingy's temperature sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_COLOR_UUID,
        parser: this.parseColorData.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        parser: this.parseConfigData.bind(this),
      },
    };
  }

  parseColorData(data) {
    try {
      const littleEndian = true;
      const r = data.getUint16(0, littleEndian);
      const g = data.getUint16(2, littleEndian);
      const b = data.getUint16(4, littleEndian);
      const c = data.getUint16(6, littleEndian);
      const rRatio = r / (r + g + b);
      const gRatio = g / (r + g + b);
      const bRatio = b / (r + g + b);
      const clearAtBlack = 300;
      const clearAtWhite = 400;
      const clearDiff = clearAtWhite - clearAtBlack;
      let clearNormalized = (c - clearAtBlack) / clearDiff;

      if (clearNormalized < 0) {
        clearNormalized = 0;
      }

      let red = rRatio * 255.0 * 3 * clearNormalized;

      if (red > 255) {
        red = 255;
      }
      let green = gRatio * 255.0 * 3 * clearNormalized;

      if (green > 255) {
        green = 255;
      }
      let blue = bRatio * 255.0 * 3 * clearNormalized;

      if (blue > 255) {
        blue = 255;
      }

      const formattedData = {
        red: red.toFixed(0),
        green: green.toFixed(0),
        blue: blue.toFixed(0),
      };

      return formattedData;
    } catch (error) {
      return new Error(`Error when getting temperature data: ${error}`);
    }
  }

  parseConfigData(data) {
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
      return new Error(`Error when getting environment sensors configurations: ${error}`);
    }
  }

  /**
   *  Sets the color sensor update interval.
   *
   *  @async
   *  @param {Number} interval - Color sensor sampling interval in milliseconds. Must be in the range 200 ms to 60 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setInterval(interval) {
    try {
      if (interval < 200 || interval > 60000) {
        return Promise.reject(new RangeError("The color sensor sampling interval must be in the range 200 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("config");
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = interval & 0xff;
      dataArray[7] = (interval >> 8) & 0xff;

      return await this._write(dataArray, "config");
    } catch (error) {
      return new Error("Error when setting new color sensor update interval: " + error);
    }
  }

  /**
   *  Configures color sensor LED calibration parameters.
   *
   *  @async
   *  @param {Number} red - The red intensity, ranging from 0 to 255.
   *  @param {Number} green - The green intensity, ranging from 0 to 255.
   *  @param {Number} blue - The blue intensity, ranging from 0 to 255.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async colorSensorCalibrate(red, green, blue) {
    try {
      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[9] = red;
      dataArray[10] = green;
      dataArray[11] = blue;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new color sensor parameters: " + error);
    }
  }
}

export default Color;
