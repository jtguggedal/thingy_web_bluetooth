
/**
 *  Thingy:52 Web Bluetooth API 
 *  
 *  Thingy:52 BLE service details {@link https://nordicsemiconductor.github.io/Nordic-Thingy52-FW/documentation/firmware_architecture.html#fw_arch_ble_services here}
 * 
 */

/** 
 *  Thingy object
 * 
 *  @constructor   
 *  @param [logEnabled = true] Enables logging of all BLE actions.
 * 
*/
function Thingy(logEnabled = true) {
    this.logEnabled = logEnabled;

    // TCS = Thingy Configuration Service
    this.TCS_UUID              = 'ef680100-9b35-4933-9b10-52ffa9740042';
    this.TCS_NAME_UUID         = 'ef680101-9b35-4933-9b10-52ffa9740042';
    this.TCS_ADV_PARAMS_UUID   = 'ef680102-9b35-4933-9b10-52ffa9740042';
    this.TCS_CONN_PARAMS_UUID  = 'ef680104-9b35-4933-9b10-52ffa9740042';
    this.TCS_EDDYSTONE_UUID    = 'ef680105-9b35-4933-9b10-52ffa9740042';
    this.TCS_CLOUD_TOKEN_UUID  = 'ef680106-9b35-4933-9b10-52ffa9740042';
    this.TCS_FW_VER_UUID       = 'ef680107-9b35-4933-9b10-52ffa9740042';
    this.TCS_MTU_REQUEST_UUID  = 'ef680108-9b35-4933-9b10-52ffa9740042';

    // TES = Thingy Environment Service
    this.TES_UUID              = 'ef680200-9b35-4933-9b10-52ffa9740042';
    this.TES_TEMP_UUID         = 'ef680201-9b35-4933-9b10-52ffa9740042';
    this.TES_PRESSURE_UUID     = 'ef680202-9b35-4933-9b10-52ffa9740042';
    this.TES_HUMIDITY_UUID      = 'ef680203-9b35-4933-9b10-52ffa9740042';
    this.TES_GAS_UUID          = 'ef680204-9b35-4933-9b10-52ffa9740042';
    this.TES_COLOR_UUID        = 'ef680205-9b35-4933-9b10-52ffa9740042';
    this.TES_CONFIG_UUID       = 'ef680206-9b35-4933-9b10-52ffa9740042';

    // TUIS = Thingy User Interface Service
    this.TUIS_UUID              = 'ef680300-9b35-4933-9b10-52ffa9740042';
    this.TUIS_LED_UUID          = 'ef680301-9b35-4933-9b10-52ffa9740042';
    this.TUIS_BTN_UUID          = 'ef680302-9b35-4933-9b10-52ffa9740042';
    this.TUIS_PIN_UUID          = 'ef680303-9b35-4933-9b10-52ffa9740042';

    // TMS = Thingy Motion Service
    this.TMS_UUID              = 'ef680400-9b35-4933-9b10-52ffa9740042';
    this.TMS_CONFIG_UUID       = 'ef680401-9b35-4933-9b10-52ffa9740042';
    this.TMS_TAP_UUID          = 'ef680402-9b35-4933-9b10-52ffa9740042';
    this.TMS_ORIENTATION_UUID  = 'ef680403-9b35-4933-9b10-52ffa9740042';
    this.TMS_QUATERNION_UUID   = 'ef680404-9b35-4933-9b10-52ffa9740042';
    this.TMS_STEP_UUID         = 'ef680405-9b35-4933-9b10-52ffa9740042';
    this.TMS_RAW_UUID          = 'ef680406-9b35-4933-9b10-52ffa9740042';
    this.TMS_EULER_UUID        = 'ef680407-9b35-4933-9b10-52ffa9740042';
    this.TMS_ROT_MATRIX_UUID   = 'ef680408-9b35-4933-9b10-52ffa9740042';
    this.TMS_HEADING_UUID      = 'ef680409-9b35-4933-9b10-52ffa9740042';
    this.TMS_gravityVector_UUID      = 'ef68040a-9b35-4933-9b10-52ffa9740042';

    // TSS = Thingy Sound Service
    this.TSS_UUID              = 'ef680500-9b35-4933-9b10-52ffa9740042';
    this.TSS_CONFIG_UUID       = 'ef680501-9b35-4933-9b10-52ffa9740042';
    this.TSS_SPEAKER_DATA_UUID = 'ef680502-9b35-4933-9b10-52ffa9740042';
    this.TSS_SPEAKER_STAT_UUID = 'ef680503-9b35-4933-9b10-52ffa9740042';
    this.TSS_MIC_UUID          = 'ef680504-9b35-4933-9b10-52ffa9740042';

    this.serviceUUIDs = [
        this.TCS_UUID,
        this.TES_UUID,
        this.TUIS_UUID,
        this.TMS_UUID,
        this.TSS_UUID
    ];
    
    this.device = device;
    this.tempEventListeners = [,[]];
    this.pressureEventListeners = [,[]];
    this.humidityEventListeners = [,[]];
    this.gasEventListeners = [,[]];
    this.colorEventListeners = [,[]];
    this.buttonEventListeners = [,[]];
    this.tapEventListeners = [,[]];
    this.orientationEventListeners = [,[]];
    this.quaternionEventListeners = [,[]];
    this.stepEventListeners = [,[]];
    this.motionRawEventListeners = [,[]];
    this.eulerEventListeners = [,[]];
    this.rotationMatrixEventListeners = [,[]];
    this.headingEventListeners = [,[]];
    this.gravityVectorEventListeners = [,[]];
    this.speakerStatusEventListeners = [,[]];
    this.micMatrixEventListeners = [,[]];

    var device;
    var server;
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
        })
    };

    /**
     *  Method to read data from a Web Bluetooth characteristic. 
     *  Implements a simple solution to avoid starting new GATT requests while another is pending.
     *  Any attempt to read while another GATT operation is in progress, will result in a rejected promise.
     * 
     *  @param {Object} characteristic - Web Bluetooth characteristic object
     *  @return {Promise<Uint8Array | Error>} Returns Uint8Array when resolved or an error when rejected
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
        })
    };
}

/**
 *  Method to connect to Thingy
 * 
 *  @return {Promise<Error>} Returns promise with error on rejection
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
                server.getPrimaryService(this.TCS_UUID)
                .then(service =>  {
                    this.configurationService = service;
                    Promise.all([
                        service.getCharacteristic(this.TCS_NAME_UUID)
                        .then( characteristic => { 
                            this.nameCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_ADV_PARAMS_UUID)
                        .then( characteristic => { 
                            this.advParamsCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_CLOUD_TOKEN_UUID)
                        .then( characteristic => { 
                            this.cloudTokenCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_CONN_PARAMS_UUID)
                        .then( characteristic => { 
                            this.connParamsCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_EDDYSTONE_UUID)
                        .then( characteristic => { 
                            this.eddystoneCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_FW_VER_UUID)
                        .then( characteristic => { 
                            this.firmwareVersionCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TCS_MTU_REQUEST_UUID)
                        .then( characteristic => { 
                            this.mtuRequestCharacteristic = characteristic 
                        })
                        .catch( error => { 
                            console.log("Error while getting characteristic: " + error)
                        })
                    ]);
                    if(this.logEnabled)
                        console.log("Discovered Thingy configuration service and its characteristics");
                }),
                server.getPrimaryService(this.TES_UUID)
                .then(service => {
                    this.environmentService = service;
                    Promise.all([
                        service.getCharacteristic(this.TES_TEMP_UUID)
                        .then( characteristic => { 
                            this.temperatureCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TES_COLOR_UUID)
                        .then( characteristic => { 
                            this.colorCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TES_GAS_UUID)
                        .then( characteristic => { 
                            this.gasCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TES_HUMIDITY_UUID)
                        .then( characteristic => { 
                            this.humidityCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TES_PRESSURE_UUID)
                        .then( characteristic => { 
                            this.pressureCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TES_CONFIG_UUID)
                        .then( characteristic => { 
                            this.environmentConfigCharacteristic = characteristic 
                        })
                        .catch( error => { 
                            console.log("Error while getting characteristic: " + error)
                        })
                    ]);
                    if(this.logEnabled)
                        console.log("Discovered Thingy environment service and its characteristics");
                }),
                server.getPrimaryService(this.TUIS_UUID)
                .then(service => {
                    this.userInterfaceService = service;
                    Promise.all([
                        service.getCharacteristic(this.TUIS_BTN_UUID)
                        .then( characteristic => { 
                            this.buttonCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TUIS_LED_UUID)
                        .then( characteristic => { 
                            this.ledCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TUIS_PIN_UUID)
                        .then( characteristic => { 
                            this.externalPinCharacteristic = characteristic 
                        })
                        .catch( error => { 
                            console.log("Error while getting characteristic: " + error)
                        })
                    ]);
                    if(this.logEnabled)
                        console.log("Discovered Thingy user interface service and its characteristics");
                }),
                server.getPrimaryService(this.TMS_UUID)
                .then(service => {
                    this.motionService = service;
                    Promise.all([
                        service.getCharacteristic(this.TMS_CONFIG_UUID)
                        .then( characteristic => { 
                            this.tmsConfigCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_EULER_UUID)
                        .then( characteristic => { 
                            this.eulerCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_gravityVector_UUID)
                        .then( characteristic => { 
                            this.gravityVectorCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_HEADING_UUID)
                        .then( characteristic => { 
                            this.headingCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_ORIENTATION_UUID)
                        .then( characteristic => { 
                            this.orientationCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_QUATERNION_UUID)
                        .then( characteristic => { 
                            this.quaternionCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_RAW_UUID)
                        .then( characteristic => { 
                            this.motionRawCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_ROT_MATRIX_UUID)
                        .then( characteristic => { 
                            this.rotationMatrixCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_STEP_UUID)
                        .then( characteristic => { 
                            this.stepCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TMS_TAP_UUID)
                        .then( characteristic => { 
                            this.tapCharacteristic = characteristic 
                        })
                        .catch( error => { 
                            console.log("Error while getting characteristic: " + error)
                        })
                    ]);
                    if(this.logEnabled)
                        console.log("Discovered Thingy motion service and its characteristics");
                }),
                server.getPrimaryService(this.TSS_UUID)
                .then(service => {
                    this.soundService = service;
                    Promise.all([
                        service.getCharacteristic(this.TSS_CONFIG_UUID)
                        .then( characteristic => { 
                            this.tssConfigCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TSS_MIC_UUID)
                        .then( characteristic => { 
                            this.micCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TSS_SPEAKER_DATA_UUID)
                        .then( characteristic => { 
                            this.speakerDataCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.TSS_SPEAKER_STAT_UUID)
                        .then( characteristic => { 
                            this.speakerStatusCharacteristic = characteristic 
                        })
                        .catch( error => { 
                            console.log("Error while getting characteristic: " + error)
                        })
                    ]);
                    if(this.logEnabled)
                        console.log("Discovered Thingy sound service and its characteristics");
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
 *  Method to disconnect from Thingy
 * 
 *  @return {Promise<Error>} Returns promise with error on rejection
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
            characteristic.addEventListener('characteristicvaluechanged', notifyHandler);
        })
        .catch( error => {
            console.log("Error when enabling notifications for " + characteristic.uuid + ": " + error);
        })
    } else {
        return characteristic.stopNotifications()
        .then( () => {
            if(this.logEnabled)
                console.log("Notifications disabled for ", characteristic.uuid);
            characteristic.removeEventListener('characteristicvaluechanged', notifyHandler);
        })
        .catch( error => {
            console.log("Error when disabling notifications for " + characteristic.uuid + ": " + error);
        })
    }
}


/*  Configuration service  */

Thingy.prototype.nameGet = function() {
    return this.readData(this.nameCharacteristic)
    .then( receivedData => {
        var decoder = new TextDecoder('utf-8');
        var name = decoder.decode(receivedData);
        if(this.logEnabled)
            console.log("Received device name: " + name);
        return Promise.resolve(name);
    })
    .catch( error => {
        console.log("Error reading from name characteristic:, configuration service: " + error);
    })
}

Thingy.prototype.nameSet = function(name) {
    var byteArray = new Uint8Array(name.length);
    for(var i = 0, j = name.length; i < j; ++i){
        byteArray[i] = name.charCodeAt(i);
    }
    return this.writeData(nameCharacteristic, byteArray);
}

//  ******  //


/*  Environment service  */

Thingy.prototype.temperatureEnable = function(eventHandler, enable) {
    if(enable) {
        this.tempEventListeners[0] = this.temperatureNotifyHandler.bind(this);
        this.tempEventListeners[1].push(eventHandler);
    } else {
        this.tempEventListeners[1].splice(this.tempEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.temperatureCharacteristic, enable, this.tempEventListeners[0]);
}

Thingy.prototype.temperatureNotifyHandler = function(event) {
    var data = event.target.value;
	var integer = data.getUint8(0);
	var decimal = data.getUint8(1);
    var temperature = integer + (decimal/100);
    
    this.tempEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            temperature: { 
                value: temperature, 
                unit: "Celsius" 
            }
        });
    });
}

Thingy.prototype.pressureEnable = function(eventHandler, enable) {
    if(enable) {
        this.pressureEventListeners[0] = this.pressureNotifyHandler.bind(this);
        this.pressureEventListeners[1].push(eventHandler);
    } else {
        this.pressureEventListeners[1].splice(this.pressureEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.pressureCharacteristic, enable, this.pressureEventListeners[0]);
}

Thingy.prototype.pressureNotifyHandler = function(event) {
    var data = event.target.value;
	var integer = data.getUint32(0, true);
	var decimal = data.getUint8(4);
    var pressure = integer + (decimal/100);

    this.pressureEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            pressure: { 
                value: pressure, 
                unit: "hPa" 
            }
        });
    });
}

Thingy.prototype.humidityEnable = function(eventHandler, enable) {
    if(enable) {
        this.humidityEventListeners[0] = this.humidityNotifyHandler.bind(this);
        this.humidityEventListeners[1].push(eventHandler);
    } else {
        this.humidityEventListeners[1].splice(this.humidityEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.humidityCharacteristic, enable, this.humidityEventListeners[0]);
}

Thingy.prototype.humidityNotifyHandler = function(event) {
    var data = event.target.value;
	var humidity = data.getUint8(0);

    this.humidityEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            humidity: { 
                value: humidity, 
                unit: "%" 
            }
        });
    });
}

Thingy.prototype.gasEnable = function(eventHandler, enable) {
    if(enable) {
        this.gasEventListeners[0] = this.gasNotifyHandler.bind(this);
        this.gasEventListeners[1].push(eventHandler);
    } else {
        this.gasEventListeners[1].splice(this.gasEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.gasCharacteristic, enable, this.gasEventListeners[0]);
}

Thingy.prototype.gasNotifyHandler = function(event) {
    var data = event.target.value;
	var eco2 = data.getUint16(0, true);
	var tvoc = data.getUint16(2, true);

    this.gasEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            gas: { 
                eCO2 : {
                    value: eco2, 
                    unit: "ppm" 
                },
                TVOC : {
                    value: tvoc, 
                    unit: "ppb" 
                }
            }
        });
    });
}

Thingy.prototype.colorEnable = function(eventHandler, enable) {
    if(enable) {
        this.colorEventListeners[0] = this.colorNotifyHandler.bind(this);
        this.colorEventListeners[1].push(eventHandler);
    } else {
        this.colorEventListeners[1].splice(this.colorEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.colorCharacteristic, enable, this.colorEventListeners[0]);
}

Thingy.prototype.colorNotifyHandler = function(event) {
    var data = event.target.value;
	var red = data.getUint16(0, true);
	var green = data.getUint8(2, true);
	var blue = data.getUint8(4, true);
	var clear = data.getUint8(6, true);

    this.colorEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            color: { 
                red: red,
                green: green,
                blue: blue,
                clear: clear
            }
        });
    });
}

//  ******  //



/*  User interface service  */

Thingy.prototype.ledGetStatus = function() {
    return this.readData(ledCharacteristic)
    .then( data => {
        var mode = data.getUint8(0);
        var status;
        switch(mode) {
            case 0:
                status = { LEDstatus : { mode : mode }};
                break;
            case 1:
                status = { 
                    LEDstatus : { 
                        mode : mode, 
                        r : data.getUint8(1),
                        g : data.getUint8(2),
                        b : data.getUint8(3)
                        }
                    }
                break;
            case 2:
                status = { 
                    LEDstatus : { 
                        mode : mode, 
                        color : data.getUint8(1),
                        intensity : data.getUint8(2),
                        delay : data.getUint16(3)
                        }
                    }
                break;
            case 3:
                status = { 
                    LEDstatus : { 
                        mode : mode, 
                        color : data.getUint8(1),
                        intensity : data.getUint8(2)
                        }
                    }
                break;
        }
        return Promise.resolve(status);
    })
    .catch( error => {
        console.log("Error when getting Thingy LED status: " + error);
    });
}

Thingy.prototype.ledSet = function(dataArray) {
    return this.writeData(this.ledCharacteristic, dataArray);
}

Thingy.prototype.ledSetConstant = function(r, g, b) {
    return this.ledSet(new Uint8Array([1, r, g, b]));
}

Thingy.prototype.ledSetBreathe = function(color, intensity, delay) {
    return this.ledSet(new Uint8Array([2, color, intensity, delay & 0xff, (delay >> 8) & 0xff]));
}

Thingy.prototype.ledSetOneShot = function(color, intensity) {
    return this.ledSet(new Uint8Array([3, color, intensity]));
}

Thingy.prototype.buttonEnable = function(eventHandler, enable) {
    this.notifyCharacteristic(this.buttonCharacteristic, enable, this.buttonNotifyHandler, eventHandler);
}

Thingy.prototype.buttonNotifyHandler = function(event, eventHandler) {
    var state = event.target.value.getUint8(0);
    eventHandler({ buttonState: state });
}

Thingy.prototype.externalPinsGet = function() {
    return this.readData(this.externalPinCharacteristic)
    .then( data => {
        pinStatus = {
            pinStatus : {
                pin1 : data.getUint8(0),
                pin2 : data.getUint8(1),
                pin3 : data.getUint8(2),
                pin4 : data.getUint8(3)
            }
        }
        return Promise.resolve(pinStatus);
    })
    .catch( error => {
        console.log("Error when reading from external pin characteristic: " + error);
    })
}

Thingy.prototype.externalPinSet = function(pin, value) {
    if(pin < 1 || pin > 4)
        return Promise.reject(new Error("Pin number must be 1, 2, 3 or 4"))
    if(!(value == 0 || value == 255))
        return Promise.reject(new Error("Pin status value must be 0 or 255"))
    
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
        console.log("Error when setting external pins: " + error);
    })
}

//  ******  //



/*  Motion service  */

Thingy.prototype.tapEnable = function(eventHandler, enable) {
    if(enable) {
        this.tapEventListeners[0] = this.tapNotifyHandler.bind(this);
        this.tapEventListeners[1].push(eventHandler);
    } else {
        this.tapEventListeners[1].splice(this.tapEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.tapCharacteristic, enable, this.tapEventListeners[0]);
}

Thingy.prototype.tapNotifyHandler = function(event) {
    var data = event.target.value;
	var direction = data.getUint8(0);
	var count = data.getUint8(1);
    
    this.tapEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            tap: { 
                direction: direction, 
                count: count 
            }
        });
    });
}

Thingy.prototype.orientationEnable = function(eventHandler, enable) {
    if(enable) {
        this.orientationEventListeners[0] = this.orientationNotifyHandler.bind(this);
        this.orientationEventListeners[1].push(eventHandler);
    } else {
        this.orientationEventListeners[1].splice(this.orientationEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.orientationCharacteristic, enable, this.orientationEventListeners[0]);
}

Thingy.prototype.orientationNotifyHandler = function(event) {
    var data = event.target.value;
	var orientation = data.getUint8(0);
    
    this.orientationEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            orientation: orientation
        });
    });
}

Thingy.prototype.quaternionEnable = function(eventHandler, enable) {
    if(enable) {
        this.quaternionEventListeners[0] = this.quaternionNotifyHandler.bind(this);
        this.quaternionEventListeners[1].push(eventHandler);
    } else {
        this.quaternionEventListeners[1].splice(this.quaternionEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.quaternionCharacteristic, enable, this.quaternionEventListeners[0]);
}

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
            quaternion: {
                w: w,
                x: x,
                y: y,
                z: z
            }
        });
    });
}

Thingy.prototype.stepEnable = function(eventHandler, enable) {
    if(enable) {
        this.stepEventListeners[0] = this.stepNotifyHandler.bind(this);
        this.stepEventListeners[1].push(eventHandler);
    } else {
        this.stepEventListeners[1].splice(this.stepEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.stepCharacteristic, enable, this.stepEventListeners[0]);
}

Thingy.prototype.stepNotifyHandler = function(event) {
    var data = event.target.value;
	var count = data.getUint32(0, true);
	var time = data.getUint32(4, true);
    
    this.stepEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            steps: {
                count: count,
                time: {
                    value: time,
                    unit: "ms"
                }
            }
        });
    });
}

Thingy.prototype.motionRawEnable = function(eventHandler, enable) {
    if(enable) {
        this.motionRawEventListeners[0] = this.motionRawNotifyHandler.bind(this);
        this.motionRawEventListeners[1].push(eventHandler);
    } else {
        this.motionRawEventListeners[1].splice(this.motionRawEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.motionRawCharacteristic, enable, this.motionRawEventListeners[0]);
}

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
            rawData: {
                accelerometer: {
                    x: accX,
                    y: accY,
                    z: accZ,
                    unit: "G"
                },
                gyroscope: {
                    x: gyroX,
                    y: gyroY,
                    z: gyroZ,
                    unit: "deg/s"
                },
                compass: {
                    x: compassX,
                    y: compassY,
                    z: compassZ,
                    unit: "microTesla"
                }
            }
        });
    });
}

Thingy.prototype.eulerEnable = function(eventHandler, enable) {
    if(enable) {
        this.eulerEventListeners[0] = this.eulerNotifyHandler.bind(this);
        this.eulerEventListeners[1].push(eventHandler);
    } else {
        this.eulerEventListeners[1].splice(this.eulerEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.eulerCharacteristic, enable, this.eulerEventListeners[0]);
}

Thingy.prototype.eulerNotifyHandler = function(event) {
    var data = event.target.value;

    // Divide by two bytes (1<<16 or 2^16 or 65536) to get correct value
	var roll    = data.getInt32(0, true) / 65536;
	var pitch   = data.getInt32(4, true) / 65536;
	var yaw     = data.getInt32(8, true) / 65536;
    
    this.eulerEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            euler: {
                roll: roll,
                pitch: pitch,
                yaw: yaw
            }
        });
    });
}

Thingy.prototype.rotationMatrixEnable = function(eventHandler, enable) {
    if(enable) {
        this.rotationMatrixEventListeners[0] = this.rotationMatrixNotifyHandler.bind(this);
        this.rotationMatrixEventListeners[1].push(eventHandler);
    } else {
        this.rotationMatrixEventListeners[1].splice(this.rotationMatrixEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.rotationMatrixCharacteristic, enable, this.rotationMatrixEventListeners[0]);
}

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
            rotationMatrix: {
                row1: [r1c1, r1c2, r1c3],
                row2: [r2c1, r2c2, r2c3],
                row3: [r3c1, r3c2, r3c3]
            }
        });
    });
}

Thingy.prototype.headingEnable = function(eventHandler, enable) {
    if(enable) {
        this.headingEventListeners[0] = this.headingNotifyHandler.bind(this);
        this.headingEventListeners[1].push(eventHandler);
    } else {
        this.headingEventListeners[1].splice(this.headingEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.headingCharacteristic, enable, this.headingEventListeners[0]);
}

Thingy.prototype.headingNotifyHandler = function(event) {
    var data = event.target.value;

    // Divide by 2^16 = 65536 to get correct heading values
	var heading = data.getInt32(0, true) / 65536;
    
    this.headingEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            heading: {
                value: heading,
                unit: "degrees"
            }
        });
    });
}

Thingy.prototype.gravityVectorEnable = function(eventHandler, enable) {
    if(enable) {
        this.gravityVectorEventListeners[0] = this.gravityVectorNotifyHandler.bind(this);
        this.gravityVectorEventListeners[1].push(eventHandler);
    } else {
        this.gravityVectorEventListeners[1].splice(this.gravityVectorEventListeners.indexOf(eventHandler), 1);
    }
    this.notifyCharacteristic(this.gravityVectorCharacteristic, enable, this.gravityVectorEventListeners[0]);
}

Thingy.prototype.gravityVectorNotifyHandler = function(event) {
    var data = event.target.value;
	var x = data.getFloat32(0, true);
	var y = data.getFloat32(4, true);
	var z = data.getFloat32(8, true);
    
    this.gravityVectorEventListeners[1].forEach( eventHandler => {
        eventHandler( { 
            gravityVector: {
                x: x,
                y: y,
                z: z
            }
        });
    });
}


//  ******  //



/*  Sound service  */


//  ******  //



/*  Battery service  */


//  ******  //



