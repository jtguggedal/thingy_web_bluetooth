
/*
 *  Thingy:52 using Web Bluetooth
 *
 *  connect(serviceUUID, characteristicUUID) - returns promise
 *  disconnect() - returns promise
 *  sendData(dataArray) - dataArray: Uint8Array of maximum 20 bytes
 *  getDevice() - returns BLE device object
 *  isConnected() - returns bool if a peripheral is connected
 *
 */


function Thingy(logEnabled = true) {
    this.logEnabled = logEnabled;

    this.TCS_UUID              = 'ef680100-9b35-4933-9b10-52ffa9740042';
    this.TCS_NAME_UUID         = 'ef680101-9b35-4933-9b10-52ffa9740042';
    this.TCS_ADV_PARAMS_UUID   = 'ef680102-9b35-4933-9b10-52ffa9740042';
    this.TCS_CONN_PARAMS_UUID  = 'ef680104-9b35-4933-9b10-52ffa9740042';
    this.TCS_EDDYSTONE_UUID    = 'ef680105-9b35-4933-9b10-52ffa9740042';
    this.TCS_CLOUD_TOKEN_UUID  = 'ef680106-9b35-4933-9b10-52ffa9740042';
    this.TCS_FW_VER_UUID       = 'ef680107-9b35-4933-9b10-52ffa9740042';
    this.TCS_MTU_REQUEST_UUID  = 'ef680108-9b35-4933-9b10-52ffa9740042';

    this.TES_UUID              = 'ef680200-9b35-4933-9b10-52ffa9740042';
    this.TES_TEMP_UUID         = 'ef680201-9b35-4933-9b10-52ffa9740042';
    this.TES_PRESSURE_UUID     = 'ef680202-9b35-4933-9b10-52ffa9740042';
    this.TES_HUMIDITY_UUID      = 'ef680203-9b35-4933-9b10-52ffa9740042';
    this.TES_GAS_UUID          = 'ef680204-9b35-4933-9b10-52ffa9740042';
    this.TES_COLOR_UUID        = 'ef680205-9b35-4933-9b10-52ffa9740042';
    this.TES_CONFIG_UUID       = 'ef680206-9b35-4933-9b10-52ffa9740042';

    this.UIS_UUID              = 'ef680300-9b35-4933-9b10-52ffa9740042';
    this.UIS_LED_UUID          = 'ef680301-9b35-4933-9b10-52ffa9740042';
    this.UIS_BTN_UUID          = 'ef680302-9b35-4933-9b10-52ffa9740042';
    this.UIS_PIN_UUID          = 'ef680303-9b35-4933-9b10-52ffa9740042';

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
    this.TMS_GRAVITY_UUID      = 'ef68040a-9b35-4933-9b10-52ffa9740042';

    this.TSS_UUID              = 'ef680500-9b35-4933-9b10-52ffa9740042';
    this.TSS_CONFIG_UUID       = 'ef680501-9b35-4933-9b10-52ffa9740042';
    this.TSS_SPEAKER_DATA_UUID = 'ef680502-9b35-4933-9b10-52ffa9740042';
    this.TSS_SPEAKER_STAT_UUID = 'ef680503-9b35-4933-9b10-52ffa9740042';
    this.TSS_MIC_UUID          = 'ef680504-9b35-4933-9b10-52ffa9740042';

    this.serviceUUIDs = [
        this.TES_UUID,
        this.TCS_UUID,
        this.UIS_UUID,
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
    this.quaterionEventListeners = [,[]];
    this.rawEventListeners = [,[]];
    this.eulerEventListeners = [,[]];
    this.rotationMatrixEventListeners = [,[]];
    this.headingEventListeners = [,[]];
    this.gravityEventListeners = [,[]];
    this.speakerStatusEventListeners = [,[]];
    this.micMatrixEventListeners = [,[]];

    var device;
    var server;
    var bleIsBusy = false;


    this.writeData = function(characteristic, dataArray) {
        return new Promise(function(resolve, reject) {
            if(!bleIsBusy){
                bleIsBusy = true;
                return characteristic.writeValue(dataArray)
                    .then( () => {
                        bleIsBusy = false;
                        if (logEnabled)
                            console.log("Successfully sent ", dataArray);
                        resolve();
                    });
            } else {
                reject(new Error("GATT operation already pending"));
            }
        })
    };

    this.readData = function(characteristic) {
        return new Promise(function(resolve, reject) {
            if(!bleIsBusy){
                bleIsBusy = true;
                characteristic.readValue()
                    .then( (dataArray) => {
                        bleIsBusy = false;
                        if (logEnabled)
                            console.log("Received ", dataArray);
                        resolve(dataArray);
                    });
            } else {
                reject(new Error("GATT operation already pending"));
            }
        })
    };
}

Thingy.prototype.connect = function() {
    if (this.logEnabled)
        console.log("Scanning for devices with service UUID " + this.TCS_UUID);
    return navigator.bluetooth.requestDevice({
            filters: [{
                services: [this.TCS_UUID]
            }],
            optionalServices: this.services
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
                server.getPrimaryService(this.UIS_UUID)
                .then(service => {
                    this.userInterfaceService = service;
                    Promise.all([
                        service.getCharacteristic(this.UIS_BTN_UUID)
                        .then( characteristic => { 
                            this.buttonCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.UIS_LED_UUID)
                        .then( characteristic => { 
                            this.ledCharacteristic = characteristic 
                        }),
                        service.getCharacteristic(this.UIS_PIN_UUID)
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
                        service.getCharacteristic(this.TMS_GRAVITY_UUID)
                        .then( characteristic => { 
                            this.gravityCharacteristic = characteristic 
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

Thingy.prototype.getName = function() {
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

Thingy.prototype.setName = function(name) {
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
        this.tempEventListeners[1].splice(this.tempEventListeners.indexOf(eventHandler, 1));
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
        this.pressureEventListeners[1].splice(this.pressureEventListeners.indexOf(eventHandler, 1));
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
        this.humidityEventListeners[1].splice(this.humidityEventListeners.indexOf(eventHandler, 1));
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
        this.gasEventListeners[1].splice(this.gasEventListeners.indexOf(eventHandler, 1));
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
        this.colorEventListeners[1].splice(this.colorEventListeners.indexOf(eventHandler, 1));
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

Thingy.prototype.getLedStatus = function() {
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

Thingy.prototype.setLed = function(dataArray) {
    return this.writeData(this.ledCharacteristic, dataArray);
}

Thingy.prototype.setLedConstant = function(r, g, b) {
    return this.setLed(new Uint8Array([1, r, g, b]));
}

Thingy.prototype.setLedBreathe = function(color, intensity, delay) {
    return this.setLed(new Uint8Array([2, color, intensity, delay & 0xff, (delay >> 8) & 0xff]));
}

Thingy.prototype.setLedOneShot = function(color, intensity) {
    return this.setLed(new Uint8Array([3, color, intensity]));
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


//  ******  //



/*  Sound service  */


//  ******  //



/*  Battery service  */


//  ******  //



