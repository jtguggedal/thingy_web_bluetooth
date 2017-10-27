
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

    const TCS_UUID              = 'ef680100-9b35-4933-9b10-52ffa9740042';

    const TES_UUID              = 'ef680200-9b35-4933-9b10-52ffa9740042';
    const TES_TEMP_UUID         = 'ef680201-9b35-4933-9b10-52ffa9740042';
    const TES_PRESS_UUID        = 'ef680202-9b35-4933-9b10-52ffa9740042';
    const TES_HUMID_UUID        = 'ef680203-9b35-4933-9b10-52ffa9740042';
    const TES_GAS_UUID          = 'ef680204-9b35-4933-9b10-52ffa9740042';
    const TES_COLOR_UUID        = 'ef680205-9b35-4933-9b10-52ffa9740042';
    const TES_CONF_UUID         = 'ef680206-9b35-4933-9b10-52ffa9740042';

    const UIS_UUID              = 'ef680300-9b35-4933-9b10-52ffa9740042';
    const UIS_LED_UUID          = 'ef680301-9b35-4933-9b10-52ffa9740042';
    const UIS_BTN_UUID          = 'ef680302-9b35-4933-9b10-52ffa9740042';
    const UIS_PIN_UUID          = 'ef680303-9b35-4933-9b10-52ffa9740042';

    const TMS_UUID              = 'ef680400-9b35-4933-9b10-52ffa9740042';

    const TSS_UUID              = 'ef680500-9b35-4933-9b10-52ffa9740042';
    const TSS_CONF_UUID         = 'ef680501-9b35-4933-9b10-52ffa9740042';
    const TSS_SPEAKER_DATA_UUID = 'ef680502-9b35-4933-9b10-52ffa9740042';
    const TSS_SPEAKER_STAT_UUID = 'ef680503-9b35-4933-9b10-52ffa9740042';
    const TSS_MIC_UUID          = 'ef680504-9b35-4933-9b10-52ffa9740042';

    var services = [
        TCS_UUID,
        TES_UUID,
        UIS_UUID,
        TMS_UUID,
        TSS_UUID
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
                console.log("Found device " + this.device + ", trying to connect to GATT server");
            return this.device.gatt.connect();
        })
        .then(s => {
            server = s;
            if (this.logEnabled)
                console.log("Connected to server " + s + ", getting service");
            return server.getPrimaryService(this.TES_UUID);
        })
        .then(sc => {
            this.service = sc;
            if (this.logEnabled)
                console.log("Found service " + this.service + ", getting characteristic");
            return this.service.getCharacteristic(this.TES_TEMP_UUID);
        })
        .then(ch => {
            this.characteristic = ch;
            if (this.logEnabled)
                console.log("Characteristic " + this.characteristic + " found and available globally");
                this.isConnected = true;
        })
        .catch(error => {
            console.log("Error during connect: " + error);
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
    this.notifyCharacteristic(TES_UUID, TES_TEMP_UUID, true, this.onTempNotifBinded, error);
  };
