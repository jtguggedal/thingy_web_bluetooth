
/** 
 *  Thingy:52 Web Bluetooth API. <br> 
 *  BLE service details {@link https://nordicsemiconductor.github.io/Nordic-Thingy52-FW/documentation/firmware_architecture.html#fw_arch_ble_services here}
 * 
 *  
 *  @constructor   
 *  @param {bool} [logEnabled = true] Enables logging of all BLE actions.
 * 
*/

function Thingy(logEnabled = true) {
	this.logEnabled = logEnabled;

	// TCS = Thingy Configuration Service
	this.TCS_UUID               = "ef680100-9b35-4933-9b10-52ffa9740042";
	this.TCS_NAME_UUID          = "ef680101-9b35-4933-9b10-52ffa9740042";
	this.TCS_ADV_PARAMS_UUID    = "ef680102-9b35-4933-9b10-52ffa9740042";
	this.TCS_CONN_PARAMS_UUID   = "ef680104-9b35-4933-9b10-52ffa9740042";
	this.TCS_EDDYSTONE_UUID     = "ef680105-9b35-4933-9b10-52ffa9740042";
	this.TCS_CLOUD_TOKEN_UUID   = "ef680106-9b35-4933-9b10-52ffa9740042";
	this.TCS_FW_VER_UUID        = "ef680107-9b35-4933-9b10-52ffa9740042";
	this.TCS_MTU_REQUEST_UUID   = "ef680108-9b35-4933-9b10-52ffa9740042";

	// TES = Thingy Environment Service
	this.TES_UUID               = "ef680200-9b35-4933-9b10-52ffa9740042";
	this.TES_TEMP_UUID          = "ef680201-9b35-4933-9b10-52ffa9740042";
	this.TES_PRESSURE_UUID      = "ef680202-9b35-4933-9b10-52ffa9740042";
	this.TES_HUMIDITY_UUID      = "ef680203-9b35-4933-9b10-52ffa9740042";
	this.TES_GAS_UUID           = "ef680204-9b35-4933-9b10-52ffa9740042";
	this.TES_COLOR_UUID         = "ef680205-9b35-4933-9b10-52ffa9740042";
	this.TES_CONFIG_UUID        = "ef680206-9b35-4933-9b10-52ffa9740042";

	// TUIS = Thingy User Interface Service
	this.TUIS_UUID              = "ef680300-9b35-4933-9b10-52ffa9740042";
	this.TUIS_LED_UUID          = "ef680301-9b35-4933-9b10-52ffa9740042";
	this.TUIS_BTN_UUID          = "ef680302-9b35-4933-9b10-52ffa9740042";
	this.TUIS_PIN_UUID          = "ef680303-9b35-4933-9b10-52ffa9740042";

	// TMS = Thingy Motion Service
	this.TMS_UUID               = "ef680400-9b35-4933-9b10-52ffa9740042";
	this.TMS_CONFIG_UUID        = "ef680401-9b35-4933-9b10-52ffa9740042";
	this.TMS_TAP_UUID           = "ef680402-9b35-4933-9b10-52ffa9740042";
	this.TMS_ORIENTATION_UUID   = "ef680403-9b35-4933-9b10-52ffa9740042";
	this.TMS_QUATERNION_UUID    = "ef680404-9b35-4933-9b10-52ffa9740042";
	this.TMS_STEP_UUID          = "ef680405-9b35-4933-9b10-52ffa9740042";
	this.TMS_RAW_UUID           = "ef680406-9b35-4933-9b10-52ffa9740042";
	this.TMS_EULER_UUID         = "ef680407-9b35-4933-9b10-52ffa9740042";
	this.TMS_ROT_MATRIX_UUID    = "ef680408-9b35-4933-9b10-52ffa9740042";
	this.TMS_HEADING_UUID       = "ef680409-9b35-4933-9b10-52ffa9740042";
	this.TMS_gravityVector_UUID = "ef68040a-9b35-4933-9b10-52ffa9740042";

	// TSS = Thingy Sound Service
	this.TSS_UUID               = "ef680500-9b35-4933-9b10-52ffa9740042";
	this.TSS_CONFIG_UUID        = "ef680501-9b35-4933-9b10-52ffa9740042";
	this.TSS_SPEAKER_DATA_UUID  = "ef680502-9b35-4933-9b10-52ffa9740042";
	this.TSS_SPEAKER_STAT_UUID  = "ef680503-9b35-4933-9b10-52ffa9740042";
	this.TSS_MIC_UUID           = "ef680504-9b35-4933-9b10-52ffa9740042";

	this.serviceUUIDs = [
		"battery_service",
		this.TCS_UUID,
		this.TES_UUID,
		this.TUIS_UUID,
		this.TMS_UUID,
		this.TSS_UUID
	];

	let device;
	let bleIsBusy = false;
    
	this.device = device;
	this.batteryLevelEventListeners     = [null, []];
	this.tempEventListeners             = [null, []];
	this.pressureEventListeners         = [null, []];
	this.humidityEventListeners         = [null, []];
	this.gasEventListeners              = [null, []];
	this.colorEventListeners            = [null, []];
	this.buttonEventListeners           = [null, []];
	this.tapEventListeners              = [null, []];
	this.orientationEventListeners      = [null, []];
	this.quaternionEventListeners       = [null, []];
	this.stepEventListeners             = [null, []];
	this.motionRawEventListeners        = [null, []];
	this.eulerEventListeners            = [null, []];
	this.rotationMatrixEventListeners   = [null, []];
	this.headingEventListeners          = [null, []];
	this.gravityVectorEventListeners    = [null, []];
	this.speakerStatusEventListeners    = [null, []];
	this.micMatrixEventListeners        = [null, []];
	this.microphoneEventListeners		= [null, []];



	/**
     *  Method to write data to a Web Bluetooth characteristic.
     *  Implements a simple solution to avoid starting new GATT requests while another is pending.
     *  Any attempt to send data during another GATT operation will result in a rejected promise.
     *  No retransmission is implemented at this level.
     * 
     *  @param {Object} characteristic - Web Bluetooth characteristic object
     *  @param {Uint8Array} dataArray - Typed array of bytes to send
     *  @return {Promise} 
     */
	this.writeData = function(characteristic, dataArray) {
		return new Promise(function(resolve, reject) {
			if(!bleIsBusy){
				bleIsBusy = true;
				return characteristic.writeValue(dataArray)
					.then( () => {
						bleIsBusy = false;
						if (this.logEnabled)
							console.log("Successfully sent ", dataArray);
						resolve();
					});
			} else {
				reject(new Error("GATT operation already pending"));
			}
		});
	};

	/**
     *  Method to read data from a Web Bluetooth characteristic. 
     *  Implements a simple solution to avoid starting new GATT requests while another is pending.
     *  Any attempt to read while another GATT operation is in progress, will result in a rejected promise.
     * 
     *  @param {Object} characteristic - Web Bluetooth characteristic object
     *  @return {Promise<Uint8Array|Error>} Returns Uint8Array when resolved or an error when rejected
     * 
     */
	this.readData = function(characteristic) {
		return new Promise(function(resolve, reject) {
			if(!bleIsBusy){
				bleIsBusy = true;
				characteristic.readValue()
					.then( (dataArray) => {
						bleIsBusy = false;
						if (this.logEnabled)
							console.log("Received ", dataArray);
						resolve(dataArray);
					});
			} else {
				reject(new Error("GATT operation already pending"));
			}
		});
	};
}

/**
 *  Connects to Thingy.
 *  The function stores all discovered services and characteristics to the Thingy object.
 * 
 *  @return {Promise<Error>} Returns an empty promise when resolved or a promise with error on rejection
 * 
 */
Thingy.prototype.connect = function() {
	if (this.logEnabled)
		console.log("Scanning for devices with service UUID " + this.TCS_UUID);
	return navigator.bluetooth.requestDevice({
		filters: [{
			services: [this.TCS_UUID]
		}],
		optionalServices: this.serviceUUIDs
	})
		.then(d => {
			this.device = d;
			if (this.logEnabled)
				console.log("Found Thingy named \"" + this.device.name + "\", trying to connect");
			return this.device.gatt.connect();
		})
		.then( server => {
			this.server = server;

			if(this.logEnabled)
				console.log("Connected to \"" + this.device.name + "\"");

			return Promise.all([
				server.getPrimaryService("battery_service")
					.then( service => {
						service.getCharacteristic("battery_level")
							.then( characteristic => { 
								this.batteryCharacteristic = characteristic; 
								if(this.logEnabled)
									console.log("Discovered battery service and battery level characteristic");
							});
					}),
				server.getPrimaryService(this.TCS_UUID)
					.then( service =>  {
						this.configurationService = service;
						return Promise.all([
							service.getCharacteristic(this.TCS_NAME_UUID)
								.then( characteristic => { 
									this.nameCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_ADV_PARAMS_UUID)
								.then( characteristic => { 
									this.advParamsCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_CLOUD_TOKEN_UUID)
								.then( characteristic => { 
									this.cloudTokenCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_CONN_PARAMS_UUID)
								.then( characteristic => { 
									this.connParamsCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_EDDYSTONE_UUID)
								.then( characteristic => { 
									this.eddystoneCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_FW_VER_UUID)
								.then( characteristic => { 
									this.firmwareVersionCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TCS_MTU_REQUEST_UUID)
								.then( characteristic => { 
									this.mtuRequestCharacteristic = characteristic; 
								})
								.catch( error => { 
									console.log("Error while getting characteristic: " , error);
								})
						])
							.then( () => {
								if(this.logEnabled)
									console.log("Discovered Thingy configuration service and its characteristics");
							});
					}),
				server.getPrimaryService(this.TES_UUID)
					.then( service => {
						this.environmentService = service;
						return Promise.all([
							service.getCharacteristic(this.TES_TEMP_UUID)
								.then( characteristic => { 
									this.temperatureCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TES_COLOR_UUID)
								.then( characteristic => { 
									this.colorCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TES_GAS_UUID)
								.then( characteristic => { 
									this.gasCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TES_HUMIDITY_UUID)
								.then( characteristic => { 
									this.humidityCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TES_PRESSURE_UUID)
								.then( characteristic => { 
									this.pressureCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TES_CONFIG_UUID)
								.then( characteristic => { 
									this.environmentConfigCharacteristic = characteristic; 
								})
								.catch( error => { 
									console.log("Error while getting characteristic: " , error);
								})
						])
							.then( () => {
								if(this.logEnabled)
									console.log("Discovered Thingy environment service and its characteristics");
							});
					}),
				server.getPrimaryService(this.TUIS_UUID)
					.then( service => {
						this.userInterfaceService = service;
						return Promise.all([
							service.getCharacteristic(this.TUIS_BTN_UUID)
								.then( characteristic => { 
									this.buttonCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TUIS_LED_UUID)
								.then( characteristic => { 
									this.ledCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TUIS_PIN_UUID)
								.then( characteristic => { 
									this.externalPinCharacteristic = characteristic; 
								})
								.catch( error => { 
									console.log("Error while getting characteristic: " , error);
								})
						])
							.then( () => {
								if(this.logEnabled)
									console.log("Discovered Thingy user interface service and its characteristics");
							});
					}),
				server.getPrimaryService(this.TMS_UUID)
					.then( service => {
						this.motionService = service;
						return Promise.all([
							service.getCharacteristic(this.TMS_CONFIG_UUID)
								.then( characteristic => { 
									this.tmsConfigCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_EULER_UUID)
								.then( characteristic => { 
									this.eulerCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_gravityVector_UUID)
								.then( characteristic => { 
									this.gravityVectorCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_HEADING_UUID)
								.then( characteristic => { 
									this.headingCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_ORIENTATION_UUID)
								.then( characteristic => { 
									this.orientationCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_QUATERNION_UUID)
								.then( characteristic => { 
									this.quaternionCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_RAW_UUID)
								.then( characteristic => { 
									this.motionRawCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_ROT_MATRIX_UUID)
								.then( characteristic => { 
									this.rotationMatrixCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_STEP_UUID)
								.then( characteristic => { 
									this.stepCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TMS_TAP_UUID)
								.then( characteristic => { 
									this.tapCharacteristic = characteristic; 
								})
								.catch( error => { 
									console.log("Error while getting characteristic: " , error);
								})
						])
							.then( () => {
								if(this.logEnabled)
									console.log("Discovered Thingy motion service and its characteristics");
							});
					}),
				server.getPrimaryService(this.TSS_UUID)
					.then( service => {
						this.soundService = service;
						return Promise.all([
							service.getCharacteristic(this.TSS_CONFIG_UUID)
								.then( characteristic => { 
									this.tssConfigCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TSS_MIC_UUID)
								.then( characteristic => { 
									this.microphoneCharacteristic = characteristic;

									// Tables of constants needed for when we decode the adpcm-encoded audio from the Thingy
									this.MICROPHONE_INDEX_TABLE = [-1, -1, -1, -1, 2, 4, 6, 8, -1, -1, -1, -1, 2, 4, 6, 8,];
									this.MICROPHONE_STEP_SIZE_TABLE = [
										7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209,
								        230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358,
								        5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767
								    ];

								    // Get endianness of system (ArrayBuffer used for decoding microphone audio utilizes underlying system's endianness)
									(new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12) ? this.endianness = 'BE' : this.endianness = 'LE';
								}),
							service.getCharacteristic(this.TSS_SPEAKER_DATA_UUID)
								.then( characteristic => { 
									this.speakerDataCharacteristic = characteristic; 
								}),
							service.getCharacteristic(this.TSS_SPEAKER_STAT_UUID)
								.then( characteristic => { 
									this.speakerStatusCharacteristic = characteristic; 
								})
								.catch( error => { 
									console.log("Error while getting characteristic: " , error);
								})
						])
							.then( () => {
								if(this.logEnabled)
									console.log("Discovered Thingy sound service and its characteristics");
							});
					})
					.catch(error => {
						console.log("Error during service discovery: ", error);
					})
			]);
		})
		.catch(error => {
			console.log("Error during connect: ", error);
		});
};

/**
 *  Method to disconnect from Thingy.
 * 
 *  @return {Promise<Error>} Returns an empty promise when resolved or a promise with error on rejection.
 * 
 */

Thingy.prototype.disconnect = function() {
	return new Promise((resolve, reject) => {
		this.device.gatt.disconnect();
		if (this.device.gatt.connected == false) {
			this.isConnected = false;
			resolve();
		} else {
			reject(new Error("Error on disconnect"));
		}
	});
};


Thingy.prototype.notifyCharacteristic = function(characteristic, enable, notifyHandler) {
	if(enable) {
		return characteristic.startNotifications()
			.then( () => {
				if(this.logEnabled)
					console.log("Notifications enabled for " + characteristic.uuid);
				characteristic.addEventListener("characteristicvaluechanged", notifyHandler);
			})
			.catch( error => {
				console.log("Error when enabling notifications for " + characteristic.uuid + ": " , error);
			});
	} else {
		return characteristic.stopNotifications()
			.then( () => {
				if(this.logEnabled)
					console.log("Notifications disabled for ", characteristic.uuid);
				characteristic.removeEventListener("characteristicvaluechanged", notifyHandler);
			})
			.catch( error => {
				console.log("Error when disabling notifications for " + characteristic.uuid + ": " , error);
			});
	}
};


/*  Configuration service  */

/**
 *  Gets the name of the Thingy device.
 * 
 *  @return {Promise<string|Error>} Returns a string with the name when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.nameGet = function() {
	return this.readData(this.nameCharacteristic)
		.then( receivedData => {
			let decoder = new TextDecoder("utf-8");
			let name = decoder.decode(receivedData);
			if(this.logEnabled)
				console.log("Received device name: " + name);
			return Promise.resolve(name);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the name of the Thingy device.
 * 
 *  @param {string} name - The name that will be given to the Thingy.
 *  @return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.nameSet = function(name) {
	let byteArray = new Uint8Array(name.length);
	for(let i = 0, j = name.length; i < j; ++i){
		byteArray[i] = name.charCodeAt(i);
	}
	return this.writeData(this.nameCharacteristic, byteArray);
};

/**
 *  Gets the current advertising parameters
 * 
 *  @return {Promise<Object|Error>} Returns an object with the advertising parameters when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.advParamsGet = function() {
	return this.readData(this.advParamsCharacteristic)
		.then( receivedData => {
			// Interval is given in units of 0.625 milliseconds
			let interval = parseInt(receivedData.getUint16(0, true) * 0.625);
			let timeout = receivedData.getUint8(2);
			let params = {
				"interval": {
					"interval": interval,
					"unit": "ms"
				},
				"timeout":  {
					"timeout": timeout,
					"unit": "s"
				}
			};
			return Promise.resolve(params);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the advertising parameters
 * 
 *  @param {string} interval - The advertising interval in milliseconds in the range of 20 ms to 5 000 ms. 
 *  @param {string} timeout - The advertising timeout in seconds in the range 1 s to 180 s.
 *  @return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.advParamsSet = function(interval, timeout) {
    
	// Interval is in units of 0.625 ms.
	interval = interval * 1.6;

	// Check parameters
	if((interval < 32) || (interval > 8000)) {
		return Promise.reject(new Error("The advertising interval must be within the range of 20 ms to 5 000 ms"));
	}

	if((timeout < 0) || (timeout > 180)) {
		return Promise.reject(new Error("The advertising timeout must be within the range of 0 to 180 s"));
	}

	let dataArray = new Uint8Array(3);
    
	dataArray[0] = interval & 0xFF;
	dataArray[1] = (interval >> 8) & 0xFF;
	dataArray[2] = timeout;

	return this.writeData(this.advParamsCharacteristic, dataArray);
};

/**
 *  Gets the current connection parameters.
 * 
 *  @return {Promise<Object|Error>} Returns an object with the connection parameters when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.connParamsGet = function() {
	return this.readData(this.connParamsCharacteristic)
		.then( receivedData => {

			// Connection intervals are given in units of 1.25 ms
			let minConnInterval = receivedData.getUint16(0, true) * 1.25;
			let maxConnInterval = receivedData.getUint16(2, true) * 1.25;
			let slaveLatency 	= receivedData.getUint16(4, true);

			// Supervision timeout is given i units of 10 ms
			let supervisionTimeout 		= receivedData.getUint16(6, true) * 10;
			let params = {
				"interval": {
					"min": minConnInterval,
					"max": maxConnInterval,
					"unit": "ms"
				},
				"slaveLatency" : {
					"value": slaveLatency,
					"unit": "number of connection intervals"
				},
				"supervisionTimeout":  {
					"timeout": supervisionTimeout,
					"unit": "ms"
				}
			};
			return Promise.resolve(params);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the connection interval
 * 
 *  @param {string} minInterval - The minimum connection interval in milliseconds. Must be >= 7.5 ms. 
 *  @param {string} maxInterval - The maximum connection interval in milliseconds. Must be <= 4 000 ms.
 *  @return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.connIntervalSet = function(minInterval, maxInterval) {
    
	// Check parameters
	if((minInterval < 7.5) || (minInterval > maxInterval)) {
		return Promise.reject(new Error("The minimum connection interval must be greater than 7.5 ms and <= maximum interval"));
	}

	if((maxInterval > 4000) || (maxInterval < minInterval)) {
		return Promise.reject(new Error("The minimum connection interval must be less than 4 000 ms and >= minimum interval"));
	}

	// Interval is in units of 1.25 ms.
	minInterval = parseInt(minInterval * 0.8);
	maxInterval = parseInt(maxInterval * 0.8);

	return this.readData(this.connParamsCharacteristic)
		.then( receivedData => {
			let dataArray = new Uint8Array(8);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[0] = minInterval & 0xFF;
			dataArray[1] = (minInterval >> 8) & 0xFF;
			dataArray[2] = maxInterval & 0xFF;
			dataArray[3] = (maxInterval >> 8) & 0xFF;
		
			return this.writeData(this.connParamsCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when updating connection interval: " , error));
		});
};

/**
 *  Sets the connection slave latency
 * 
 *  @param {string} slaveLatency - The desired slave latency in the range from 0 to 499 connection intervals.
 *  @return {Promise<Object|Error>} Returns a promise.
 * 
 */
Thingy.prototype.connSlaveLatencySet = function(slaveLatency) {
    
	// Check parameters
	if((slaveLatency < 0) || (slaveLatency > 499)) {
		return Promise.reject(new Error("The slave latency must be in the range from 0 to 499 connection intervals."));
	}

	return this.readData(this.connParamsCharacteristic)
		.then( receivedData => {
			let dataArray = new Uint8Array(8);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}

			dataArray[4] = slaveLatency & 0xFF;
			dataArray[5] = (slaveLatency >> 8) & 0xFF;
		
			return this.writeData(this.connParamsCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when updating slave latency: " , error));
		});
};

/**
 *  Sets the connection supervision timeout
 * 	<b>Note:</b> According to the Bluetooth Low Energy specification, the supervision timeout in milliseconds must be greater
 *  than (1 + slaveLatency) * maxConnInterval * 2, where maxConnInterval is also given in milliseconds.
 * 
 *  @param {string} timeout - The desired connection supervision timeout in milliseconds and in the rango of 100 ms to 32 000 ms.
 *  @return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.connTimeoutSet = function(timeout) {
    
	// Check parameters
	if((timeout < 100) || (timeout > 32000)) {
		return Promise.reject(new Error("The supervision timeout must be in the range from 100 ms to 32 000 ms."));
	}

	// The supervision timeout has to be set in units of 10 ms
	timeout = parseInt(timeout / 10);

	return this.readData(this.connParamsCharacteristic)
		.then( receivedData => {
			let dataArray = new Uint8Array(8);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			
			// Check that the timeout obeys  conn_sup_timeout * 4 > (1 + slave_latency) * max_conn_interval 
			let maxConnInterval = receivedData.getUint16(2, true);
			let slaveLatency 	= receivedData.getUint16(4, true);

			if(timeout * 4 < ((1 + slaveLatency) * maxConnInterval)) {
				return Promise.reject(new Error("The supervision timeout in milliseconds must be greater than 	\
												(1 + slaveLatency) * maxConnInterval * 2, 						\
												where maxConnInterval is also given in milliseconds."));
			}		

			dataArray[6] = timeout & 0xFF;
			dataArray[7] = (timeout >> 8) & 0xFF;
		
			return this.writeData(this.connParamsCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when updating the supervision timeout: " , error));
		});
};

/**
 *  Gets the configured Eddystone URL
 * 
 *  @return {Promise<string|Error>} Returns a string with the URL when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.eddystoneGet = function() {
	return this.readData(this.eddystoneCharacteristic)
		.then( receivedData => {
			
			// According to Eddystone URL encoding specification, certain elements can be expanded: https://github.com/google/eddystone/tree/master/eddystone-url
			let prefixArray = ["http://www.", "https://www.", "http://", "https://"];
			let expansionCodes = [	".com/", ".org/", ".edu/", ".net/", ".info/", 
				".biz/", ".gov/", ".com", ".org", ".edu", ".net", 
				".info", ".biz", ".gov"];
			let prefix = prefixArray[receivedData.getUint8(0)];
			let decoder = new TextDecoder("utf-8");
			let url = decoder.decode(receivedData);
			let lastElement = receivedData.getUint8(url.length - 1);
			
			url = prefix + url.slice(1);

			if(lastElement <= 0x0d)
				url = url.slice(0, -1) + expansionCodes[lastElement];
			
			return Promise.resolve(url);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the Eddystone URL
 * 
 * 	@param {number} prefix - Code for prefix, according to {@link https://github.com/google/eddystone/tree/master/eddystone-url#url-scheme-prefix specification}.
 *  @param {string} url - The URL.
 * 	@param {number} [postfix = null] - Optional code for postfix according to {@link https://github.com/google/eddystone/tree/master/eddystone-url#eddystone-url-http-url-encoding specification}. 
 *  @return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.eddystoneSet = function(prefix, url, postfix = null) {
	let len = (postfix == null) ? url.length + 1 : url.length + 2;
	let byteArray = new Uint8Array(len);
	byteArray[0] = prefix;

	for(let i = 1; i <= url.length; i++){
		byteArray[i] = url.charCodeAt(i - 1);
	}

	if(postfix != null)
		byteArray[len - 1] = postfix;

	return this.writeData(this.eddystoneCharacteristic, byteArray);
};

/**
 *  Gets the cloud token.
 * 
 *  @return {Promise<string|Error>} Returns a string with the cloud token when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.cloudTokenGet = function() {
	return this.readData(this.cloudTokenCharacteristic)
		.then( receivedData => {
			let decoder = new TextDecoder("utf-8");
			let token = decoder.decode(receivedData);
			
			return Promise.resolve(token);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the cloud token.
 * 
 *  @param {string} token - The cloud token to be stored.
 * 	@return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.cloudTokenSet = function(token) {
	if(token.len > 250)
		return Promise.reject(new Error("The cloud token can not exced 250 characters."));
	
	let encoder = new TextEncoder("utf-8").encode(token);

	return this.writeData(this.cloudTokenCharacteristic, encoder);
};

/**
 *  Gets the current Maximal Transmission Unit (MTU) 
 * 
 *  @return {Promise<number|Error>} Returns the MTU when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.mtuGet = function() {
	return this.readData(this.mtuRequestCharacteristic)
		.then( receivedData => {
			let mtu = receivedData.getUint16(1, true);
			
			return Promise.resolve(mtu);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Sets the current Maximal Transmission Unit (MTU) 
 * 
 *  @param {number} mtuSize - The desired MTU size.
 * 	@param {bool} [peripheralRequest = false] - Optional. Set to <code>true</code> if peripheral should send an MTU exchange request. Default is <code>false</code>; 
 * 	@return {Promise<Error>} Returns a promise.
 * 
 */
Thingy.prototype.mtuSet = function(mtuSize, peripheralRequest = false) {
	let dataArray = new Uint8Array(3);
	dataArray[0] = peripheralRequest ? 1 : 0;
	dataArray[1] = mtuSize & 0xff;
	dataArray[2] = (mtuSize >> 8) & 0xff;

	return this.writeData(this.mtuRequestCharacteristic, dataArray);
};

/**
 *  Gets the current firmware version.
 * 
 *  @return {Promise<string|Error>} Returns a string with the firmware version or a promise with error on rejection.
 * 
 */
Thingy.prototype.firmwareVersionGet = function() {
	return this.readData(this.firmwareVersionCharacteristic)
		.then( receivedData => {
			let major = receivedData.getUint8(0);
			let minor = receivedData.getUint8(1);
			let patch = receivedData.getUint8(2);

			let version = `v${major}.${minor}.${patch}`;
        
			return Promise.resolve(version);
		})
		.catch( error => {
			return Promise.reject(error);
		});
};


//  ******  //


/*  Environment service  */

/**
 *  Gets the current configuration of the Thingy environment module.
 * 
 *  @return {Promise<Object|Error>} Returns an environment configuration object when promise resolves, or an error if rejected.
 * 
 */
Thingy.prototype.environmentConfigGet = function() {
	return this.readData(this.environmentConfigCharacteristic)
		.then( data => {
			let tempInterval                = data.getUint16(0, true);
			let pressureInterval            = data.getUint16(2, true);
			let humidityInterval            = data.getUint16(4, true);
			let colorInterval               = data.getUint16(6, true);
			let gasMode                     = data.getUint8(8);
			let colorSensorRed              = data.getUint8(9);
			let colorSensorGreen            = data.getUint8(10);
			let colorSensorBlue             = data.getUint8(11);
			let config = {
				"tempInterval" : tempInterval,
				"pressureInterval": pressureInterval,
				"humidityInterval": humidityInterval,
				"colorInterval": colorInterval,
				"gasMode": gasMode,
				"colorSensorRed": colorSensorRed,
				"colorSensorGreen": colorSensorGreen,
				"colorSensorBlue": colorSensorBlue
			};
			return Promise.resolve(config);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when getting Thingy LED status: " , error));
		});
};

/**
 *  Sets the temperature measurement update interval.
 * 
 *  @param {Number} interval - Step counter interval in milliseconds. Must be in the range 100 ms to 60 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.temperatureIntervalSet = function(interval) {

	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[0] = interval & 0xFF;
			dataArray[1] = (interval >> 8) & 0xFF;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new temperature update interval: " , error));
		});
};

/**
 *  Sets the pressure measurement update interval.
 * 
 *  @param {Number} interval - Step counter interval in milliseconds. Must be in the range 50 ms to 60 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.pressureIntervalSet = function(interval) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[2] = interval & 0xFF;
			dataArray[3] = (interval >> 8) & 0xFF;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new pressure update interval: " , error));
		});
};

/**
 *  Sets the humidity measurement update interval.
 * 
 *  @param {Number} interval - Step counter interval in milliseconds. Must be in the range 100 ms to 60 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.humidityIntervalSet = function(interval) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[4] = interval & 0xFF;
			dataArray[5] = (interval >> 8) & 0xFF;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new humidity update interval: " , error));
		});
};

/**
 *  Sets the color sensor update interval.
 * 
 *  @param {Number} interval - Step counter interval in milliseconds. Must be in the range 200 ms to 60 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.colorIntervalSet = function(interval) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[6] = interval & 0xFF;
			dataArray[7] = (interval >> 8) & 0xFF;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new color sensor update interval: " , error));
		});
};

/**
 *  Sets the gas mode. 
 * 
 *  @param {Number} mode - 1 = 1 s update interval, 2 = 10 s update interval, 3 = 60 s update interval.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.gasModeSet = function(mode) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[8] = mode;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new as mode: " , error));
		});
};

/**
 *  Sets color sensor LED calibration parameters. 
 * 
 *  @param {Number} red - The red intensity, ranging from 0 to 255.
 *  @param {Number} green - The green intensity, ranging from 0 to 255.
 *  @param {Number} blue - The blue intensity, ranging from 0 to 255.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.colorSensorSet = function(red, green, blue) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.environmentConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(12);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[9]    = red;
			dataArray[10]   = green;
			dataArray[11]   = blue;
			return this.writeData(this.environmentConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new color sensor parameters: " , error));
		});
};

/**
 *  Enables temperature notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a temperature object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.temperatureEnable = function(eventHandler, enable) {
	if(enable) {
		this.tempEventListeners[0] = this.temperatureNotifyHandler.bind(this);
		this.tempEventListeners[1].push(eventHandler);
	} else {
		this.tempEventListeners[1].splice(this.tempEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.temperatureCharacteristic, enable, this.tempEventListeners[0]);
};

Thingy.prototype.temperatureNotifyHandler = function(event) {
	let data = event.target.value;
	let integer = data.getUint8(0);
	let decimal = data.getUint8(1);
	let temperature = integer + (decimal/100);
    
	this.tempEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"value": temperature, 
			"unit": "Celsius" 
		});
	});
};

/**
 *  Enables pressure notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a pressure object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.pressureEnable = function(eventHandler, enable) {
	if(enable) {
		this.pressureEventListeners[0] = this.pressureNotifyHandler.bind(this);
		this.pressureEventListeners[1].push(eventHandler);
	} else {
		this.pressureEventListeners[1].splice(this.pressureEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.pressureCharacteristic, enable, this.pressureEventListeners[0]);
};

Thingy.prototype.pressureNotifyHandler = function(event) {
	let data = event.target.value;
	let integer = data.getUint32(0, true);
	let decimal = data.getUint8(4);
	let pressure = integer + (decimal/100);

	this.pressureEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"value": pressure, 
			"unit": "hPa" 
		});
	});
};

/**
 *  Enables humidity notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a humidity object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.humidityEnable = function(eventHandler, enable) {
	if(enable) {
		this.humidityEventListeners[0] = this.humidityNotifyHandler.bind(this);
		this.humidityEventListeners[1].push(eventHandler);
	} else {
		this.humidityEventListeners[1].splice(this.humidityEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.humidityCharacteristic, enable, this.humidityEventListeners[0]);
};

Thingy.prototype.humidityNotifyHandler = function(event) {
	let data = event.target.value;
	let humidity = data.getUint8(0);

	this.humidityEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"value": humidity, 
			"unit": "%" 
		});
	});
};

/**
 *  Enables gas notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a gas object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.gasEnable = function(eventHandler, enable) {
	if(enable) {
		this.gasEventListeners[0] = this.gasNotifyHandler.bind(this);
		this.gasEventListeners[1].push(eventHandler);
	} else {
		this.gasEventListeners[1].splice(this.gasEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.gasCharacteristic, enable, this.gasEventListeners[0]);
};

Thingy.prototype.gasNotifyHandler = function(event) {
	let data = event.target.value;
	let eco2 = data.getUint16(0, true);
	let tvoc = data.getUint16(2, true);

	this.gasEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"eCO2" : {
				"value": eco2, 
				"unit": "ppm" 
			},
			"TVOC" : {
				"value": tvoc, 
				"unit": "ppb" 
			}
		});
	});
};

/**
 *  Enables color sensor notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a color sensor object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.colorEnable = function(eventHandler, enable) {
	if(enable) {
		this.colorEventListeners[0] = this.colorNotifyHandler.bind(this);
		this.colorEventListeners[1].push(eventHandler);
	} else {
		this.colorEventListeners[1].splice(this.colorEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.colorCharacteristic, enable, this.colorEventListeners[0]);
};

Thingy.prototype.colorNotifyHandler = function(event) {
	let data = event.target.value;
	let r = data.getUint16(0, true);
	let g = data.getUint16(2, true);
	let b = data.getUint16(4, true);
	let c = data.getUint16(6, true);

	let rRatio = r / (r+g+b);
	let gRatio = g / (r+g+b);
	let bRatio = b / (r+g+b);
	let clear_at_black = 300;
	let clear_at_white = 400;
	let clear_diff = clear_at_white - clear_at_black;
	let clear_normalized = (c - clear_at_black) / clear_diff;
	if (clear_normalized < 0)
	{
		clear_normalized = 0;
	}        
	let red = rRatio * 255.0 * 3 * clear_normalized;
	if(red > 255) red = 255;
	let green = gRatio * 255.0 * 3 * clear_normalized;
	if(green > 255) green = 255;
	let blue = bRatio * 255.0 * 3 * clear_normalized;
	if(blue > 255) blue = 255;       

	this.colorEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
				"red": red.toFixed(0),
				"green": green.toFixed(0),
				"blue": blue.toFixed(0)
		});
	});
};

//  ******  //



/*  User interface service  */

/**
 *  Gets the current LED settings from the Thingy device. Returns an object with structure that depends on the settings. 
 * 
 *  @return {Promise<Object>} Returns a LED status object. The content and structure depends on the current mode.
 * 
 */
Thingy.prototype.ledGetStatus = function() {
	return this.readData(this.ledCharacteristic)
		.then( data => {
			let mode = data.getUint8(0);
			let status;
			switch(mode) {
			case 0:
				status = { LEDstatus : { mode : mode }};
				break;
			case 1:
				status = { 
					"mode" : mode, 
					"r" : data.getUint8(1),
					"g" : data.getUint8(2),
					"b" : data.getUint8(3)
				};
				break;
			case 2:
				status = { 
					"mode" : mode, 
					"color" : data.getUint8(1),
					"intensity" : data.getUint8(2),
					"delay" : data.getUint16(3)
				};
				break;
			case 3:
				status = { 
					"mode" : mode, 
					"color" : data.getUint8(1),
					"intensity" : data.getUint8(2)
				};
				break;
			}
			return Promise.resolve(status);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when getting Thingy LED status: " , error));
		});
};

Thingy.prototype.ledSet = function(dataArray) {
	return this.writeData(this.ledCharacteristic, dataArray);
};

/**
 *  Sets the LED in constant mode with the specified RGB color.
 * 
 *  @param red - The value for red color in an RGB color. Ranges from 0 to 255. 
 *  @param green - The value for green color in an RGB color. Ranges from 0 to 255. 
 *  @param blue - The value for blue color in an RGB color. Ranges from 0 to 255. 
 *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
 * 
 */
Thingy.prototype.ledSetConstant = function(red, green, blue) {
	return this.ledSet(new Uint8Array([1, red, green, blue]));
};

/**
 *  Sets the LED in "breathe" mode where the LED pulses with the specified color, intensity and delay between pulses.
 * 
 *  @param color - The color code. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
 *  @param intensity - Intensity of LED pulses. Range from 0 to 100 [%].
 *  @param delay - Delay between pulses in milliseconds. Range from 50 ms to 10 000 ms.
 *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
 * 
 */
Thingy.prototype.ledSetBreathe = function(color, intensity, delay) {
	return this.ledSet(new Uint8Array([2, color, intensity, delay & 0xff, (delay >> 8) & 0xff]));
};

/**
 *  Sets the LED in one-shot mode
 * 
 *  @param color - The color code. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
 *  @param intensity - Intensity of LED pulses. Range from 0 to 100 [%].
 *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
 * 
 */
Thingy.prototype.ledSetOneShot = function(color, intensity) {
	return this.ledSet(new Uint8Array([3, color, intensity]));
};

/**
 *  Enables button notifications from Thingy. The assigned event handler will be called when the button on the Thingy is pushed or released.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a button object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise with button state when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.buttonEnable = function(eventHandler, enable) {
	if(enable) {
		this.buttonEventListeners[0] = this.buttonNotifyHandler.bind(this);
		this.buttonEventListeners[1].push(eventHandler);
	} else {
		this.buttonEventListeners[1].splice(this.buttonEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.buttonCharacteristic, enable, this.buttonEventListeners[0]);
};

Thingy.prototype.buttonNotifyHandler = function(event) {  
	let data = event.target.value;
	let state = data.getUint8(0);
      
	this.buttonEventListeners[1].forEach( eventHandler => {
		eventHandler(state);
	});
};


/**
 *  Gets the current external pin settings from the Thingy device. Returns an object with pin status information. 
 * 
 *  @return {Promise<Object|Error>} Returns an external pin status object. 
 * 
 */
Thingy.prototype.externalPinsGet = function() {
	return this.readData(this.externalPinCharacteristic)
		.then( data => {
			let pinStatus = {
				"pin1" : data.getUint8(0),
				"pin2" : data.getUint8(1),
				"pin3" : data.getUint8(2),
				"pin4" : data.getUint8(3)
			};
			return Promise.resolve(pinStatus);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when reading from external pin characteristic: " , error));
		});
};

/**
 *  Set an external pin to chosen state.
 * 
 *  @param pin - Determines which pin is set. Range 1 - 4.
 *  @param value - Sets the value of the pin. 0 = OFF, 255 = ON.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.externalPinSet = function(pin, value) {
	if(pin < 1 || pin > 4)
		return Promise.reject(new Error("Pin number must be 1, 2, 3 or 4"));
	if(!(value == 0 || value == 255))
		return Promise.reject(new Error("Pin status value must be 0 or 255"));
    
	// Preserve values for those pins that are not being set 
	return this.readData(this.externalPinCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(4);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[pin - 1] = value;
			return this.writeData(this.externalPinCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting external pins: " , error));
		});
};

//  ******  //



/**  Motion service  */

/**
 *  Gets the current configuration of the Thingy motion module.
 * 
 *  @return {Promise<Object|Error>} Returns a motion configuration object when promise resolves, or an error if rejected.
 * 
 */
Thingy.prototype.motionConfigGet = function() {
	return this.readData(this.tmsConfigCharacteristic)
		.then( data => {
			let stepCounterInterval                 = data.getUint16(0, true);
			let tempCompInterval                    = data.getUint16(2, true);
			let magnetCompInterval                  = data.getUint16(4, true);
			let motionProcessingFrequency           = data.getUint16(6, true);
			let wakeOnMotion                        = data.getUint8(8, true);
			let config = {
				"stepCountInterval" : stepCounterInterval,
				"tempCompInterval": tempCompInterval,
				"magnetCompInterval": magnetCompInterval,
				"motionProcessingFrequency": motionProcessingFrequency,
				"wakeOnMotion": wakeOnMotion
			};
			return Promise.resolve(config);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when getting Thingy motion module configuration: " , error));
		});
};

/**
 *  Sets the step counter interval.
 * 
 *  @param {Number} interval - Step counter interval in milliseconds. Must be in the range 100 ms to 5 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.stepCounterIntervalSet = function(interval) {

	// Preserve values for those settings that are not being changed 
	return this.readData(this.tmsConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(9);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[0] = interval & 0xFF;
			dataArray[1] = (interval >> 8) & 0xFF;
			return this.writeData(this.tmsConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new step count interval: " , error));
		});
};

/**
 *  Sets the temperature compensation interval.
 * 
 *  @param {Number} interval - Temperature compensation interval in milliseconds. Must be in the range 100 ms to 5 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.temperatureCompIntervalSet = function(interval) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.tmsConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(9);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[2] = interval & 0xFF;
			dataArray[3] = (interval >> 8) & 0xFF;
			return this.writeData(this.tmsConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new temperature compensation interval: " , error));
		});
};    

/**
 *  Sets the magnetometer compensation interval.
 * 
 *  @param {Number} interval - Magnetometer compensation interval in milliseconds. Must be in the range 100 ms to 1 000 ms. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.magnetCompIntervalSet = function(interval) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.tmsConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(9);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[4] = interval & 0xFF;
			dataArray[5] = (interval >> 8) & 0xFF;
			return this.writeData(this.tmsConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new magnetometer compensation interval: " , error));
		});
};    

/**
 *  Sets motion processing unit update frequency.
 * 
 *  @param {Number} frequency - Motion processing frequency in Hz. The allowed range is 5 - 200 Hz. 
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.motionProcessingFrequencySet = function(frequency) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.tmsConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(9);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[6] = frequency & 0xFF;
			dataArray[7] = (frequency >> 8) & 0xFF;
			return this.writeData(this.tmsConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new motion porcessing unit update frequency: " , error));
		});
};   

/**
 *  Sets wake-on-motion feature to enabled or disabled state.
 * 
 *  @param {bool} enable - Set to True to enable or False to disable wake-on-motion feature.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
 * 
 */
Thingy.prototype.wakeOnMotionSet = function(enable) {
    
	// Preserve values for those settings that are not being changed 
	return this.readData(this.tmsConfigCharacteristic)
		.then ( receivedData => {
			let dataArray = new Uint8Array(9);
			for(let i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			dataArray[8] = enable ? 1 : 0;
			return this.writeData(this.tmsConfigCharacteristic, dataArray);
		})
		.catch( error => {
			return Promise.reject(new Error("Error when setting new magnetometer compensation interval: " , error));
		});
};   

/**
 *  Enables tap detection notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {callback} eventHandler - The callback function that is triggered on notification. Will receive a tap detection object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.tapEnable = function(eventHandler, enable) {
	if(enable) {
		this.tapEventListeners[0] = this.tapNotifyHandler.bind(this);
		this.tapEventListeners[1].push(eventHandler);
	} else {
		this.tapEventListeners[1].splice(this.tapEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.tapCharacteristic, enable, this.tapEventListeners[0]);
};

Thingy.prototype.tapNotifyHandler = function(event) {
	let data = event.target.value;
	let direction = data.getUint8(0);
	let count = data.getUint8(1);
    
	this.tapEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"direction": direction, 
			"count": count 
		});
	});
};

/**
 *  Enables orientation detection notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a orientation detection object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.orientationEnable = function(eventHandler, enable) {
	if(enable) {
		this.orientationEventListeners[0] = this.orientationNotifyHandler.bind(this);
		this.orientationEventListeners[1].push(eventHandler);
	} else {
		this.orientationEventListeners[1].splice(this.orientationEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.orientationCharacteristic, enable, this.orientationEventListeners[0]);
};

Thingy.prototype.orientationNotifyHandler = function(event) {
	let data = event.target.value;
	let orientation = data.getUint8(0);
    
	this.orientationEventListeners[1].forEach( eventHandler => {
		eventHandler(orientation);
	});
};

/**
 *  Enables quaternion notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a quaternion object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.quaternionEnable = function(eventHandler, enable) {
	if(enable) {
		this.quaternionEventListeners[0] = this.quaternionNotifyHandler.bind(this);
		this.quaternionEventListeners[1].push(eventHandler);
	} else {
		this.quaternionEventListeners[1].splice(this.quaternionEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.quaternionCharacteristic, enable, this.quaternionEventListeners[0]);
};

Thingy.prototype.quaternionNotifyHandler = function(event) {
	let data = event.target.value;

	// Divide by (1 << 30) according to sensor specification
	let w = data.getInt32(0, true) / (1 << 30);
	let x = data.getInt32(4, true) / (1 << 30);
	let y = data.getInt32(8, true) / (1 << 30);
	let z = data.getInt32(12, true) / (1 << 30);
    
	let magnitude = Math.sqrt(Math.pow(w, 2) + Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

	if(magnitude != 0){
		w /= magnitude;
		x /= magnitude;
		y /= magnitude;
		z /= magnitude;
	}
    
	this.quaternionEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"w": w,
			"x": x,
			"y": y,
			"z": z
		});
	});
};

/**
 *  Enables step counter notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a step counter object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.stepEnable = function(eventHandler, enable) {
	if(enable) {
		this.stepEventListeners[0] = this.stepNotifyHandler.bind(this);
		this.stepEventListeners[1].push(eventHandler);
	} else {
		this.stepEventListeners[1].splice(this.stepEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.stepCharacteristic, enable, this.stepEventListeners[0]);
};

Thingy.prototype.stepNotifyHandler = function(event) {
	let data = event.target.value;
	let count = data.getUint32(0, true);
	let time = data.getUint32(4, true);
    
	this.stepEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"count": count,
			"time": {
				"value": time,
				"unit": "ms"
			}
		});
	});
};

/**
 *  Enables raw motion data notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a raw motion data object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.motionRawEnable = function(eventHandler, enable) {
	if(enable) {
		this.motionRawEventListeners[0] = this.motionRawNotifyHandler.bind(this);
		this.motionRawEventListeners[1].push(eventHandler);
	} else {
		this.motionRawEventListeners[1].splice(this.motionRawEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.motionRawCharacteristic, enable, this.motionRawEventListeners[0]);
};

Thingy.prototype.motionRawNotifyHandler = function(event) {
	let data        = event.target.value;

	// Divide by 2^6 = 64 to get accelerometer correct values
	let accX        = (data.getInt16(0, true) / 64);
	let accY        = (data.getInt16(2, true) / 64);
	let accZ        = (data.getInt16(4, true) / 64);
    
	// Divide by 2^11 = 2048 to get correct gyroscope values
	let gyroX       = (data.getInt16(6, true) / 2048);
	let gyroY       = (data.getInt16(8, true) / 2048);
	let gyroZ       = (data.getInt16(10, true) / 2048);
    
	// Divide by 2^12 = 4096 to get correct compass values
	let compassX    = (data.getInt16(12, true) / 4096);
	let compassY    = (data.getInt16(14, true) / 4096);
	let compassZ    = (data.getInt16(16, true) / 4096);
    
	this.motionRawEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"accelerometer": {
				"x": accX,
				"y": accY,
				"z": accZ,
				"unit": "G"
			},
			"gyroscope": {
				"x": gyroX,
				"y": gyroY,
				"z": gyroZ,
				"unit": "deg/s"
			},
			"compass": {
				"x": compassX,
				"y": compassY,
				"z": compassZ,
				"unit": "microTesla"
			}
		});
	});
};

/**
 *  Enables Euler angle data notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive an Euler angle data object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.eulerEnable = function(eventHandler, enable) {
	if(enable) {
		this.eulerEventListeners[0] = this.eulerNotifyHandler.bind(this);
		this.eulerEventListeners[1].push(eventHandler);
	} else {
		this.eulerEventListeners[1].splice(this.eulerEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.eulerCharacteristic, enable, this.eulerEventListeners[0]);
};

Thingy.prototype.eulerNotifyHandler = function(event) {
	let data = event.target.value;

	// Divide by two bytes (1<<16 or 2^16 or 65536) to get correct value
	let roll    = data.getInt32(0, true) / 65536;
	let pitch   = data.getInt32(4, true) / 65536;
	let yaw     = data.getInt32(8, true) / 65536;
    
	this.eulerEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"roll": roll,
			"pitch": pitch,
			"yaw": yaw
		});
	});
};

/**
 *  Enables rotation matrix notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive an rotation matrix object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.rotationMatrixEnable = function(eventHandler, enable) {
	if(enable) {
		this.rotationMatrixEventListeners[0] = this.rotationMatrixNotifyHandler.bind(this);
		this.rotationMatrixEventListeners[1].push(eventHandler);
	} else {
		this.rotationMatrixEventListeners[1].splice(this.rotationMatrixEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.rotationMatrixCharacteristic, enable, this.rotationMatrixEventListeners[0]);
};

Thingy.prototype.rotationMatrixNotifyHandler = function(event) {
	let data = event.target.value;

	// Divide by 2^2 = 4 to get correct values
	let r1c1 = data.getInt16(0, true) / 4;
	let r1c2 = data.getInt16(0, true) / 4;
	let r1c3 = data.getInt16(0, true) / 4;
	let r2c1 = data.getInt16(0, true) / 4;
	let r2c2 = data.getInt16(0, true) / 4;
	let r2c3 = data.getInt16(0, true) / 4;
	let r3c1 = data.getInt16(0, true) / 4;
	let r3c2 = data.getInt16(0, true) / 4;
	let r3c3 = data.getInt16(0, true) / 4;
    
	this.rotationMatrixEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"row1": [r1c1, r1c2, r1c3],
			"row2": [r2c1, r2c2, r2c3],
			"row3": [r3c1, r3c2, r3c3]
		});
	});
};

/**
 *  Enables heading notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a heading object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.headingEnable = function(eventHandler, enable) {
	if(enable) {
		this.headingEventListeners[0] = this.headingNotifyHandler.bind(this);
		this.headingEventListeners[1].push(eventHandler);
	} else {
		this.headingEventListeners[1].splice(this.headingEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.headingCharacteristic, enable, this.headingEventListeners[0]);
};

Thingy.prototype.headingNotifyHandler = function(event) {
	let data = event.target.value;

	// Divide by 2^16 = 65536 to get correct heading values
	let heading = data.getInt32(0, true) / 65536;
    
	this.headingEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"value": heading,
			"unit": "degrees"
		});
	});
};

/**
 *  Enables gravity vector notifications from Thingy. The assigned event handler will be called when notifications are received.
 * 
 *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a heading object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.gravityVectorEnable = function(eventHandler, enable) {
	if(enable) {
		this.gravityVectorEventListeners[0] = this.gravityVectorNotifyHandler.bind(this);
		this.gravityVectorEventListeners[1].push(eventHandler);
	} else {
		this.gravityVectorEventListeners[1].splice(this.gravityVectorEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.gravityVectorCharacteristic, enable, this.gravityVectorEventListeners[0]);
};

Thingy.prototype.gravityVectorNotifyHandler = function(event) {
	let data = event.target.value;
	let x = data.getFloat32(0, true);
	let y = data.getFloat32(4, true);
	let z = data.getFloat32(8, true);
    
	this.gravityVectorEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"x": x,
			"y": y,
			"z": z
		});
	});
};

//  ******  //

Thingy.prototype.microphoneEnable = function(eventHandler, enable) {
	if(enable) {
		this.microphoneEventListeners[0] = this.microphoneNotifyHandler.bind(this);
		this.microphoneEventListeners[1].push(consoleIt); // skal være eventHandler

		// lager en ny audio context, skal bare ha én av denne
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioCtx = new AudioContext();
	} else {
		this.microphoneEventListeners[1].splice(this.microphoneEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.microphoneCharacteristic, enable, this.microphoneEventListeners[0]);
};

Thingy.prototype.microphoneNotifyHandler = function(event) {
	console.log(event);
	let audioPacket = event.target.value.buffer;
	let adpcm = {
        header : new DataView(audioPacket.slice(0, 3)),
        data   : new DataView(audioPacket.slice(3))
    };
	let decodedAudio = this.decodeAudio(adpcm);

    this.playDecodedAudio(decodedAudio);


	/*this.microphoneEventListeners[1].forEach( eventHandler => {
		eventHandler(decodedAudio);
	});*/
};

/*  Sound service  */

Thingy.prototype.decodeAudio = function(adpcm) {
    // Allocate output buffer
	let audioBufferDataLength = adpcm.data.byteLength;
	let audioBuffer = new ArrayBuffer(audioBufferDataLength*4);
	let pcm = new DataView(audioBuffer);

    // The first 2 bytes of ADPCM frame are the predicted value
    let valuePredicted = adpcm.data.getInt16(0, false);


	// The 3rd byte is the index value
	let index = adpcm.header.getInt8(2);

	if (index < 0)
		index = 0;
	if (index > 88)
		index = 88;

	let diff; /* Current change to valuePredicted */
	let bufferStep = false;
	let inputBuffer = 0;
	let delta = 0;
	let sign = 0;
	let step = this.MICROPHONE_STEP_SIZE_TABLE[index];

	for (let _in = 0, _out = 0; _in < audioBufferDataLength; _out += 2) {
		/* Step 1 - get the delta value */
		if (bufferStep) {
			delta = inputBuffer & 0x0F;
            _in++;
		}
        else {
			inputBuffer = adpcm.data.getInt8(_in);
			delta = (inputBuffer >> 4) & 0x0F;
		}
		bufferStep = !bufferStep;

		/* Step 2 - Find new index value (for later) */
		index += this.MICROPHONE_INDEX_TABLE[delta];
		if (index < 0) {
            index = 0;
        }
		if (index > 88) {
            index = 88;
        }

		/* Step 3 - Separate sign and magnitude */
		sign = delta & 8;
		delta = delta & 7;

		/* Step 4 - Compute difference and new predicted value */
		diff = (step >> 3);
		if ((delta & 4) > 0)
			diff += step;
		if ((delta & 2) > 0)
			diff += step >> 1;
		if ((delta & 1) > 0)
			diff += step >> 2;

		if (sign > 0)
			valuePredicted -= diff;
		else
			valuePredicted += diff;

		/* Step 5 - clamp output value */
		if (valuePredicted > 32767)
			valuePredicted = 32767;
		else if (valuePredicted < -32768)
			valuePredicted = -32768;

		/* Step 6 - Update step value */
		step = this.MICROPHONE_STEP_SIZE_TABLE[index];
		/* Step 7 - Output value */
		pcm.setInt16(_out, valuePredicted, true);
	}

	return pcm;
}

Thingy.prototype.playDecodedAudio = function(audio) {

	let channels = 1;
	let frameCount = audio.byteLength/2;
	let sampleRate = 16000;


	let myArrayBuffer = this.audioCtx.createBuffer(channels, frameCount, sampleRate);
   	let nowBuffering = myArrayBuffer.getChannelData(0);

   	// 80% sikker på at det er denne delen som skaper problemer
   	for (let i = 0; i < frameCount-2; i++) {
   		let word = audio.getFloat32(2*i, false) + audio.getFloat32(2*i+1, false);

   		nowBuffering[i] = word/65536;

	}

  	let source = this.audioCtx.createBufferSource();
  	source.buffer = myArrayBuffer;
  	source.connect(this.audioCtx.destination);
  	source.start();

}





/*  Battery service  */

/**
 *  Gets the battery level of Thingy.
 * 
 *  @return {Promise<number | Error>} Returns battery level in percentage when promise is resolved or an error if rejected.
 * 
 */
Thingy.prototype.batteryLevelGet = function() {
	return this.readData(this.batteryCharacteristic)
		.then( receivedData => {
			let level = receivedData.getUint8(0);
			return Promise.resolve({ 
				"value": level,
				"unit": "%"
			});
		})
		.catch( error => {
			return Promise.reject(error);
		});
};

/**
 *  Enables battery level notifications. 
 * 
 *  @param {function} eventHandler - The callback function that is triggered on battery level change. Will receive a battery level object as argument.
 *  @param {bool} enable - Enables notifications if true or disables them if set to false.
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection 
 * 
 */
Thingy.prototype.batteryLevelEnable = function(eventHandler, enable) {
	if(enable) {
		this.batteryLevelEventListeners[0] = this.batteryLevelNotifyHandler.bind(this);
		this.batteryLevelEventListeners[1].push(eventHandler);
	} else {
		this.batteryLevelEventListeners[1].splice(this.batteryLevelEventListeners.indexOf(eventHandler), 1);
	}
	return this.notifyCharacteristic(this.batteryCharacteristic, enable, this.batteryLevelEventListeners[0]);
};

Thingy.prototype.batteryLevelNotifyHandler = function(event) {
	let data = event.target.value;
	let value = data.getUint8(0);
    
	this.batteryLevelEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"value": value,
			"unit": "%"
		});
	});
};

Thingy.prototype.logCharacteristicValue = function(ch) {
	console.log(ch["value"]);
}

//  ******  //


function consoleIt(it) {
	console.log(it);
}