import Sensor from './Sensor.js';

export default class Temperature extends Sensor {
	constructor(ts, fr) {
		if (fr )
		super('temperature', ts, fr, 'basic' /* PermissionName */);

		this.serviceUuid = "ef680200-9b35-4933-9b10-52ffa9740042";
		this.characteristicUuid = "ef680201-9b35-4933-9b10-52ffa9740042";
	}

	async connect() {
		this.service = await server.getPrimaryService(this.serviceUuid);
      	this.characteristic = await this.service.getCharacteristic(this.characteristicUuid);
	}
}