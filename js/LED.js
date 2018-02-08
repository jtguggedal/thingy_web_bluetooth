import Sensor from "./Sensor.js";

class LED extends Sensor {
  constructor(device) {
    super(device, "humidity");

    // gatt service and characteristic used to communicate with thingy's humidity sensor
    this.service = {
      uuid: this.device.TUIS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TUIS_LED_UUID,
        decoder: this.decodeLedData.bind(this),
        encoder: this.encodeLedData.bind(this),
      }
    };
  }

  decodeLedData(data) {
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

  encodeLedData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setMode(mode, params) {
    try {
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

        case 'breathe': {
          if (params.color === undefined || params.intensity === undefined || params.delay === undefined) {
            const e = new Error("The options object for must have the properties 'color', 'intensity' and 'intensity'.");
            this.notifyError(e);
            throw e;
          }

          const colors = ["red", "green", "yellow", "blue", "purple", "cyan", "white"];
          let colorCode;

          if (colors.indexOf(params.color) > -1) {
            colorCode = colors.indexOf(params.color) + 1
          } else if (typeof params.color === 'number' && (params.color > 0 && params.color < 8)) {
            colorCode = params.color;
          } else {
            const e = new Error("The color must either be a recognized color or an integer in the interval 1 - 7");
            this.notifyError(e);
            throw e;
          }

          if (params.intensity < 0 || params.intensity > 100) {
            const e = new Error("The intensity must be an integer in the interval 0 - 100");
            this.notifyError(e);
            throw e;
          }

          if (params.delay < 50 || params.delay > 10000) {
            const e = new Error("The delay must be an integer in the interval 50 - 10 000");
            this.notifyError(e);
            throw e;
          }

          dataArray = new Uint8Array([2, colorCode, params.intensity, params.delay & 0xff, (params.delay >> 8) & 0xff]);
        }

        case 'oneshot': {
          if (params.color === undefined || params.intensity === undefined) {
            const e = new Error("The options object for LED one-shot must have the properties 'color' and 'intensity.");
            this.notifyError(e);
            throw e;
          }

          if (params.color < 1 || params.color > 7) {
            const e = new Error("The color must either be a recognized color or an integer in the interval 1 - 7");
            this.notifyError(e);
            throw e;
          }

          if (params.intensity < 0 || params.intensity > 100) {
            const e = new Error("The intensity must be an integer in the interval 0 - 100");
            this.notifyError(e);
            throw e;
          }
      
          dataArray = new Uint8Array([3, params.color, params.intensity]);
        }

        case 'off': {
          dataArray = new Uint8Array([0]);
        }

        default: {
          dataArray = new Uint8Array([2, 6, 20, 3500]);
        }
      }

      console.log(dataArray);

      this._write(dataArray);
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default LED;
