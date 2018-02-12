import FeatureOperations from "./FeatureOperations.js";

class MTUService extends FeatureOperations {
  constructor(device) {
    super(device, "mtu");

    // gatt service and characteristic used to communicate with Thingy's MTU
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
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeMtu(mtuSize, peripheralRequest = true) {
    try {
      if (mtuSize < 23 || mtuSize > 276) {
        const e = new Error("MTU size must be in range 23 - 276 bytes");
        this.notifyError(e);
        throw e;
      }

      const dataArray = new Uint8Array(3);
      dataArray[0] = peripheralRequest? 1 : 0;
      dataArray[1] = mtuSize & 0xff;
      dataArray[2] = (mtuSize >> 8) & 0xff;
      return dataArray;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default MTUService;
