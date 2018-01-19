import Sensor from './Sensor.js';

class Microphone extends Sensor {
	constructor(device, eventListeners = []) {
		super(device, 'microphone', eventListeners);

		// gatt service and characteristic used to communicate with thingy's temperature sensor
		this.service = {
			uuid: this.device.TSS_UUID
		}

		this.characteristics = {
			default: {
				uuid: this.device.TSS_MIC_UUID,
				handler: this.parseMicrophoneData.bind(this)
			}
		}
	}

	parseMicrophoneData(data) {
		console.log(data);
	}
};

export default Microphone;