import Sensor from "./Sensor.js";

class Name extends Sensor {
  constructor(device, eventListeners = []) {
    super(device, "name");

    // gatt service and characteristic used to communicate with thingy's gas sensor
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_NAME_UUID,
        decoder: this.decodeName.bind(this),
        encoder: this.encodeName.bind(this)
      }
    };
  }

  decodeName(name) {
    try {
      const decoder = new TextDecoder("utf-8");
      const decodedName = decoder.decode(name);
      const decodedData = {
        name: {
          value: decodedName,
        }
      };
      return decodedData;
    } catch (error) {
      return new Error(`Error when decoding name data: ${error}`);
    }
  }

  encodeName(name) {
    try {
      if (name.length > 10) {
        return Promise.reject(new TypeError("The name can't be more than 10 characters long."));
      }
      const encodedName = new Uint8Array(name.length);

      for (let i = 0; i < name.length; i += 1) {
        encodedName[i] = name.charCodeAt(i);
      }
      return encodedName;
    } catch (error) {
      return Promise.reject(new Error(`Error when encoding name data: ${error}`));
    }
  }
}

export default Name;
