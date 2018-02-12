import FeatureOperations from "./FeatureOperations.js";

class RotationMatrixOrientationSensor extends FeatureOperations {
  constructor(device) {
    super(device, "rotation");

    // gatt service and characteristic used to communicate with Thingy's rotation matrix sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_ROT_MATRIX_UUID,
        decoder: this.decodeRotationData.bind(this),
      }
    };
  }

  decodeRotationData(data) {
    try {
      // Divide by 2^2 = 4 to get correct values
      const r1c1 = data.getInt16(0, true) / 4;
      const r1c2 = data.getInt16(0, true) / 4;
      const r1c3 = data.getInt16(0, true) / 4;
      const r2c1 = data.getInt16(0, true) / 4;
      const r2c2 = data.getInt16(0, true) / 4;
      const r2c3 = data.getInt16(0, true) / 4;
      const r3c1 = data.getInt16(0, true) / 4;
      const r3c2 = data.getInt16(0, true) / 4;
      const r3c3 = data.getInt16(0, true) / 4;

      const formattedData = {
        row1: [r1c1, r1c2, r1c3],
        row2: [r2c1, r2c2, r2c3],
        row3: [r3c1, r3c2, r3c3],
      };
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default RotationMatrixOrientationSensor;
