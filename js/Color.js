import Sensor from './Sensor.js';

class Humidity extends Sensor {
	constructor(device) {
		super(device, 'temperature');

		// gatt service and characteristic used to communicate with thingy's temperature sensor
		this.service = {
			uuid: this.device.TES_UUID
		}

		this.characteristics = {
			default: {
				uuid: this.device.TES_COLOR_UUID,
				parser: this.parseHumidityData.bind(this)
			},
			config: {
				uuid: this.device.TES_CONFIG_UUID,
				parser: this.parseConfigData.bind(this)
			}
		}
	}

	parseHumidityData(data) {
		try {
		    const humidity = data.getUint8(0);

		    const formattedData = {
		    	value: humidity,
		    	unit: '%'
			}
			
			return formattedData;
	   	} catch (error) {
	   		return new Error(`Error when getting humidity data: ${error}`);
	   	}
	}

	parseConfigData(data) {
		try {
			const littleEndian = true;
			const tempInterval = data.getUint16(0, littleEndian);
			const pressureInterval = data.getUint16(2, littleEndian);
			const humidityInterval = data.getUint16(4, littleEndian);
			const colorInterval = data.getUint16(6, littleEndian);
			const gasMode = data.getUint8(8);
			const colorSensorRed = data.getUint8(9);
			const colorSensorGreen = data.getUint8(10);
			const colorSensorBlue = data.getUint8(11);

			const formattedData = {
				tempInterval: tempInterval,
				pressureInterval: pressureInterval,
				humidityInterval: humidityInterval,
				colorInterval: colorInterval,
				gasMode: gasMode,
				colorSensorRed: colorSensorRed,
				colorSensorGreen: colorSensorGreen,
				colorSensorBlue: colorSensorBlue
			};

			return formattedData;
	    } catch (error) {
	    	return new Error(`Error when getting environment sensors configurations: ${error}`);
	    }
	}

	async setInterval(interval) {
		try {
      if (interval < 200 || interval > 60000) {
        return Promise.reject(new RangeError("The color sensor sampling interval must be in the range 200 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read('config');
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = interval & 0xff;
      dataArray[7] = (interval >> 8) & 0xff;

      return await this._write(dataArray, 'config');
    } catch (error) {
      return new Error("Error when setting new color sensor update interval: " + error);
    }
	}
};

export default Humidity;