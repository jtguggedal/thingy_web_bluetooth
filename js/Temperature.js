import Sensor from './Sensor.js';

export default class Temperature extends Sensor {
	constructor(ts, fr) {
		super('temperature', ts, fr)
		// check constructor
	}
}