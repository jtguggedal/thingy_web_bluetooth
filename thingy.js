
/*
 *  Interface for Thingy object
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

    this.TES_UUID              = 'ef680200-9b35-4933-9b10-52ffa9740042';
    this.TES_TEMP_UUID         = 'ef680201-9b35-4933-9b10-52ffa9740042';
    this.TES_PRESS_UUID        = 'ef680202-9b35-4933-9b10-52ffa9740042';
    this.TES_HUMID_UUID        = 'ef680203-9b35-4933-9b10-52ffa9740042';
    this.TES_GAS_UUID          = 'ef680204-9b35-4933-9b10-52ffa9740042';
    this.TES_COLOR_UUID        = 'ef680205-9b35-4933-9b10-52ffa9740042';
    this.TES_CONF_UUID         = 'ef680206-9b35-4933-9b10-52ffa9740042';

    this.UIS_UUID              = 'ef680300-9b35-4933-9b10-52ffa9740042';
    this.UIS_LED_UUID          = 'ef680301-9b35-4933-9b10-52ffa9740042';
    this.UIS_BTN_UUID          = 'ef680302-9b35-4933-9b10-52ffa9740042';
    this.UIS_PIN_UUID          = 'ef680303-9b35-4933-9b10-52ffa9740042';

    this.TMS_UUID              = 'ef680400-9b35-4933-9b10-52ffa9740042';

    this.TSS_UUID              = 'ef680500-9b35-4933-9b10-52ffa9740042';
    this.TSS_CONF_UUID         = 'ef680501-9b35-4933-9b10-52ffa9740042';
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

    var device;
    var server;


    this.device = device;




    this.sendData = function(char, dataArray) {
        this.isBusy = true;
        return char.writeValue(dataArray)
            .then(() => {
                this.isBusy = false;
                if (logEnabled)
                    console.log("Successfully sent ", dataArray);
            });
    };

    this.readData = function(char, dataArray) {
        this.isBusy = true;
        return char.readValue(dataArray)
            .then(() => {
                this.isBusy = false;
                if (logEnabled)
                    console.log("Successfully sent ", dataArray);
            });
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
                        if(this.logEnabled)
                            console.log("Discovered Thingy configuration service");
                    }),
                server.getPrimaryService(this.TES_UUID)
                    .then(service => {
                        this.environmentService = service;
                        if(this.logEnabled)
                            console.log("Discovered Thingy environment service");
                    }),
                server.getPrimaryService(this.UIS_UUID)
                    .then(service => {
                        this.userInterfaceService = service;
                        if(this.logEnabled)
                            console.log("Discovered Thingy user interface service");
                    }),
                server.getPrimaryService(this.TMS_UUID)
                    .then(service => {
                        this.motionService = service;
                        if(this.logEnabled)
                            console.log("Discovered Thingy motion service");
                    }),
                server.getPrimaryService(this.TSS_UUID)
                    .then(service => {
                        this.soundService = service;
                        if(this.logEnabled)
                            console.log("Discovered Thingy sound service");
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


Thingy.prototype.temperature_enable = function(error) {
    //this.notifyCharacteristic(TES_UUID, TES_TEMP_UUID, true, this.onTempNotifBinded, error);
  };
