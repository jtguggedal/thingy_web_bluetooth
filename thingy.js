
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

    var device;
    var server;
    var bleIsBusy = false;

    this.writeData = function(char, dataArray) {
        return new Promise(function(resolve, reject) {
            if(!bleIsBusy){
                bleIsBusy = true;
                return char.writeValue(dataArray)
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

    this.readData = function(char) {
        return new Promise(function(resolve, reject) {
            if(!bleIsBusy){
                bleIsBusy = true;
                char.readValue()
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

Thingy.prototype.notifyCharacteristic = function(characteristic, enable, notifyHandler, eventHandler) {
    if(enable) {
        return characteristic.startNotifications()
        .then( () => {
            if(this.logEnabled)
                console.log("Notifications enabled for " + characteristic.uuid);
            characteristic.addEventListener('characteristicvaluechanged', event => { notifyHandler(event, eventHandler) });
        })
        .catch( error => {
            console.log("Error when enabling notifications for " + characteristic.uuid + ": " + error);
        })
    } else {
        return characteristic.stopNotifications()
        .then( () => {
            if(this.logEnabled)
                console.log("Notifications disabled for ", characteristic.uuid);
            characteristic.removeEventListener('characteristicvaluechanged', event => { notifyHandler(event, eventHandler) });
        })
        .catch( error => {
            console.log("Error when disabling notifications for " + characteristic.uuid + ": " + error);
        })
    }
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
                            this.pinCharacteristic = characteristic 
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
    this.notifyCharacteristic(this.temperatureCharacteristic, enable, this.temperatureNotifyHandler, eventHandler);
}

Thingy.prototype.temperatureNotifyHandler = function(event, eventHandler) {
    var data = event.target.value;
	var integer = data.getUint8(0);
	var decimal = data.getUint8(1);
    var temperature = integer + (decimal/100);

    eventHandler({ temperature: {value: temperature, unit: "Celsius" }});
}

//  ******  //



/*  User interface service  */

Thingy.prototype.getLedStatus = function() {
    return this.userInterfaceService.getCharacteristic(this.UIS_LED_UUID)
    .then( characteristic => {
        return this.readData(characteristic)
    })
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

}


//  ******  //



/*  Motion service  */


//  ******  //



/*  Sound service  */


//  ******  //



/*  Battery service  */


//  ******  //



