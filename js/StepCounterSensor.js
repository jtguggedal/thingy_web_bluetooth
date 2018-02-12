import FeatureOperations from "./FeatureOperations.js";

class StepCounterSensor extends FeatureOperations {
  constructor(device) {
    super(device, "step");

    // gatt service and characteristic used to communicate with Thingy's step counter sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_STEP_UUID,
        decoder: this.decodeStepData.bind(this),
      }
    };
  }

  decodeStepData(data) {
    try {
      const littleEndian = true;
      const count = data.getUint32(0, littleEndian);
      const time = data.getUint32(4, littleEndian);

      const formattedData = {
        count,
        time: {
          value: time,
          unit: 'ms'
        }
      }
      console.log(formattedData);
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default StepCounterSensor;
