import FeatureOperations from "./FeatureOperations.js";

class RawDataSensor extends FeatureOperations {
  constructor(device) {
    super(device, "rawdata");

    // gatt service and characteristic used to communicate with Thingy's raw data sensor
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_RAW_UUID,
        decoder: this.decodeRawDataData.bind(this),
      }
    };
  }

  decodeRawDataData(data) {
    try {
      const littleEndian = true;
      const accX = data.getInt16(0, littleEndian) / 64;
      const accY = data.getInt16(2, littleEndian) / 64;
      const accZ = data.getInt16(4, littleEndian) / 64;
  
      // Divide by 2^11 = 2048 to get correct gyroscope values
      const gyroX = data.getInt16(6, littleEndian) / 2048;
      const gyroY = data.getInt16(8, littleEndian) / 2048;
      const gyroZ = data.getInt16(10, littleEndian) / 2048;
  
      // Divide by 2^12 = 4096 to get correct compass values
      const compassX = data.getInt16(12, littleEndian) / 4096;
      const compassY = data.getInt16(14, littleEndian) / 4096;
      const compassZ = data.getInt16(16, littleEndian) / 4096;
  
      const formattedData = {
        accelerometer: {
          x: accX,
          y: accY,
          z: accZ,
          unit: "G",
        },
        gyroscope: {
          x: gyroX,
          y: gyroY,
          z: gyroZ,
          unit: "deg/s",
        },
        compass: {
          x: compassX,
          y: compassY,
          z: compassZ,
          unit: "microTesla",
        }
      }
      
      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default RawDataSensor;
