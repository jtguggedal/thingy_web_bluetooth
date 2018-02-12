import FeatureOperations from "./FeatureOperations.js";

class EulerOrientationSensor extends FeatureOperations {
  constructor(device) {
    super(device, "euler");

    // gatt service and characteristic used to communicate with Thingy's euler sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_EULER_UUID,
        decoder: this.decodeEulerData.bind(this),
      }
    };
  }

  decodeEulerData(data) {
    try {
      const littleEndian = true;

      const roll = data.getInt32(0, littleEndian) / 65536;
      const pitch = data.getInt32(4, littleEndian) / 65536;
      const yaw = data.getInt32(8, littleEndian) / 65536;

      const formattedData = {
        roll,
        pitch,
        yaw
      }
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default EulerOrientationSensor;
