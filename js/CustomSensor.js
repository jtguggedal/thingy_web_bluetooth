import Sensor from './Sensor.js';

class CustomSensor extends Sensor {
	constructor(device, service, characteristics, type = undefined, eventListeners = []) {
		super(device, type, eventListeners);

		// gatt service and characteristic used to communicate with thingy's temperature sensor
		this.service = service;
		this.characteristics = characteristics;
	}
};

export default CustomSensor;