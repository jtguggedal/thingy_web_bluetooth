
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


var Thingy = (function(serviceUUID, characteristicUUIDs) {
    
        const TCS_UUID              = 'ef6801009b3549339b1052ffa9740042';
    
        const TES_UUID              = 'ef6802009b3549339b1052ffa9740042';
        const TES_TEMP_UUID         = 'ef6802019b3549339b1052ffa9740042';
        const TES_PRESS_UUID        = 'ef6802029b3549339b1052ffa9740042';
        const TES_HUMID_UUID        = 'ef6802039b3549339b1052ffa9740042';
        const TES_GAS_UUID          = 'ef6802049b3549339b1052ffa9740042';
        const TES_COLOR_UUID        = 'ef6802059b3549339b1052ffa9740042';
        const TES_CONF_UUID         = 'ef6802069b3549339b1052ffa9740042';
    
        const UIS_UUID              = 'ef6803009b3549339b1052ffa9740042';
        const UIS_LED_UUID          = 'ef6803019b3549339b1052ffa9740042';
        const UIS_BTN_UUID          = 'ef6803029b3549339b1052ffa9740042';
        const UIS_PIN_UUID          = 'ef6803039b3549339b1052ffa9740042';
    
        const TMS_UUID              = 'ef6804009b3549339b1052ffa9740042';
    
        const TSS_UUID              = 'ef6805009b3549339b1052ffa9740042';
        const TSS_CONF_UUID         = 'ef6805019b3549339b1052ffa9740042';
        const TSS_SPEAKER_DATA_UUID = 'ef6805029b3549339b1052ffa9740042';
        const TSS_SPEAKER_STAT_UUID = 'ef6805039b3549339b1052ffa9740042';
        const TSS_MIC_UUID          = 'ef6805049b3549339b1052ffa9740042';
    
        var services = [
            TCS_UUID,
            TES_UUID,
            UIS_UUID,
            TMS_UUID,
            TSS_UUID
        ];
    
        var device;
        var server;
        var service;
        var characteristic;
        var isConnected = false;
        var isBusy = false;
        var logEnabled = false;
    
        var connect = function(serviceUUID, characteristicUUID, _logEnabled) {
            logEnabled = _logEnabled | logEnabled;
            if (logEnabled)
                console.log("Scanning for devices with service UUID " + serviceUUID);
            return navigator.bluetooth.requestDevice({
                    filters: [{
                        services: services
                    }]
                })
                .then(d => {
                    device = d;
                    if (logEnabled)
                        console.log("Found device " + device + ", trying to connect to GATT server");
                    return device.gatt.connect();
                })
                .then(s => {
                    server = s;
                    if (logEnabled)
                        console.log("Connected to server " + s + ", getting service");
                    return server.getPrimaryService(serviceUUID);
                })
                .then(sc => {
                    service = sc;
                    if (logEnabled)
                        console.log("Found service " + service + ", getting characteristic");
                    return service.getCharacteristic(characteristicUUID);
                })
                .then(ch => {
                    characteristic = ch;
                    if (logEnabled)
                        console.log("Characteristic " + characteristic + " found and available globally");
                    isConnected = true;
                })
                .catch(error => {
                    console.log("Error during connect: " + error);
                });
        };
    
        var disconnect = function() {
            return new Promise(function(resolve, reject) {
                device.gatt.disconnect();
                if (device.gatt.connected == false) {
                    isConnected = false;
                    resolve();
                } else {
                    reject(new Error("Error on disconnect"));
                }
            });
        };
    
        var sendData = function(char, dataArray) {
            isBusy = true;
            return char.writeValue(dataArray)
                .then(() => {
                    isBusy = false;
                    if (logEnabled)
                        console.log("Successfully sent ", dataArray);
                });
        };
    
        var readData = function(char, dataArray) {
            isBusy = true;
            return char.readValue(dataArray)
                .then(() => {
                    isBusy = false;
                    if (logEnabled)
                        console.log("Successfully sent ", dataArray);
                });
        };
    
        return {
            getDevice: function() {
                return device;
            },
            connect: connect,
            disconnect: disconnect,
            sendData: sendData,
            isConnected: function() {
                return isConnected;
            }
        };
    })();
    