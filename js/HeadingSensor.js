import FeatureOperations from "./FeatureOperations.js";

class HeadingSensor extends FeatureOperations {
  constructor(device) {
    super(device, "heading");

    // gatt service and characteristic used to communicate with Thingy's heading sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_HEADING_UUID,
        decoder: this.decodeHeadingData.bind(this),
      }
    };
  }

  decodeHeadingData(data) {
    try {
      const littleEndian = true;
      const heading = data.getInt32(0, littleEndian) / 65536;

      const formattedData = {
       heading
      };
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default HeadingSensor;
