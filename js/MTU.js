// @ts-check

import Sensor from "./Sensor.js";

class Mtu extends Sensor {
  constructor(device) {
    super(device, "mtu");

    // gatt service and characteristic used to communicate with thingy's mtu
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_MTU_REQUEST_UUID,
        decoder: this.decodeMtu.bind(this),
        encoder: this.encodeMtu.bind(this),
      },
    };
  }

  decodeMtu(mtuSize) {
    try {
      const littleEndian = true;
      const mtu = mtuSize.getUint16(1, littleEndian);

      return mtu;
    } catch (error) {
      return new Error(`Error when decoding mtu data: ${error}`);
    }
  }

  encodeMtu(mtuSize, peripheralRequest = false) {
    try {
      if (mtuSize < 23 || mtuSize > 276) {
        return Promise.reject(new Error("MTU size must be in range 23 - 276 bytes"));
      }

      const dataArray = new Uint8Array(3);
      dataArray[0] = peripheralRequest ? 1 : 0;
      dataArray[1] = mtuSize & 0xff;
      dataArray[2] = (mtuSize >> 8) & 0xff;

      return dataArray;
    } catch (error) {
      return Promise.reject(new Error(`Error when encoding mtu data: ${error}`));
    }
  }
}

export default Mtu;
