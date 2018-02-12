import FeatureOperations from "./FeatureOperations.js";

class CustomSensor extends FeatureOperations {
	constructor(device, service, characteristics, type = 'CustomFeature') {
		super(device, type);



		// should follow setup from implemented feature classes such as Temperature.js, but with the addition of a property called properties to each characteristic,
		// consisting of the allowed BLE operations {read: true, notify: true}

		this.service = service;
		this.characteristics = characteristics;
	}
};

export default CustomSensor;