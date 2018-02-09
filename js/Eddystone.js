import Sensor from "./Sensor.js";

class Eddystone extends Sensor {
  constructor(device) {
    super(device, "eddystone");

    // gatt service and characteristic used to communicate with Thingy's Eddystone url
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_EDDYSTONE_UUID,
        decoder: this.decodeEddystoneData.bind(this),
      },
    };
  }

  decodeEddystoneData(data) {
    try {
      // According to Eddystone URL encoding specification, certain elements can be expanded: https://github.com/google/eddystone/tree/master/eddystone-url
      const prefixArray = ["http://www.", "https://www.", "http://", "https://"];
      const expansionCodes = [
        ".com/",
        ".org/",
        ".edu/",
        ".net/",
        ".info/",
        ".biz/",
        ".gov/",
        ".com",
        ".org",
        ".edu",
        ".net",
        ".info",
        ".biz",
        ".gov",
      ];
      const prefix = prefixArray[data.getUint8(0)];
      const decoder = new TextDecoder("utf-8");
      let url = decoder.decode(data);
      url = prefix + url.slice(1);

      expansionCodes.forEach((element, i) => {
        if (url.indexOf(String.fromCharCode(i)) !== -1) {
          url = url.replace(String.fromCharCode(i), expansionCodes[i]);
        }
      });
  
      return new URL(url);
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default Eddystone;