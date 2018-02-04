// @ts-check

import Sensor from "./Sensor.js";

class Name extends Sensor {
  constructor(device) {
    super(device, "name");

    // gatt service and characteristic used to communicate with thingy's name configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_NAME_UUID,
        decoder: this.decodeName.bind(this),
        encoder: this.encodeName.bind(this),
      },
    };
  }

  decodeName(data) {
    try {
      const decoder = new TextDecoder("utf-8");
      const name = decoder.decode(data);
      const decodedName = {
        name: {
          value: name,
        },
      };
      return decodedName;
    } catch (error) {
      return new Error(`Error when decoding name data: ${error}`);
    }
  }

  encodeName(data) {
    try {
      if (data.length > 10) {
        return Promise.reject(new TypeError("The name can't be more than 10 characters long."));
      }
      const encodedName = new Uint8Array(data.length);

      for (let i = 0; i < data.length; i += 1) {
        encodedName[i] = data.charCodeAt(i);
      }
      return encodedName;
    } catch (error) {
      return Promise.reject(new Error(`Error when encoding name data: ${error}`));
    }
  }
}

export default Name;
