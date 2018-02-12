import FeatureOperations from "./FeatureOperations.js";

class GravityVectorSensor extends FeatureOperations {
  constructor(device) {
    super(device, "gravityvector");

    // gatt service and characteristic used to communicate with Thingy's gravity vector sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_GRAVITY_UUID,
        decoder: this.decodeGravityVectorData.bind(this),
      },
      config: {
        uuid: this.device.TMS_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
      },
    };
  }

  decodeGravityVectorData(data) {
    try {
      const x = data.getFloat32(0, true);
      const y = data.getFloat32(4, true);
      const z = data.getFloat32(8, true);

      const formattedData = {
        value: {x: x, y: y, z: z},
      };

      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  decodeConfigData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeConfigData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default GravityVectorSensor;
