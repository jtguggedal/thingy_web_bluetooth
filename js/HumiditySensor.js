import FeatureOperations from "./FeatureOperations.js";

class HumiditySensor extends FeatureOperations {
  constructor(device) {
    super(device, "humidity");

    // gatt service and characteristic used to communicate with Thingy's humidity sensor
    this.service = {
      uuid: this.device.TES_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TES_HUMIDITY_UUID,
        decoder: this.decodeHumidityData.bind(this),
      },
    };
  }

  decodeHumidityData(data) {
    try {
      const humidity = data.getUint8(0);

      const formattedData = {
        value: humidity,
        unit: "%",
      };

      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default HumiditySensor;
