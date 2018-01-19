import Sensor from './Sensor.js';

class CustomSensor extends Sensor {
	constructor(device, service, characteristics, type = undefined, eventListeners = []) {
		super(device, type, eventListeners);

		// gatt service and characteristic used to communicate with thingy's temperature sensor
		// should follow setup from named sensor classes such as Temperature.js, but with the addition of an object this.characteristics.myChar.properties,
		// consisting of the allowed BLE operations {read: true, notify: true}

		this.service = service;
		this.characteristics = characteristics;


	}
};

export default CustomSensor;