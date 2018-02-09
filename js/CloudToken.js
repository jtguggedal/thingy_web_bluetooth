// @ts-check

import Sensor from "./Sensor.js";

class CloudToken extends Sensor {
  constructor(device) {
    super(device, "cloudtoken");

    // gatt service and characteristic used to communicate with Thingy's cloud configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_CLOUD_TOKEN_UUID,
        decoder: this.decodeCloudToken.bind(this),
        encoder: this.encodeCloudToken.bind(this),
      },
    };
  }

  decodeCloudToken(data) {
    try {
      const decoder = new TextDecoder("utf-8");
      const token = decoder.decode(data);

      const decodedToken = {
        token: {
          value: token,
        },
      };
      return decodedToken;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeCloudToken(token) {
    try {
      if (token.length > 250) {
        const e = new Error("The cloud token can not exceed 250 characters.");
        this.notifyError(e);
        throw e;
      }

      const encoder = new TextEncoder("utf-8").encode(token);

      return encoder;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default CloudToken;
