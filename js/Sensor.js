class Sensor {
	constructor(device, type, eventListeners) {
		// check constructor

		this.device = device;
		this.type = type || this.constructor.name;
		this.listeners = eventListeners;		

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
		try {
			this.service.service = await this.device.server.getPrimaryService(this.service.uuid);

			for (let ch in this.characteristics) {
				this.characteristics[ch].characteristic = await this.service.service.getCharacteristic(this.characteristics[ch].uuid);

				if (this.constructor.name != 'CustomSensor') {
					this.characteristics[ch].properties = this.characteristics[ch].characteristic.properties;
				}
			}

      		console.log(`Connected to the ${this.type} sensor`);
      		return Promise.resolve();
		} catch (error) {
			this.notifyError(this, error);
			return Promise.reject();
		}
	}

	notifyError(sensorInstance, error) {
		console.log(`The ${sensorInstance.constructor.name} sensor has reported an error: ${error}`);
	}

	async _read(ch = 'default') {
		if (!this.characteristics[ch].properties.read) {
			let e = Error("This characteristic does not have the necessary read property");
			this.notifyError(this, e);

			return false;
		}

		try {
			const dataArray = await this.characteristics[ch].characteristic.readValue();
			return dataArray;
		} catch (error) {
			this.notifyError(this, error);
			return;
		}
  	}

  	async _write(dataArray, ch = 'default') {
  		if (!this.characteristics[ch].properties.write) {
			let e = Error("This characteristic does not have the necessary write property");
			this.notifyError(this, e);

			return false;
		}

		try {
			await this.characteristics[ch].characteristic.writeValue(dataArray);
			return;
		} catch (error) {
			this.notifyError(this, error);
			return;
		}
	}

	
	async _parse(ch = 'default', customHandler = undefined) {
		let data = await this._read(ch);

		if (data === false) {
			return;
		}

		if (customHandler) {
			return customHandler(data);
		} else {
			if (this.characteristics[ch].handler) {
				return this.characteristics[ch].handler(data);
			} else {
				let e = Error("You have not passed or created a handler for this");
				this.notifyError(this, e);

			return;
			}
			
		}
	}

	async _notify(enable, ch = 'default', customHandler = undefined) {
		if (!this.characteristics[ch].properties.notify) {
			let e = Error("This characteristic does not have the necessary notify property");
			this.notifyError(this, e);

			return false;
		}

		const characteristic = this.characteristics[ch].characteristic;
		let handler;

		if (customHandler) {
			handler = customHandler;
		} else {
			if (this.characteristics[ch].handler) {
				handler = this.characteristics[ch].handler;
			} else {
				let e = Error("You have not passed or created a handler for this characteristic");
				this.notifyError(this, e);

				return;
			}
		}

		let h = e => {
			handler(this.unpackEventData(e));
		}

		if (enable) {
			try {
				await characteristic.startNotifications();
				console.log("Notifications enabled for " + characteristic.uuid);

				characteristic.addEventListener("characteristicvaluechanged", h);
			} catch (error) {
				return error;
			}
		} else {
			try {
				await characteristic.stopNotifications();
				console.log("Notifications disabled for ", characteristic.uuid);

				characteristic.removeEventListener("characteristicvaluechanged", h);
			} catch (error) {
				return error;
			}
		}
	}

	getPermissions(characteristic) {
		return this.characteristics[ch].permissions;
	}

	unpackEventData(event) {
		let data;

		if (event.hasOwnProperty('target') && event.target.hasOwnProperty('value')) {
			data = event.target.value;
		} else {
			data = event;
		}

		return data;
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