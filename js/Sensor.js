export default class Sensor {
	constructor(type, ts, fr, device, characteristic) {
		// check constructor
		this.state = 'idle';
		this.DOMHighResTimeStamp = ts; // If the script's global object is a Window, the time origin is determined as follows: If the current Document is the first one loaded in the Window, the time origin is the time at which the browser context was created.
		this.frequency = fr;
		this.device = device;
		this.readings = [];
		this.type = type;

		this.lastEventFiredAt = null;
		this.pendingReadingNotification = false;

		this.addEventListener('activate', this.onActivate);
		this.addEventListener('error', this.onError);
		this.addEventListener('reading', this.onReading);

		this.characteristic = characteristic;
	}

	async start() {
		let sensor_state = this.state;

		if (sensor_state == 'activating' || sensor_state == 'activated') {
			return;
		}

		this.state = 'activating';

		let connected = await this.connect();

		if (!connected) {
			let e;

			try {
				e = throw new DOMException(`The ${this.type} sensor is not readable at the moment.`, 'NotReadableError');
			} catch {
				e = throw new Error(`The ${this.type} sensor is not readable at the moment.`);
			}

			await this.device.notifyError(this, e);
			return;
		}

		let permission_state = await this.device.requestSensorAccess(this);

		if (permission_state == 'granted') {
			await this.device.activateSensor(this);

			return;
		} else {
			let e;

			try {
				e = throw new DOMException(`You don't have the necessary permissions to access the ${this.type} sensor.`, 'NotAllowedError');
			} catch {
				e = throw new Error(`You don't have the necessary permissions to access the ${this.type} sensor.`);
			}

			await this.device.notifyError(this, e);

			return;
		}
	}

	async stop() {
		if (this.state == 'idle') {
			return;
		}

		this.state = 'idle';

		await this.device.deactivateSensor(this);
		return;
	}

	onactivate() {
		console.log(`${this.type} sensor is activated`);

		this.characteristic.startNotifications();
	}

	onerror() {
		console.log("I am error");
	}

	onreading() {
		console.log("I am read");
	}

	get activated() {
		return this.state == 'activated' ? true : false;
	}

	get hasReading() {
		let timestamp = this.getValueFromLatestReading(this, "timestamp");


		if (timestamp != null) {
			return true;
		} else {
			return false;
		}
	}

	getValueFromLatestReading(sensor, value) {
		if (this.state == 'activated') {
			const numReadings = sensor.readings.length;

			if (numReadings > 0) {
				return sensor.readings[numReadings - 1][value];
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	get timestamp() {
		return this.getValueFromLatestReading(this, "timestamp");
	}
}