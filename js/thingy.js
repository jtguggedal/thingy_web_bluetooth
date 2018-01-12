//import Temperature from './Temperature.js';

export class Thingy {
	constructor(options = {logEnabled: true}) {
    	console.log("I am alive!");

    	this.timestamp = 5;


    	//this.temperature = new Temperature();
    	this.latestReadingMap = new Map();

    	this.logEnabled = options.logEnabled;
    	this.device;
    	this.bleIsBusy = false;

    	// TCS = Thingy Configuration Service
	    this.TCS_UUID = "ef680100-9b35-4933-9b10-52ffa9740042";
	    this.TCS_NAME_UUID = "ef680101-9b35-4933-9b10-52ffa9740042";
	    this.TCS_ADV_PARAMS_UUID = "ef680102-9b35-4933-9b10-52ffa9740042";
	    this.TCS_CONN_PARAMS_UUID = "ef680104-9b35-4933-9b10-52ffa9740042";
	    this.TCS_EDDYSTONE_UUID = "ef680105-9b35-4933-9b10-52ffa9740042";
	    this.TCS_CLOUD_TOKEN_UUID = "ef680106-9b35-4933-9b10-52ffa9740042";
	    this.TCS_FW_VER_UUID = "ef680107-9b35-4933-9b10-52ffa9740042";
	    this.TCS_MTU_REQUEST_UUID = "ef680108-9b35-4933-9b10-52ffa9740042";

	    // TES = Thingy Environment Service
	    this.TES_UUID = "ef680200-9b35-4933-9b10-52ffa9740042";
	    this.TES_TEMP_UUID = "ef680201-9b35-4933-9b10-52ffa9740042";
	    this.TES_PRESSURE_UUID = "ef680202-9b35-4933-9b10-52ffa9740042";
	    this.TES_HUMIDITY_UUID = "ef680203-9b35-4933-9b10-52ffa9740042";
	    this.TES_GAS_UUID = "ef680204-9b35-4933-9b10-52ffa9740042";
	    this.TES_COLOR_UUID = "ef680205-9b35-4933-9b10-52ffa9740042";
	    this.TES_CONFIG_UUID = "ef680206-9b35-4933-9b10-52ffa9740042";

	    // TUIS = Thingy User Interface Service
	    this.TUIS_UUID = "ef680300-9b35-4933-9b10-52ffa9740042";
	    this.TUIS_LED_UUID = "ef680301-9b35-4933-9b10-52ffa9740042";
	    this.TUIS_BTN_UUID = "ef680302-9b35-4933-9b10-52ffa9740042";
	    this.TUIS_PIN_UUID = "ef680303-9b35-4933-9b10-52ffa9740042";

	    // TMS = Thingy Motion Service
	    this.TMS_UUID = "ef680400-9b35-4933-9b10-52ffa9740042";
	    this.TMS_CONFIG_UUID = "ef680401-9b35-4933-9b10-52ffa9740042";
	    this.TMS_TAP_UUID = "ef680402-9b35-4933-9b10-52ffa9740042";
	    this.TMS_ORIENTATION_UUID = "ef680403-9b35-4933-9b10-52ffa9740042";
	    this.TMS_QUATERNION_UUID = "ef680404-9b35-4933-9b10-52ffa9740042";
	    this.TMS_STEP_UUID = "ef680405-9b35-4933-9b10-52ffa9740042";
	    this.TMS_RAW_UUID = "ef680406-9b35-4933-9b10-52ffa9740042";
	    this.TMS_EULER_UUID = "ef680407-9b35-4933-9b10-52ffa9740042";
	    this.TMS_ROT_MATRIX_UUID = "ef680408-9b35-4933-9b10-52ffa9740042";
	    this.TMS_HEADING_UUID = "ef680409-9b35-4933-9b10-52ffa9740042";
	    this.TMS_GRAVITY_UUID = "ef68040a-9b35-4933-9b10-52ffa9740042";

	    // TSS = Thingy Sound Service
	    this.TSS_UUID = "ef680500-9b35-4933-9b10-52ffa9740042";
	    this.TSS_CONFIG_UUID = "ef680501-9b35-4933-9b10-52ffa9740042";
	    this.TSS_SPEAKER_DATA_UUID = "ef680502-9b35-4933-9b10-52ffa9740042";
	    this.TSS_SPEAKER_STAT_UUID = "ef680503-9b35-4933-9b10-52ffa9740042";
	    this.TSS_MIC_UUID = "ef680504-9b35-4933-9b10-52ffa9740042";

	    this.serviceUUIDs = [
	      "battery_service",
	      this.TCS_UUID,
	      this.TES_UUID,
	      this.TUIS_UUID,
	      this.TMS_UUID,
	      this.TSS_UUID,
	    ];
	}

	async activateSensor(sensor) {
		sensor.state = 'activated';

		await this.notifyActivatedState(sensor);
		return;
	}

	deactivateSensor(sensor) {
		sensor.state = 'idle';
		return;	
	}

	/*
	get valueFromLatestReading(sensor, key) {
		if (sensor.state != 'activated') {
			return null;
		}

		let reading = sensor.readings[sensor.readings.length - 1];
		
		return reading[key];
	}*/

	async notifyActivatedState(sensor) {
		sensor.state = 'activated';

		let event = new Event('activate');
		await sensor.dispatchEvent(event);

		return;
	}

	async notifyDeactivatedState(sensor) {
		sensor.state = 'idle';

		let event = new Event('activate');
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

			// Battery service
			const batteryService = await server.getPrimaryService("battery_service");
			this.batteryCharacteristic = await batteryService.getCharacteristic("battery_level");

			if (this.logEnabled) {
				console.log("Discovered battery service and battery level characteristic");
			}

			// Thingy configuration service
			this.configurationService = await server.getPrimaryService(this.TCS_UUID);
			this.nameCharacteristic = await this.configurationService.getCharacteristic(this.TCS_NAME_UUID);
			this.advParamsCharacteristic = await this.configurationService.getCharacteristic(this.TCS_ADV_PARAMS_UUID);
			this.cloudTokenCharacteristic = await this.configurationService.getCharacteristic(this.TCS_CLOUD_TOKEN_UUID);
			this.connParamsCharacteristic = await this.configurationService.getCharacteristic(this.TCS_CONN_PARAMS_UUID);
			this.eddystoneCharacteristic = await this.configurationService.getCharacteristic(this.TCS_EDDYSTONE_UUID);
			this.firmwareVersionCharacteristic = await this.configurationService.getCharacteristic(this.TCS_FW_VER_UUID);
			this.mtuRequestCharacteristic = await this.configurationService.getCharacteristic(this.TCS_MTU_REQUEST_UUID);

			if (this.logEnabled) {
				console.log("Discovered Thingy configuration service and its characteristics");
			}

			// Thingy environment service
			this.environmentService = await server.getPrimaryService(this.TES_UUID);
			this.temperatureCharacteristic = await this.environmentService.getCharacteristic(this.TES_TEMP_UUID);
			this.colorCharacteristic = await this.environmentService.getCharacteristic(this.TES_COLOR_UUID);
			this.gasCharacteristic = await this.environmentService.getCharacteristic(this.TES_GAS_UUID);
			this.humidityCharacteristic = await this.environmentService.getCharacteristic(this.TES_HUMIDITY_UUID);
			this.pressureCharacteristic = await this.environmentService.getCharacteristic(this.TES_PRESSURE_UUID);
			this.environmentConfigCharacteristic = await this.environmentService.getCharacteristic(this.TES_CONFIG_UUID);

			if (this.logEnabled) {
				console.log("Discovered Thingy environment service and its characteristics");
			}

			// Thingy user interface service
			this.userInterfaceService = await server.getPrimaryService(this.TUIS_UUID);
			this.buttonCharacteristic = await this.userInterfaceService.getCharacteristic(this.TUIS_BTN_UUID);
			this.ledCharacteristic = await this.userInterfaceService.getCharacteristic(this.TUIS_LED_UUID);
			this.externalPinCharacteristic = await this.userInterfaceService.getCharacteristic(this.TUIS_PIN_UUID);

			if (this.logEnabled) {
				console.log("Discovered Thingy user interface service and its characteristics");
			}

			// Thingy motion service
			this.motionService = await server.getPrimaryService(this.TMS_UUID);
			this.tmsConfigCharacteristic = await this.motionService.getCharacteristic(this.TMS_CONFIG_UUID);
			this.eulerCharacteristic = await this.motionService.getCharacteristic(this.TMS_EULER_UUID);
			this.gravityVectorCharacteristic = await this.motionService.getCharacteristic(this.TMS_GRAVITY_UUID);
			this.headingCharacteristic = await this.motionService.getCharacteristic(this.TMS_HEADING_UUID);
			this.orientationCharacteristic = await this.motionService.getCharacteristic(this.TMS_ORIENTATION_UUID);
			this.quaternionCharacteristic = await this.motionService.getCharacteristic(this.TMS_QUATERNION_UUID);
			this.motionRawCharacteristic = await this.motionService.getCharacteristic(this.TMS_RAW_UUID);
			this.rotationMatrixCharacteristic = await this.motionService.getCharacteristic(this.TMS_ROT_MATRIX_UUID);
			this.stepCharacteristic = await this.motionService.getCharacteristic(this.TMS_STEP_UUID);
			this.tapCharacteristic = await this.motionService.getCharacteristic(this.TMS_TAP_UUID);

			if (this.logEnabled) {
				console.log("Discovered Thingy motion service and its characteristics");
			}

			// Thingy sound service
			this.soundService = await server.getPrimaryService(this.TSS_UUID);
			this.tssConfigCharacteristic = await this.soundService.getCharacteristic(this.TSS_CONFIG_UUID);
			this.micCharacteristic = await this.soundService.getCharacteristic(this.TSS_MIC_UUID);
			this.speakerDataCharacteristic = await this.soundService.getCharacteristic(this.TSS_SPEAKER_DATA_UUID);
			this.speakerStatusCharacteristic = await this.soundService.getCharacteristic(this.TSS_SPEAKER_STAT_UUID);

			if (this.logEnabled) {
				console.log("Discovered Thingy sound service and its characteristics");
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
}