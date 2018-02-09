import Sensor from "./Sensor.js";

class LED extends Sensor {
  constructor(device) {
    super(device, "led");

    // gatt service and characteristic used to communicate with Thingy's LED
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
      let dataArray;

      switch (data.mode) {
        case 'constant': {
          if (data.red === undefined || data.green === undefined || data.blue === undefined) {
            const e = new Error("The options object for constant mode must contain the properties 'red', 'green', and 'blue'.");
            this.notifyError(e);
            throw e;
          }

          if (
            data.red < 0 ||
            data.red > 255 ||
            data.green < 0 ||
            data.green > 255 ||
            data.blue < 0 ||
            data.blue > 255
          ) {
            const e = new Error("The color values must be in the range 0 - 255");
            this.notifyError(e);
            throw e;
          }

          dataArray = new Uint8Array([1, data.red, data.green, data.blue]);
          break;
        }

        case 'breathe': {
          if (data.color === undefined || data.intensity === undefined || data.delay === undefined) {
            const e = new Error("The options object for breathe mode must have the properties 'color', 'intensity' and 'delay'.");
            this.notifyError(e);
            throw e;
          }

          const colors = ["red", "green", "yellow", "blue", "purple", "cyan", "white"];
          let colorCode;

          if (colors.indexOf(data.color) > -1) {
            colorCode = colors.indexOf(data.color) + 1
          } else if (typeof data.color === 'number' && (data.color > 0 && data.color < 8)) {
            colorCode = data.color;
          } else {
            const e = new Error(`The color must either be a recognized color (${colors.join(", ")}), or an integer in the interval 1 - 7`);
            this.notifyError(e);
            throw e;
          }

          if (data.intensity < 0 || data.intensity > 100) {
            const e = new Error("The intensity must be an integer in the interval 0 - 100");
            this.notifyError(e);
            throw e;
          }

          if (data.delay < 50 || data.delay > 10000) {
            const e = new Error("The delay must be an integer in the interval 50 - 10 000");
            this.notifyError(e);
            throw e;
          }

          dataArray = new Uint8Array([2, colorCode, data.intensity, data.delay & 0xff, (data.delay >> 8) & 0xff]);
          break;
        }

        case 'oneshot': {
          if (data.color === undefined || data.intensity === undefined) {
            const e = new Error("The options object for the one shot mode must have the properties 'color' and 'intensity.");
            this.notifyError(e);
            throw e;
          }

          if (data.color < 1 || data.color > 7) {
            const e = new Error("The color must either be a recognized color or an integer in the interval 1 - 7");
            this.notifyError(e);
            throw e;
          }

          if (data.intensity < 0 || data.intensity > 100) {
            const e = new Error("The intensity must be an integer in the interval 0 - 100");
            this.notifyError(e);
            throw e;
          }
      
          dataArray = new Uint8Array([3, data.color, data.intensity]);
          break;
        }

        case 'off': {
          dataArray = new Uint8Array([0]);
          break;
        }

        default: {
          dataArray = new Uint8Array([2, 6, 20, 3500]);
          break;
        }
      }
      console.log(dataArray);
      return dataArray;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default LED;
