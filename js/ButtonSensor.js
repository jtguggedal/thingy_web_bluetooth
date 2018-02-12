import FeatureOperations from "./FeatureOperations.js";

class ButtonSensor extends FeatureOperations {
  constructor(device) {
    super(device, "button");

    // gatt service and characteristic used to communicate with Thingy's button state
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
      const decodedButton = {
        value: state,
      };
      return decodedButton;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default ButtonSensor;
