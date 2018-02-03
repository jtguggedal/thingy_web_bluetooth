import Sensor from "./Sensor.js";

class Button extends Sensor {
  constructor(device) {
    super(device, "button");

    // gatt service and characteristic used to communicate with thingy's temperature sensor
    this.service = {
      uuid: this.device.TUIS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TUIS_BTN_UUID,
        decoder: this.decodeButtonData.bind(this),
      },
    };
  }

  decodeButtonData(data) {
    try {
      const state = data.getUint8(0);
      return state;
    } catch (error) {
      return new Error(`Error when getting temperature data: ${error}`);
    }
  }
}

export default Button;
