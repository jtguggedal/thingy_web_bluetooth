// @ts-check

import Sensor from "./Sensor.js";

class Orientation extends Sensor {
  constructor(device) {
    super(device, "orientation");

    // gatt service and characteristic used to communicate with thingy's orientation sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_ORIENTATION_UUID,
        decoder: this.decodeOrientationData.bind(this),
      }
    };
  }

  decodeOrientationData(data) {
    try {
      const orientation = data.getUint8(0);

      const formattedData = {
        orientation
      };
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Orientation;
