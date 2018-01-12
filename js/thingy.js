//import Temperature from './Temperature.js';

export class Thingy {
	constructor(options = {logEnabled: true}) {
    	console.log("I am alive!");

    	this.logEnabled = options.logEnabled;
	}

	async activateSensor(sensor) {
		sensor.state = 'activated';

		await this.notifyActivatedState(sensor);
		return;
	}

	deactivateSensor(sensor) {
		sensor.state = 'idle';

		await this.notifyIdleState(sensor);
		return;	
	}

	async notifyError(sensor, error) {
		sensor.state = 'idle';

		let event = new Event('error');
		console.log(event); // have to implement SensorErrorEvent Interface
		sensor.dispatchEvent(event);
	}

	async notifyActivatedState(sensorInstance) {
		sensor.state = 'activated';

		let event = new Event('activate');
		await sensor.dispatchEvent(event);

		return;
	}

	async notifyIdleState(sensor) {
		sensor.state = 'idle';

		let event = new Event('idle');
		await sensor.dispatchEvent(event);

		return;
	}
	
	async connect() {
    	try {
	      	// Scan for Thingys
	      	if (this.logEnabled) {
        		console.log(`Scanning for devices with service UUID equal to ${this.TCS_UUID}`);
      		}

      		this.device = await navigator.bluetooth.requestDevice({
        		filters: [{
        			services: [this.TCS_UUID],
            	}],
        		optionalServices: this.serviceUUIDs,
      		});

		    if (this.logEnabled) {
		    	console.log(`Found Thingy named "${this.device.name}", trying to connect`);
		    }

			// Connect to GATT server
			const server = await this.device.gatt.connect();

			if (this.logEnabled) {
				console.log(`Connected to "${this.device.name}"`);
			}

		} catch (error) {
			return error;
		}
	}

	async disconnect() {
    	try {
      		await this.device.gatt.disconnect();
    	} catch (error) {
      		return error;
    	}
  	}

  	async _readData(characteristic) {
    	if (!this.bleIsBusy) {
      		try {
		        this.bleIsBusy = true;
		        const dataArray = await characteristic.readValue();
		        this.bleIsBusy = false;

		        return dataArray;
		    } catch (error) {
		        return error;
		    }
	    } else {
	      	return Promise.reject(new Error("GATT operation already pending"));
	    }
	}

	async _writeData(characteristic, dataArray) {
    	if (!this.bleIsBusy) {
      		try {
		        this.bleIsBusy = true;
		        await characteristic.writeValue(dataArray);
		        this.bleIsBusy = false;
		    } catch (error) {
        		return error;
      		}
      		
      		return Promise.resolve();
	    } else {
	     	return Promise.reject(new Error("GATT operation already pending"));
	    }
  	}

  	createCustomSensor(options) {
  		// do title
  	}
}