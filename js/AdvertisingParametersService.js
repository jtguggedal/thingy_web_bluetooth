import FeatureOperations from "./FeatureOperations.js";

class AdvertisingParametersService extends FeatureOperations {
  constructor(device) {
    super(device, "advertisingparameters");

    // gatt service and characteristic used to communicate with thingy's advertising parameters configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_ADV_PARAMS_UUID,
        decoder: this.decodeAdvertisingParam.bind(this),
        encoder: this.encodeAdvertisingParam.bind(this),
      },
    };
  }

  decodeAdvertisingParam(data) {
    try {
      // Interval is given in units of 0.625 milliseconds
      const littleEndian = true;
      const interval = (data.getUint16(0, littleEndian) * 0.625).toFixed(0);
      const timeout = data.getUint8(2);
      const decodedAdvertisingParams = {
        interval: {
          interval: interval,
          unit: "ms",
        },
        timeout: {
          timeout: timeout,
          unit: "s",
        },
      };
      return decodedAdvertisingParams;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeAdvertisingParam(params) {
    try {
      if (typeof params !== "object" || params.interval === undefined || params.timeout === undefined) {
        const e = new RangeError("The argument has to be an object with key/value pairs interval' and 'timeout': {interval: someInterval, timeout: someTimeout}");
        this.notifyError(e);
        throw e;
      }

      // Interval is in units of 0.625 ms.
      const interval = params.interval * 1.6;
      const timeout = params.timeout;

      // Check parameters
      if (interval < 32 || interval > 8000) {
        const e = new RangeError("The advertising interval must be within the range of 20 ms to 5 000 ms");
        this.notifyError(e);
        throw e;
      }
      if (timeout < 0 || timeout > 180) {
        const e = new RangeError("The advertising timeout must be within the range of 0 to 180 s");
        this.notifyError(e);
        throw e;
      }

      const dataArray = new Uint8Array(3);
      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;
      dataArray[2] = timeout;

      return dataArray;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default AdvertisingParametersService;
