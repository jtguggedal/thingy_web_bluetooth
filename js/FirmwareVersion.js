// @ts-check

import Sensor from "./Sensor.js";

class FirmwareVersion extends Sensor {
  constructor(device) {
    super(device, "firmware version");

    // gatt service and characteristic used to communicate with thingy's firmware version configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_FW_VER_UUID,
        decoder: this.decodeFirmwareVersion.bind(this),
      },
    };
  }

  decodeFirmwareVersion(data) {
    try {
      const major = data.getUint8(0);
      const minor = data.getUint8(1);
      const patch = data.getUint8(2);
      const version = `v${major}.${minor}.${patch}`;

      const decodedVersion = {
        firmware: {
          value: version,
        },
      };

      return decodedVersion;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default FirmwareVersion;
