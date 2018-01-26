// @ts-check

import { EventTarget } from './EventTargetMixin';

class Sensor extends EventTarget{
	constructor(device, type) {
		super();
		this.device = device;
		this.type = type || this.constructor.name;		
	}

	async connect() {
		try {
			this.service.service = await this.device.server.getPrimaryService(this.service.uuid);

			for (let ch in this.characteristics) {
				this.characteristics[ch].characteristic = await this.service.service.getCharacteristic(this.characteristics[ch].uuid);

				if (this.constructor.name !== 'CustomSensor') {
					this.characteristics[ch].properties = this.characteristics[ch].characteristic.properties;
				}
			}

      		console.log(`Connected to the ${this.type} sensor`);
      		return Promise.resolve();
		} catch (error) {
			this.notifyError(error);
			return Promise.reject();
		}
	}

	notifyError(error) {
		console.log(`The ${this.type} sensor has reported an error: ${error}`);
	}

	async _read(ch = 'default') {
		if (!this.characteristics[ch].properties.read) {
			const e = Error("This characteristic does not have the necessary read property");
			this.notifyError(e);

			return false;
		}

		if (!window.busyGatt) {
			try {
				window.busyGatt = true;
				const dataArray = await this.characteristics[ch].characteristic.readValue();
				window.busyGatt = false;
				return this.characteristics[ch].parser(dataArray);
			} catch (error) {
				this.notifyError(error);
				return;
			}
		} else {
			const e = Error(`Could not read  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
			this.notifyError(e);
		}
  	}

  	async _write(dataArray, ch = 'default') {
  		if (!this.characteristics[ch].properties.write) {
			const e = Error("This characteristic does not have the necessary write property");
			this.notifyError(e);

			return false;
		}

		if (!window.busyGatt) {
			try {
				window.busyGatt = true;
				await this.characteristics[ch].characteristic.writeValue(dataArray);
				window.busyGatt = false;
			return;
			} catch (error) {
				this.notifyError(error);
				return;
			}
		} else {
			const e = Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
			this.notifyError(e);
		}
	}

	async _notify(enable, ch = 'default') {
		if (!this.characteristics[ch].properties.notify) {
			const e = Error("This characteristic does not have the necessary notify property");
			this.notifyError(e);

			return false;
		}

		let h;

		if (this.characteristics[ch].parser) {
			h = e => {
				this.logData(this.characteristics[ch].parser(this.unpackEventData(e)));
			}
		} else {
			const e = Error("The characteristic you're trying to notify does not have a specified parser");
			this.notifyError(e);
			return false;
		}

		const characteristic = this.characteristics[ch].characteristic;
		
		if (!window.busyGatt) {
			if (enable) {
				try {
					window.busyGatt = true;
					await characteristic.startNotifications()
					.then(char => {
						this.addEventListener("characteristicvaluechanged", h);
					})
					window.busyGatt = false;
					console.log(`Notifications enabled for the ${ch} characteristic of the ${this.type} sensor`);
					
					
				} catch (error) {
					return error;
				}
			} else {
				try {
					window.busyGatt = true;
					await characteristic.stopNotifications()
					.then(char => {
						this.removeEventListener("characteristicvaluechanged", h);
					})
					window.busyGatt = false;
					console.log("Notifications disabled for ", characteristic.uuid);
				} catch (error) {
					return error;
				}
			}

			window.busyGatt = false;
		} else {
			const e = Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
			this.notifyError(e);
		}
	}

	getPermissions(ch) {
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

	logData(data) {
		console.log(`\nNew reading from the ${this.type} sensor`);

		for (let d in data) {
			console.log(`${d}: ${data[d]}`);
		}
	}
};

export default Sensor;