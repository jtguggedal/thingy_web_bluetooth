import Sensor from "./Sensor.js";

class LED extends Sensor {
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
      }
    };
  }

  decodeHumidityData(data) {
    try {
      const mode = data.getUint8(0);
      const littleEndian = true;
      let status;

      switch (mode) {
      case 0:
        status = {LEDstatus: {mode: mode}};
        break;
      case 1:
        status = {
          mode: mode,
          r: data.getUint8(1),
          g: data.getUint8(2),
          b: data.getUint8(3),
        };
        break;
      case 2:
        status = {
          mode: mode,
          color: data.getUint8(1),
          intensity: data.getUint8(2),
          delay: data.getUint16(3, littleEndian),
        };
        break;
      case 3:
        status = {
          mode: mode,
          color: data.getUint8(1),
          intensity: data.getUint8(2),
        };
        break;
      }
      return status;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setMode(mode, params) {
    let dataArray;

    switch (mode) {
      case 'constant': {
        if (params.red === undefined || params.green === undefined || params.blue === undefined) {
          const e = new Error("The params object must contain the properties 'red', 'green', and 'blue'.");
          this.notifyError(e);
          throw e;
        }

        if (
          params.red < 0 ||
          params.red > 255 ||
          params.green < 0 ||
          params.green > 255 ||
          params.blue < 0 ||
          params.blue > 255
        ) {
          const e = new Error("The color values must be in the range 0 - 255");
          this.notifyError(e);
          throw e;
        }

        dataArray = new Uint8Array([1, params.red, params.green, params.blue])
      }
    }
  }
}

export default LED;
