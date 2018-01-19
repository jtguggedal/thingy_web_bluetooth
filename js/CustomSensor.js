import Sensor from './Sensor.js';

class CustomSensor extends Sensor {
	constructor(device, service, characteristics, handlers, eventListeners = []) {
		super(device, 'temperature', eventListeners);

		// gatt service and characteristic used to communicate with thingy's temperature sensor
		this.serviceUuid = service;
		this.characteristicUuids = characteristics;
		this.handlers = handlers;
	}
};

export default CustomSensor;