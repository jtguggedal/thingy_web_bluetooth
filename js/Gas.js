import Sensor from "./Sensor.js";

class Gas extends Sensor {
  constructor(device, eventListeners = []) {
    super(device, "air quality");

    // gatt service and characteristic used to communicate with thingy's gas sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_GAS_UUID,
        parser: this.parseGasData.bind(this),
      },
      config: {
        uuid: this.device.TES_CONFIG_UUID,
        parser: this.parseConfigData.bind(this),
      },
    };
  }

  parseGasData(data) {
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
        return Promise.reject(new RangeError("The gas sensor interval has to be 1, 10 or 60 seconds."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = mode;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new gas sensor interval: " + error);
    }
  }
}

export default Gas;