import FeatureOperations from "./FeatureOperations.js";

class TapSensor extends FeatureOperations {
  constructor(device) {
    super(device, "tap");

    // gatt service and characteristic used to communicate with Thingy's tap sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_TAP_UUID,
        decoder: this.decodeTapData.bind(this),
      }
    };
  }

  decodeTapData(data) {
    try {
        const direction = data.getUint8(0);
        const count = data.getUint8(1);

      const formattedData = {
        direction,
        count
      };
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default TapSensor;
