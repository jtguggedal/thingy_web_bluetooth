
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

	var device;
	var bleIsBusy = false;

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
									this.micCharacteristic = characteristic; 
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


/**  Configuration service  */

/**
 *  Gets the name of the Thingy device.
 * 
 *  @return {Promise<string|Error>} Returns a string with the name when resolved or a promise with error on rejection.
 * 
 */
Thingy.prototype.nameGet = function() {
	return this.readData(this.nameCharacteristic)
		.then( receivedData => {
			var decoder = new TextDecoder("utf-8");
			var name = decoder.decode(receivedData);
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
	var byteArray = new Uint8Array(name.length);
	for(var i = 0, j = name.length; i < j; ++i){
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
			var interval = parseInt(receivedData.getUint16(0, true) * 0.625);
			var timeout = receivedData.getUint8(2);
			var params = {
				"advParams": {
					"interval": {
						"interval": interval,
						"unit": "ms"
					},
					"timeout":  {
						"timeout": timeout,
						"unit": "s"
					}
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

	var dataArray = new Uint8Array(3);
    
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
			var minConnInterval = receivedData.getUint16(0, true) * 1.25;
			var maxConnInterval = receivedData.getUint16(2, true) * 1.25;
			var slaveLatency 	= receivedData.getUint16(4, true);

			// Supervision timeout is given i units of 10 ms
			var supervisionTimeout 		= receivedData.getUint16(6, true) * 10;
			var params = {
				"connParams": {
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
			var dataArray = new Uint8Array(8);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(8);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(8);
			for(var i = 0; i < dataArray.length; i++) {
				dataArray[i] = receivedData.getUint8(i);
			}
			
			// Check that the timeout obeys  conn_sup_timeout * 4 > (1 + slave_latency) * max_conn_interval 
			var maxConnInterval = receivedData.getUint16(2, true);
			var slaveLatency 	= receivedData.getUint16(4, true);

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
			
			// According to Eddystone URL encoding specification, certain element can be expanded: https://github.com/google/eddystone/tree/master/eddystone-url
			var prefixArray = ["http://www.", "https://www.", "http://", "https://"];
			var expansionCodes = [	".com/", ".org/", ".edu/", ".net/", ".info/", 
				".biz/", ".gov/", ".com", ".org", ".edu", ".net", 
				".info", ".biz", ".gov"];
			var prefix = prefixArray[receivedData.getUint8(0)];
			var decoder = new TextDecoder("utf-8");
			var url = decoder.decode(receivedData);
			var lastElement = receivedData.getUint8(url.length - 1);
			
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
 *  Gets the current firmware version.
 * 
 *  @return {Promise<string|Error>} Returns a string with the firmware version or a promise with error on rejection.
 * 
 */
Thingy.prototype.firmwareVersionGet = function() {
	return this.readData(this.firmwareVersionCharacteristic)
		.then( receivedData => {
			var major = receivedData.getUint8(0);
			var minor = receivedData.getUint8(1);
			var patch = receivedData.getUint8(2);

			var version = `v${major}.${minor}.${patch}`;
        
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
			var tempInterval                = data.getUint16(0, true);
			var pressureInterval            = data.getUint16(2, true);
			var humidityInterval            = data.getUint16(4, true);
			var colorInterval               = data.getUint16(6, true);
			var gasMode                     = data.getUint8(8);
			var colorSensorRed              = data.getUint8(9);
			var colorSensorGreen            = data.getUint8(10);
			var colorSensorBlue             = data.getUint8(11);
			var config = {
				"tempInterval" : tempInterval,
				"pressureInterval": pressureInterval,
				"humidityInterval": humidityInterval,
				"colorInterval": colorInterval,
				"gasMode": gasMode,
				"colorSensorRed": colorSensorRed,
				"colorSensorGreen": colorSensorGreen,
				"colorSensorBlue": colorSensorBlue
			};
			return Promise.resolve({ config: config });
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(12);
			for(var i = 0; i < dataArray.length; i++) {
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
	var data = event.target.value;
	var integer = data.getUint8(0);
	var decimal = data.getUint8(1);
	var temperature = integer + (decimal/100);
    
	this.tempEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"temperature": { 
				"value": temperature, 
				"unit": "Celsius" 
			}
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
	var data = event.target.value;
	var integer = data.getUint32(0, true);
	var decimal = data.getUint8(4);
	var pressure = integer + (decimal/100);

	this.pressureEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"pressure": { 
				"value": pressure, 
				"unit": "hPa" 
			}
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
	var data = event.target.value;
	var humidity = data.getUint8(0);

	this.humidityEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"humidity": { 
				"value": humidity, 
				"unit": "%" 
			}
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
	var data = event.target.value;
	var eco2 = data.getUint16(0, true);
	var tvoc = data.getUint16(2, true);

	this.gasEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"gas": { 
				"eCO2" : {
					"value": eco2, 
					"unit": "ppm" 
				},
				"TVOC" : {
					"value": tvoc, 
					"unit": "ppb" 
				}
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
	var data = event.target.value;
	var red = data.getUint16(0, true);
	var green = data.getUint8(2, true);
	var blue = data.getUint8(4, true);
	var clear = data.getUint8(6, true);

	this.colorEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"color": { 
				"red": red,
				"green": green,
				"blue": blue,
				"clear": clear
			}
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
			var mode = data.getUint8(0);
			var status;
			switch(mode) {
			case 0:
				status = { LEDstatus : { mode : mode }};
				break;
			case 1:
				status = { 
					"LEDstatus" : { 
						"mode" : mode, 
						"r" : data.getUint8(1),
						"g" : data.getUint8(2),
						"b" : data.getUint8(3)
					}
				};
				break;
			case 2:
				status = { 
					"LEDstatus" : { 
						"mode" : mode, 
						"color" : data.getUint8(1),
						"intensity" : data.getUint8(2),
						"delay" : data.getUint16(3)
					}
				};
				break;
			case 3:
				status = { 
					"LEDstatus" : { 
						"mode" : mode, 
						"color" : data.getUint8(1),
						"intensity" : data.getUint8(2)
					}
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
 *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection. 
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
	var data = event.target.value;
	var state = data.getUint8(0);
      
	this.buttonEventListeners[1].forEach( eventHandler => {
		eventHandler({ buttonState: state });
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
			var pinStatus = {
				"pinStatus" : {
					"pin1" : data.getUint8(0),
					"pin2" : data.getUint8(1),
					"pin3" : data.getUint8(2),
					"pin4" : data.getUint8(3)
				}
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
			var dataArray = new Uint8Array(4);
			for(var i = 0; i < dataArray.length; i++) {
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
			var stepCounterInterval                 = data.getUint16(0, true);
			var tempCompInterval                    = data.getUint16(2, true);
			var magnetCompInterval                  = data.getUint16(4, true);
			var motionProcessingFrequency           = data.getUint16(6, true);
			var wakeOnMotion                        = data.getUint8(8, true);
			var config = {
				"stepCountInterval" : stepCounterInterval,
				"tempCompInterval": tempCompInterval,
				"magnetCompInterval": magnetCompInterval,
				"motionProcessingFrequency": motionProcessingFrequency,
				"wakeOnMotion": wakeOnMotion
			};
			return Promise.resolve({ config: config });
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
			var dataArray = new Uint8Array(9);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(9);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(9);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(9);
			for(var i = 0; i < dataArray.length; i++) {
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
			var dataArray = new Uint8Array(9);
			for(var i = 0; i < dataArray.length; i++) {
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
	var data = event.target.value;
	var direction = data.getUint8(0);
	var count = data.getUint8(1);
    
	this.tapEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"tap": { 
				"direction": direction, 
				"count": count 
			}
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
	var data = event.target.value;
	var orientation = data.getUint8(0);
    
	this.orientationEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"orientation": orientation
		});
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
	var data = event.target.value;

	// Divide by (1 << 30) according to sensor specification
	var w = data.getInt32(0, true) / (1 << 30);
	var x = data.getInt32(4, true) / (1 << 30);
	var y = data.getInt32(8, true) / (1 << 30);
	var z = data.getInt32(12, true) / (1 << 30);
    
	var magnitude = Math.sqrt(Math.pow(w, 2) + Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

	if(magnitude != 0){
		w /= magnitude;
		x /= magnitude;
		y /= magnitude;
		z /= magnitude;
	}
    
	this.quaternionEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"quaternion": {
				"w": w,
				"x": x,
				"y": y,
				"z": z
			}
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
	var data = event.target.value;
	var count = data.getUint32(0, true);
	var time = data.getUint32(4, true);
    
	this.stepEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"steps": {
				"count": count,
				"time": {
					"value": time,
					"unit": "ms"
				}
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
	var data        = event.target.value;

	// Divide by 2^6 = 64 to get accelerometer correct values
	var accX        = (data.getInt16(0, true) / 64);
	var accY        = (data.getInt16(2, true) / 64);
	var accZ        = (data.getInt16(4, true) / 64);
    
	// Divide by 2^11 = 2048 to get correct gyroscope values
	var gyroX       = (data.getInt16(6, true) / 2048);
	var gyroY       = (data.getInt16(8, true) / 2048);
	var gyroZ       = (data.getInt16(10, true) / 2048);
    
	// Divide by 2^12 = 4096 to get correct compass values
	var compassX    = (data.getInt16(12, true) / 4096);
	var compassY    = (data.getInt16(14, true) / 4096);
	var compassZ    = (data.getInt16(16, true) / 4096);
    
	this.motionRawEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"rawData": {
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
	var data = event.target.value;

	// Divide by two bytes (1<<16 or 2^16 or 65536) to get correct value
	var roll    = data.getInt32(0, true) / 65536;
	var pitch   = data.getInt32(4, true) / 65536;
	var yaw     = data.getInt32(8, true) / 65536;
    
	this.eulerEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"euler": {
				"roll": roll,
				"pitch": pitch,
				"yaw": yaw
			}
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
	var data = event.target.value;

	// Divide by 2^2 = 4 to get correct values
	var r1c1 = data.getInt16(0, true) / 4;
	var r1c2 = data.getInt16(0, true) / 4;
	var r1c3 = data.getInt16(0, true) / 4;
	var r2c1 = data.getInt16(0, true) / 4;
	var r2c2 = data.getInt16(0, true) / 4;
	var r2c3 = data.getInt16(0, true) / 4;
	var r3c1 = data.getInt16(0, true) / 4;
	var r3c2 = data.getInt16(0, true) / 4;
	var r3c3 = data.getInt16(0, true) / 4;
    
	this.rotationMatrixEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"rotationMatrix": {
				"row1": [r1c1, r1c2, r1c3],
				"row2": [r2c1, r2c2, r2c3],
				"row3": [r3c1, r3c2, r3c3]
			}
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
	var data = event.target.value;

	// Divide by 2^16 = 65536 to get correct heading values
	var heading = data.getInt32(0, true) / 65536;
    
	this.headingEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"heading": {
				"value": heading,
				"unit": "degrees"
			}
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
	var data = event.target.value;
	var x = data.getFloat32(0, true);
	var y = data.getFloat32(4, true);
	var z = data.getFloat32(8, true);
    
	this.gravityVectorEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"gravityVector": {
				"x": x,
				"y": y,
				"z": z
			}
		});
	});
};


//  ******  //



/*  Sound service  */


//  ******  //



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
			var level = receivedData.getUint8(0);
			return Promise.resolve({ 
				"batteryLevel": {
					"value": level,
					"unit": "%"
				}
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
	var data = event.target.value;
	var value = data.getUint8(0);
    
	this.batteryLevelEventListeners[1].forEach( eventHandler => {
		eventHandler( { 
			"batteryLevel": {
				"value": value,
				"unit": "%"
			}
		});
	});
};

//  ******  //



