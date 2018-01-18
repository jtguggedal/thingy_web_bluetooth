class Sensor {
	constructor(device, type, eventListeners) {
		// check constructor

		this.device = device;
		this.type = type;
		this.listeners = eventListeners || [];

		/*this.state = 'idle';
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

		this.latestReading = new Map();
		this.latestReading.set('timestamp', null);*/
	}

	async connect() {
		console.log(this.serviceUuid);
		try {
			this.service = await this.device.server.getPrimaryService(this.serviceUuid);
			this.characteristics = {}

			for (let ch in this.characteristicUuids) {
				this.characteristics[ch] = await this.service.getCharacteristic(this.characteristicUuids[ch]);
			}

      		console.log(`Connected to the ${this.type} sensor`);
      		return Promise.resolve();
		} catch (error) {
			this.notifyError(this, error);
			return Promise.reject();
		}
	}

	notifyError(sensorInstance, error) {
		console.log(error);
	}

	async _read(characteristic) {
		try {
			const dataArray = await characteristic.readValue();
			return dataArray;
		} catch (error) {
			return error;
		}
  	}

  	async _write(characteristic, dataArray) {
		try {
			await characteristic.writeValue(dataArray);
			return;
		} catch (error) {
			return error;
		}
	}

	async _parse(ch = 'default', customHandler = undefined) {
		let data = await this._read(this.characteristics[ch]);

		if (customHandler) {
			return customHandler(data);
		} else {
			return this.handlers[ch](data);
		}
	}

	async _notify(enable, ch = 'default', hnd = 'default') {
		const characteristic = this.characteristics[ch];
		const handler = this.characteristics[hnd];

		if (ch != hnd) {
			console.log("Warning: handler does not match characteristic! Are you sure this is what you wanted to do?");
		}

		if (enable) {
			try {
				await characteristic.startNotifications();

				if (this.logEnabled) {
					console.log("Notifications enabled for " + characteristic.uuid);
				}

				characteristic.addEventListener("characteristicvaluechanged", handler);
			} catch (error) {
				return error;
			}
		} else {
			try {
				await characteristic.stopNotifications();

				if (this.logEnabled) {
					console.log("Notifications disabled for ", characteristic.uuid);
				}

				characteristic.removeEventListener("characteristicvaluechanged", handler);
			} catch (error) {
				return error;
			}
		}
	}

	emitData(data) {
		if (this.listeners.length > 0) {
			for (let listener of this.listeners) {
				listener(data);
			}
		} else {
			this.logData(data);
		}
	}

	logData(data) {
		console.log(`\nNew reading from the ${this.type} sensor`);

		for (let d in data) {
			console.log(`${d}: ${data[d]}`);
		}
	}

	addListener(listener) {
		const index = this.listeners.indexOf(listener);

		if (!(index > -1)) {
			this.listeners.push(listener);
		};
	}

	removeListener(listener) {
		const index = this.listeners.indexOf(listener);

		if (index > -1) {
			this.listeners.splice(index, 1);
		};
	}
};

export default Sensor;


/*
	
	async start() {
		let sensorState = this.state;

		if (sensorState == 'activating' || sensorState == 'activated') {
			return;
		}

		this.state = 'activating';

		let connected = await this.connect();

		if (!connected) {
			let e = new Error(`The ${this.type} sensor is not readable at the moment.`);

			await this.notifyError(this, e);
		}

		await this.device.activateSensor(this);
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

	onerror(error, sensorInstance) {
		console.log(`Error occurred during operations on ${sensorInstance}: ${error}`);
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

	newSensorInstance(options) {

	}

	notifyError(sensorInstance, error) {
		//this.device.... notify the device of a new error on a sensor instance
	}

	*/