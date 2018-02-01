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
        decoder: this.decodeNameData.bind(this),
        encoder: this.encodeNameData.bind(this)
      }
    };
  }

  decodeNameData(data) {
    try {
      const decoder = new TextDecoder("utf-8");
      const name = decoder.decode(data);
      const formattedData = {
        name: {
          value: name,
        }
      };
      return formattedData;
    } catch (error) {
      return new Error(`Error when decoding name data: ${error}`);
    }
  }

  encodeNameData(data) {
    try {
      if (data.length > 10) {
        return Promise.reject(new TypeError("The name can't be more than 10 characters long."));
      }
      const byteArray = new Uint8Array(data.length);

      for (let i = 0; i < data.length; i += 1) {
        byteArray[i] = data.charCodeAt(i);
      }
    } catch (error) {
      return Promise.reject(new Error(`Error when encoding name data: ${error}`));
    }
  }
}

export default Name;
