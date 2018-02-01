/** */
export class Thingy {
  /**
     *  Thingy:52 Web Bluetooth API. <br>
     *  BLE service details {@link https://nordicsemiconductor.github.io/Nordic-Thingy52-FW/documentation/firmware_architecture.html#fw_arch_ble_services here}
     *
     *
     *  @constructor
     *  @param {Object} [options = {logEnabled: false}] - Options object for Thingy
     *  @param {boolean} options.logEnabled - Enables logging of all BLE actions.
     *
    */
  constructor(options = {logEnabled: false}) {
    this.logEnabled = options.logEnabled;

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

    this.bleIsBusy = false;
    this.device;
    this.batteryLevelEventListeners = [null, []];
    this.tempEventListeners = [null, []];
    this.pressureEventListeners = [null, []];
    this.humidityEventListeners = [null, []];
    this.gasEventListeners = [null, []];
    this.colorEventListeners = [null, []];
    this.buttonEventListeners = [null, []];
    this.tapEventListeners = [null, []];
    this.orientationEventListeners = [null, []];
    this.quaternionEventListeners = [null, []];
    this.stepEventListeners = [null, []];
    this.motionRawEventListeners = [null, []];
    this.eulerEventListeners = [null, []];
    this.rotationMatrixEventListeners = [null, []];
    this.headingEventListeners = [null, []];
    this.gravityVectorEventListeners = [null, []];
    this.speakerStatusEventListeners = [null, []];
    this.microphoneEventListeners = [null, []];
  }

  /**
     *  Method to read data from a Web Bluetooth characteristic.
     *  Implements a simple solution to avoid starting new GATT requests while another is pending.
     *  Any attempt to read while another GATT operation is in progress, will result in a rejected promise.
     *
     *  @async
     *  @param {Object} characteristic - Web Bluetooth characteristic object
     *  @return {Promise<DataView>} Returns Uint8Array when resolved or an error when rejected
     *
     *  @private

    */
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

  /**
   *  Method to write data to a Web Bluetooth characteristic.
   *  Implements a simple solution to avoid starting new GATT requests while another is pending.
   *  Any attempt to send data during another GATT operation will result in a rejected promise.
   *  No retransmission is implemented at this level.
   *
   *  @async
   *  @param {Object} characteristic - Web Bluetooth characteristic object
   *  @param {Uint8Array} dataArray - Typed array of bytes to send
   *  @return {Promise}
   *
   *  @private
   *
  */
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

  /**
   *  Connects to Thingy.
   *  The function stores all discovered services and characteristics to the Thingy object.
   *
   *  @async
   *  @return {Promise<Error>} Returns an empty promise when resolved or a promise with error on rejection
   *
   */
  async connect() {
    try {
      // Scan for Thingys
      if (this.logEnabled) {
        console.log(`Scanning for devices with service UUID equal to ${this.TCS_UUID}`);
      }

      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [this.TCS_UUID],
          },
        ],
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
      this.microphoneCharacteristic = await this.soundService.getCharacteristic(this.TSS_MIC_UUID);
      this.speakerDataCharacteristic = await this.soundService.getCharacteristic(this.TSS_SPEAKER_DATA_UUID);
      this.speakerStatusCharacteristic = await this.soundService.getCharacteristic(this.TSS_SPEAKER_STAT_UUID);
      if (this.logEnabled) {
        console.log("Discovered Thingy sound service and its characteristics");
      }
    } catch (error) {
      return error;
    }
  }

  /**
   *  Method to disconnect from Thingy.
   *
   *  @async
   *  @return {Promise<Error>} Returns an empty promise when resolved or a promise with error on rejection.
   */
  async disconnect() {
    try {
      await this.device.gatt.disconnect();
    } catch (error) {
      return error;
    }
  }

  // Method to enable and disable notifications for a characteristic
  async _notifyCharacteristic(characteristic, enable, notifyHandler) {
    if (enable) {
      try {
        await characteristic.startNotifications();
        if (this.logEnabled) {
          console.log("Notifications enabled for " + characteristic.uuid);
        }
        characteristic.addEventListener("characteristicvaluechanged", notifyHandler);
      } catch (error) {
        return error;
      }
    } else {
      try {
        await characteristic.stopNotifications();
        if (this.logEnabled) {
          console.log("Notifications disabled for ", characteristic.uuid);
        }
        characteristic.removeEventListener("characteristicvaluechanged", notifyHandler);
      } catch (error) {
        return error;
      }
    }
  }

  /*  Configuration service  */
  /**
   *  Gets the name of the Thingy device.
   *
   *  @async
   *  @return {Promise<string|Error>} Returns a string with the name when resolved or a promise with error on rejection.
   *
   */
  async getName() {
    try {
      const data = await this._readData(this.nameCharacteristic);
      const decoder = new TextDecoder("utf-8");
      const name = decoder.decode(data);
      if (this.logEnabled) {
        console.log("Received device name: " + name);
      }
      return name;
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the name of the Thingy device.
   *
   *  @async
   *  @param {string} name - The name that will be given to the Thingy.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setName(name) {
    if (name.length > 10) {
      return Promise.reject(new TypeError("The name can't be more than 10 characters long."));
    }
    const byteArray = new Uint8Array(name.length);
    for (let i = 0; i < name.length; i += 1) {
      byteArray[i] = name.charCodeAt(i);
    }
    return await this._writeData(this.nameCharacteristic, byteArray);
  }

  /**
   *  Gets the current advertising parameters
   *
   *  @async
   *  @return {Promise<Object|Error>} Returns an object with the advertising parameters when resolved or a promise with error on rejection.
   */
  async getAdvParams() {
    try {
      const receivedData = await this._readData(this.advParamsCharacteristic);

      // Interval is given in units of 0.625 milliseconds
      const littleEndian = true;
      const interval = (receivedData.getUint16(0, littleEndian) * 0.625).toFixed(0);
      const timeout = receivedData.getUint8(2);
      const params = {
        interval: {
          interval: interval,
          unit: "ms",
        },
        timeout: {
          timeout: timeout,
          unit: "s",
        },
      };
      return params;
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the advertising parameters
   *
   *  @async
   *  @param {Object} params - Object with key/value pairs 'interval' and 'timeout': <code>{interval: someInterval, timeout: someTimeout}</code>.
   *  @param {number} params.interval - The advertising interval in milliseconds in the range of 20 ms to 5 000 ms.
   *  @param {number} params.timeout - The advertising timeout in seconds in the range 1 s to 180 s.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setAdvParams(params) {
    if (typeof params !== "object" || params.interval === undefined || params.timeout === undefined) {
      return Promise.reject(
        new TypeError("The argument has to be an object with key/value pairs interval' and 'timeout': {interval: someInterval, timeout: someTimeout}")
      );
    }

    // Interval is in units of 0.625 ms.
    const interval = params.interval * 1.6;
    const timeout = params.timeout;

    // Check parameters
    if (interval < 32 || interval > 8000) {
      return Promise.reject(new RangeError("The advertising interval must be within the range of 20 ms to 5 000 ms"));
    }
    if (timeout < 0 || timeout > 180) {
      return Promise.reject(new RangeError("The advertising timeout must be within the range of 0 to 180 s"));
    }

    const dataArray = new Uint8Array(3);
    dataArray[0] = interval & 0xff;
    dataArray[1] = (interval >> 8) & 0xff;
    dataArray[2] = timeout;

    return await this._writeData(this.advParamsCharacteristic, dataArray);
  }

  /**
   *  Gets the current connection parameters.
   *
   *  @async
   *  @return {Promise<Object|Error>} Returns an object with the connection parameters when resolved or a promise with error on rejection.
   *
   */
  async getConnParams() {
    try {
      const receivedData = await this._readData(this.connParamsCharacteristic);

      // Connection intervals are given in units of 1.25 ms
      const littleEndian = true;
      const minConnInterval = receivedData.getUint16(0, littleEndian) * 1.25;
      const maxConnInterval = receivedData.getUint16(2, littleEndian) * 1.25;
      const slaveLatency = receivedData.getUint16(4, littleEndian);

      // Supervision timeout is given i units of 10 ms
      const supervisionTimeout = receivedData.getUint16(6, littleEndian) * 10;
      const params = {
        connectionInterval: {
          min: minConnInterval,
          max: maxConnInterval,
          unit: "ms",
        },
        slaveLatency: {
          value: slaveLatency,
          unit: "number of connection intervals",
        },
        supervisionTimeout: {
          timeout: supervisionTimeout,
          unit: "ms",
        },
      };
      return params;
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the connection interval
   *
   *  @async
   *  @param {Object} params - Connection interval object: <code>{minInterval: someValue, maxInterval: someValue}</code>
   *  @param {number} params.minInterval - The minimum connection interval in milliseconds. Must be >= 7.5 ms.
   *  @param {number} params.maxInterval - The maximum connection interval in milliseconds. Must be <= 4 000 ms.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setConnInterval(params) {
    if (typeof params !== "object" || params.minInterval === undefined || params.maxInterval === undefined) {
      return Promise.reject(new TypeError("The argument has to be an object: {minInterval: value, maxInterval: value}"));
    }

    let minInterval = params.minInterval;
    let maxInterval = params.maxInterval;

    if (minInterval === null || maxInterval === null) {
      return Promise.reject(new TypeError("Both minimum and maximum acceptable interval must be passed as arguments"));
    }

    // Check parameters
    if (minInterval < 7.5 || minInterval > maxInterval) {
      return Promise.reject(
        new RangeError("The minimum connection interval must be greater than 7.5 ms and <= maximum interval")
      );
    }
    if (maxInterval > 4000 || maxInterval < minInterval) {
      return Promise.reject(
        new RangeError("The minimum connection interval must be less than 4 000 ms and >= minimum interval")
      );
    }

    try {
      const receivedData = await this._readData(this.connParamsCharacteristic);
      const dataArray = new Uint8Array(8);

      // Interval is in units of 1.25 ms.
      minInterval = Math.round(minInterval * 0.8);
      maxInterval = Math.round(maxInterval * 0.8);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = minInterval & 0xff;
      dataArray[1] = (minInterval >> 8) & 0xff;
      dataArray[2] = maxInterval & 0xff;
      dataArray[3] = (maxInterval >> 8) & 0xff;

      return await this._writeData(this.connParamsCharacteristic, dataArray);
    } catch (error) {
      return Promise.reject(new Error("Error when updating connection interval: " + error));
    }
  }

  /**
   *  Sets the connection slave latency
   *
   *  @async
   *  @param {number} slaveLatency - The desired slave latency in the range from 0 to 499 connection intervals.
   *  @return {Promise<Object>} Returns a promise.
   *
   */
  async setConnSlaveLatency(slaveLatency) {
    // Check parameters
    if (slaveLatency < 0 || slaveLatency > 499) {
      return Promise.reject(
        new RangeError("The slave latency must be in the range from 0 to 499 connection intervals.")
      );
    }

    try {
      const receivedData = await this._readData(this.connParamsCharacteristic);
      const dataArray = new Uint8Array(8);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = slaveLatency & 0xff;
      dataArray[5] = (slaveLatency >> 8) & 0xff;

      return await this._writeData(this.connParamsCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when updating slave latency: " + error);
    }
  }

  /**
   *  Sets the connection supervision timeout
   *  <b>Note:</b> According to the Bluetooth Low Energy specification, the supervision timeout in milliseconds must be greater
   *  than (1 + slaveLatency) * maxConnInterval * 2, where maxConnInterval is also given in milliseconds.
   *
   *  @async
   *  @param {number} timeout - The desired connection supervision timeout in milliseconds and in the range of 100 ms to 32 000 ms.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setConnTimeout(timeout) {
    // Check parameters
    if (timeout < 100 || timeout > 32000) {
      return Promise.reject(new RangeError("The supervision timeout must be in the range from 100 ms to 32 000 ms."));
    }

    try {
      // The supervision timeout has to be set in units of 10 ms
      timeout = Math.round(timeout / 10);
      const receivedData = await this._readData(this.connParamsCharacteristic);
      const dataArray = new Uint8Array(8);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      // Check that the timeout obeys  conn_sup_timeout * 4 > (1 + slave_latency) * max_conn_interval
      const littleEndian = true;
      const maxConnInterval = receivedData.getUint16(2, littleEndian);
      const slaveLatency = receivedData.getUint16(4, littleEndian);

      if (timeout * 4 < (1 + slaveLatency) * maxConnInterval) {
        return Promise.reject(new Error("The supervision timeout in milliseconds must be greater than (1 + slaveLatency) * maxConnInterval * 2, where maxConnInterval is also given in milliseconds.")
        );
      }

      dataArray[6] = timeout & 0xff;
      dataArray[7] = (timeout >> 8) & 0xff;

      return await this._writeData(this.connParamsCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when updating the supervision timeout: " + error);
    }
  }

  /**
   *  Gets the configured Eddystone URL
   *
   *  @async
   *  @return {Promise<URL|Error>} Returns a string with the URL when resolved or a promise with error on rejection.
   *
   */
  async getEddystoneUrl() {
    try {
      const receivedData = await this._readData(this.eddystoneCharacteristic);

      // According to Eddystone URL encoding specification, certain elements can be expanded: https://github.com/google/eddystone/tree/master/eddystone-url
      const prefixArray = ["http://www.", "https://www.", "http://", "https://"];
      const expansionCodes = [
        ".com/",
        ".org/",
        ".edu/",
        ".net/",
        ".info/",
        ".biz/",
        ".gov/",
        ".com",
        ".org",
        ".edu",
        ".net",
        ".info",
        ".biz",
        ".gov",
      ];
      const prefix = prefixArray[receivedData.getUint8(0)];
      const decoder = new TextDecoder("utf-8");
      let url = decoder.decode(receivedData);
      url = prefix + url.slice(1);

      expansionCodes.forEach((element, i) => {
        if (url.indexOf(String.fromCharCode(i)) !== -1) {
          url = url.replace(String.fromCharCode(i), expansionCodes[i]);
        }
      });

      return new URL(url);
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the Eddystone URL
   *  It's recommeended to use URL shortener to stay within the limit of 14 characters long URL
   *  URL scheme prefix such as "https://" and "https://www." do not count towards that limit,
   *  neither does expansion codes such as ".com/" and ".org".
   *  Full details in the Eddystone URL specification: https://github.com/google/eddystone/tree/master/eddystone-url
   *
   *  @async
   *  @param {string} urlString - The URL that should be broadcasted.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setEddystoneUrl(urlString) {
    try {
      // Uses URL API to check for valid URL
      const url = new URL(urlString);

      // Eddystone URL specification defines codes for URL scheme prefixes and expansion codes in the URL.
      // The array index corresponds to the defined code in the specification.
      // Details here: https://github.com/google/eddystone/tree/master/eddystone-url
      const prefixArray = ["http://www.", "https://www.", "http://", "https://"];
      const expansionCodes = [
        ".com/",
        ".org/",
        ".edu/",
        ".net/",
        ".info/",
        ".biz/",
        ".gov/",
        ".com",
        ".org",
        ".edu",
        ".net",
        ".info",
        ".biz",
        ".gov",
      ];
      let prefixCode = null;
      let expansionCode = null;
      let eddystoneUrl = url.href;
      let len = eddystoneUrl.length;

      prefixArray.forEach((element, i) => {
        if (url.href.indexOf(element) !== -1 && prefixCode === null) {
          prefixCode = String.fromCharCode(i);
          eddystoneUrl = eddystoneUrl.replace(element, prefixCode);
          len -= element.length;
        }
      });

      expansionCodes.forEach((element, i) => {
        if (url.href.indexOf(element) !== -1 && expansionCode === null) {
          expansionCode = String.fromCharCode(i);
          eddystoneUrl = eddystoneUrl.replace(element, expansionCode);
          len -= element.length;
        }
      });

      if (len < 1 || len > 14) {
        return Promise.reject(new TypeError("The URL can't be longer than 14 characters, excluding URL scheme such as \"https://\" and \".com/\".")
        );
      }

      const byteArray = new Uint8Array(eddystoneUrl.length);

      for (let i = 0; i < eddystoneUrl.length; i++) {
        byteArray[i] = eddystoneUrl.charCodeAt(i);
      }

      return this._writeData(this.eddystoneCharacteristic, byteArray);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   *  Gets the configured cloud token.
   *
   *  @async
   *  @return {Promise<string|Error>} Returns a string with the cloud token when resolved or a promise with error on rejection.
   *
   */
  async getCloudToken() {
    try {
      const receivedData = await this._readData(this.cloudTokenCharacteristic);
      const decoder = new TextDecoder("utf-8");
      const token = decoder.decode(receivedData);

      return token;
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the cloud token.
   *
   *  @async
   *  @param {string} token - The cloud token to be stored.
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setCloudToken(token) {
    if (token.length > 250) {
      return Promise.reject(new Error("The cloud token can not exceed 250 characters."));
    }

    const encoder = new TextEncoder("utf-8").encode(token);

    return this._writeData(this.cloudTokenCharacteristic, encoder);
  }

  /**
   *  Gets the current Maximal Transmission Unit (MTU)
   *
   *  @async
   *  @return {Promise<number|Error>} Returns the MTU when resolved or a promise with error on rejection.
   *
   */
  async getMtu() {
    try {
      const receivedData = await this._readData(this.mtuRequestCharacteristic);
      const littleEndian = true;
      const mtu = receivedData.getUint16(1, littleEndian);

      return mtu;
    } catch (error) {
      return error;
    }
  }

  /**
   *  Sets the current Maximal Transmission Unit (MTU)
   *
   *  @async
   *  @param {Object} [params = {peripheralRequest: true}] - MTU settings object: {mtuSize: value, peripheralRequest: value}, where peripheralRequest is optional.
   *  @param {number} params.mtuSize - The desired MTU size.
   *  @param {boolean} params.peripheralRequest - Optional. Set to <code>true</code> if peripheral should send an MTU exchange request. Default is <code>true</code>;
   *  @return {Promise<Error>} Returns a promise.
   *
   */
  async setMtu(params) {
    if (typeof params !== "object" || params.mtuSize === undefined) {
      return Promise.reject(new TypeError("The argument has to be an object"));
    }

    const mtuSize = params.mtuSize;
    const peripheralRequest = params.peripheralRequest || true;

    if (mtuSize < 23 || mtuSize > 276) {
      return Promise.reject(new Error("MTU size must be in range 23 - 276 bytes"));
    }

    const dataArray = new Uint8Array(3);
    dataArray[0] = peripheralRequest ? 1 : 0;
    dataArray[1] = mtuSize & 0xff;
    dataArray[2] = (mtuSize >> 8) & 0xff;

    return this._writeData(this.mtuRequestCharacteristic, dataArray);
  }

  /**
   *  Gets the current firmware version.
   *
   *  @async
   *  @return {Promise<string|Error>} Returns a string with the firmware version or a promise with error on rejection.
   *
   */
  async getFirmwareVersion() {
    try {
      const receivedData = await this._readData(this.firmwareVersionCharacteristic);
      const major = receivedData.getUint8(0);
      const minor = receivedData.getUint8(1);
      const patch = receivedData.getUint8(2);
      const version = `v${major}.${minor}.${patch}`;

      return version;
    } catch (error) {
      return error;
    }
  }

  //  ******  //

  /*  Environment service  */

  /**
   *  Gets the current configuration of the Thingy environment module.
   *
   *  @async
   *  @return {Promise<Object|Error>} Returns an environment configuration object when promise resolves, or an error if rejected.
   *
   */
  async getEnvironmentConfig() {
    try {
      const data = await this._readData(this.environmentConfigCharacteristic);
      const littleEndian = true;
      const tempInterval = data.getUint16(0, littleEndian);
      const pressureInterval = data.getUint16(2, littleEndian);
      const humidityInterval = data.getUint16(4, littleEndian);
      const colorInterval = data.getUint16(6, littleEndian);
      const gasMode = data.getUint8(8);
      const colorSensorRed = data.getUint8(9);
      const colorSensorGreen = data.getUint8(10);
      const colorSensorBlue = data.getUint8(11);
      const config = {
        tempInterval: tempInterval,
        pressureInterval: pressureInterval,
        humidityInterval: humidityInterval,
        colorInterval: colorInterval,
        gasMode: gasMode,
        colorSensorRed: colorSensorRed,
        colorSensorGreen: colorSensorGreen,
        colorSensorBlue: colorSensorBlue,
      };

      return config;
    } catch (error) {
      return new Error("Error when getting environment sensors configurations: " + error);
    }
  }

  /**
   *  Sets the temperature measurement update interval.
   *
   *  @async
   *  @param {Number} interval - Temperature sensor update interval in milliseconds. Must be in the range 100 ms to 60 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setTemperatureInterval(interval) {
    try {
      if (interval < 50 || interval > 60000) {
        return Promise.reject(new RangeError("The temperature sensor update interval must be in the range 100 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new temperature update interval: " + error);
    }
  }

  /**
   *  Sets the pressure measurement update interval.
   *
   *  @async
   *  @param {Number} interval - The pressure sensor update interval in milliseconds. Must be in the range 50 ms to 60 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setPressureInterval(interval) {
    try {
      if (interval < 50 || interval > 60000) {
        return Promise.reject(new RangeError("The pressure sensor update interval must be in the range 100 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[2] = interval & 0xff;
      dataArray[3] = (interval >> 8) & 0xff;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new pressure update interval: " + error);
    }
  }

  /**
   *  Sets the humidity measurement update interval.
   *
   *  @async
   *  @param {Number} interval - Humidity sensor interval in milliseconds. Must be in the range 100 ms to 60 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setHumidityInterval(interval) {
    try {
      if (interval < 100 || interval > 60000) {
        return Promise.reject(new RangeError("The humidity sensor sampling interval must be in the range 100 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = interval & 0xff;
      dataArray[5] = (interval >> 8) & 0xff;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new humidity update interval: " + error);
    }
  }

  /**
   *  Sets the color sensor update interval.
   *
   *  @async
   *  @param {Number} interval - Color sensor sampling interval in milliseconds. Must be in the range 200 ms to 60 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setColorInterval(interval) {
    try {
      if (interval < 200 || interval > 60000) {
        return Promise.reject(new RangeError("The color sensor sampling interval must be in the range 200 ms - 60 000 ms"));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = interval & 0xff;
      dataArray[7] = (interval >> 8) & 0xff;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new color sensor update interval: " + error);
    }
  }

  /**
   *  Sets the gas sensor sampling interval.
   *
   *  @param {Number} interval - The gas sensor update interval in seconds. Allowed values are 1, 10, and 60 seconds.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setGasInterval(interval) {
    try {
      let mode;

      if (interval === 1) {
        mode = 1;
      } else if (interval === 10) {
        mode = 2;
      } else if (interval === 60) {
        mode = 3;
      } else {
        return Promise.reject(new RangeError("The gas sensor interval has to be 1, 10 or 60 seconds."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = mode;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new gas sensor interval: " + error);
    }
  }

  /**
   *  Configures color sensor LED calibration parameters.
   *
   *  @async
   *  @param {Number} red - The red intensity, ranging from 0 to 255.
   *  @param {Number} green - The green intensity, ranging from 0 to 255.
   *  @param {Number} blue - The blue intensity, ranging from 0 to 255.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async colorSensorCalibrate(red, green, blue) {
    try {
      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.environmentConfigCharacteristic);
      const dataArray = new Uint8Array(12);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[9] = red;
      dataArray[10] = green;
      dataArray[11] = blue;

      return await this._writeData(this.environmentConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new color sensor parameters: " + error);
    }
  }

  /**
   *  Enables temperature notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a temperature object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async temperatureEnable(eventHandler, enable) {
    if (enable) {
      this.tempEventListeners[0] = this._temperatureNotifyHandler.bind(this);
      this.tempEventListeners[1].push(eventHandler);
    } else {
      this.tempEventListeners[1].splice(this.tempEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.temperatureCharacteristic, enable, this.tempEventListeners[0]);
  }

  _temperatureNotifyHandler(event) {
    const data = event.target.value;
    const integer = data.getUint8(0);
    const decimal = data.getUint8(1);
    const temperature = integer + decimal / 100;
    this.tempEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        value: temperature,
        unit: "Celsius",
      });
    });
  }

  /**
   *  Enables pressure notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a pressure object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async pressureEnable(eventHandler, enable) {
    if (enable) {
      this.pressureEventListeners[0] = this._pressureNotifyHandler.bind(this);
      this.pressureEventListeners[1].push(eventHandler);
    } else {
      this.pressureEventListeners[1].splice(this.pressureEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.pressureCharacteristic, enable, this.pressureEventListeners[0]);
  }

  _pressureNotifyHandler(event) {
    const data = event.target.value;
    const littleEndian = true;
    const integer = data.getUint32(0, littleEndian);
    const decimal = data.getUint8(4);
    const pressure = integer + decimal / 100;
    this.pressureEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        value: pressure,
        unit: "hPa",
      });
    });
  }

  /**
   *  Enables humidity notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a humidity object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async humidityEnable(eventHandler, enable) {
    if (enable) {
      this.humidityEventListeners[0] = this._humidityNotifyHandler.bind(this);
      this.humidityEventListeners[1].push(eventHandler);
    } else {
      this.humidityEventListeners[1].splice(this.humidityEventListeners.indexOf([eventHandler]), 1);
    }
    return await this._notifyCharacteristic(this.humidityCharacteristic, enable, this.humidityEventListeners[0]);
  }

  _humidityNotifyHandler(event) {
    const data = event.target.value;
    const humidity = data.getUint8(0);
    this.humidityEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        value: humidity,
        unit: "%",
      });
    });
  }

  /**
   *  Enables gas notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a gas object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async gasEnable(eventHandler, enable) {
    if (enable) {
      this.gasEventListeners[0] = this._gasNotifyHandler.bind(this);
      this.gasEventListeners[1].push(eventHandler);
    } else {
      this.gasEventListeners[1].splice(this.gasEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.gasCharacteristic, enable, this.gasEventListeners[0]);
  }
  _gasNotifyHandler(event) {
    const data = event.target.value;
    const littleEndian = true;
    const eco2 = data.getUint16(0, littleEndian);
    const tvoc = data.getUint16(2, littleEndian);

    this.gasEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        eCO2: {
          value: eco2,
          unit: "ppm",
        },
        TVOC: {
          value: tvoc,
          unit: "ppb",
        },
      });
    });
  }

  /**
   *  Enables color sensor notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a color sensor object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async colorEnable(eventHandler, enable) {
    if (enable) {
      this.colorEventListeners[0] = this._colorNotifyHandler.bind(this);
      this.colorEventListeners[1].push(eventHandler);
    } else {
      this.colorEventListeners[1].splice(this.colorEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.colorCharacteristic, enable, this.colorEventListeners[0]);
  }

  _colorNotifyHandler(event) {
    const data = event.target.value;
    const littleEndian = true;
    const r = data.getUint16(0, littleEndian);
    const g = data.getUint16(2, littleEndian);
    const b = data.getUint16(4, littleEndian);
    const c = data.getUint16(6, littleEndian);
    const rRatio = r / (r + g + b);
    const gRatio = g / (r + g + b);
    const bRatio = b / (r + g + b);
    const clearAtBlack = 300;
    const clearAtWhite = 400;
    const clearDiff = clearAtWhite - clearAtBlack;
    let clearNormalized = (c - clearAtBlack) / clearDiff;

    if (clearNormalized < 0) {
      clearNormalized = 0;
    }

    let red = rRatio * 255.0 * 3 * clearNormalized;

    if (red > 255) {
      red = 255;
    }
    let green = gRatio * 255.0 * 3 * clearNormalized;

    if (green > 255) {
      green = 255;
    }
    let blue = bRatio * 255.0 * 3 * clearNormalized;

    if (blue > 255) {
      blue = 255;
    }

    this.colorEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        red: red.toFixed(0),
        green: green.toFixed(0),
        blue: blue.toFixed(0),
      });
    });
  }

  //  ******  //
  /*  User interface service  */

  /**
   *  Gets the current LED settings from the Thingy device. Returns an object with structure that depends on the settings.
   *
   *  @async
   *  @return {Promise<Object>} Returns a LED status object. The content and structure depends on the current mode.
   *
   */
  async getLedStatus() {
    try {
      const data = await this._readData(this.ledCharacteristic);
      const mode = data.getUint8(0);
      const littleEndian = true;
      let status;

      switch (mode) {
      case 0:
        status = {LEDstatus: {mode: mode}};
        break;
      case 1:
        status = {
          mode: mode,
          r: data.getUint8(1),
          g: data.getUint8(2),
          b: data.getUint8(3),
        };
        break;
      case 2:
        status = {
          mode: mode,
          color: data.getUint8(1),
          intensity: data.getUint8(2),
          delay: data.getUint16(3, littleEndian),
        };
        break;
      case 3:
        status = {
          mode: mode,
          color: data.getUint8(1),
          intensity: data.getUint8(2),
        };
        break;
      }
      return status;
    } catch (error) {
      return new Error("Error when getting Thingy LED status: " + error);
    }
  }

  _ledSet(dataArray) {
    return this._writeData(this.ledCharacteristic, dataArray);
  }

  /**
   *  Sets the LED in constant mode with the specified RGB color.
   *
   *  @async
   *  @param {Object} color - Color object with RGB values
   *  @param {number} color.red - The value for red color in an RGB color. Ranges from 0 to 255.
   *  @param {number} color.green - The value for green color in an RGB color. Ranges from 0 to 255.
   *  @param {number} color.blue - The value for blue color in an RGB color. Ranges from 0 to 255.
   *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
   *
   */
  async ledConstant(color) {
    if (color.red === undefined || color.green === undefined || color.blue === undefined) {
      return Promise.reject(new TypeError("The options object for must have the properties 'red', 'green' and 'blue'."));
    }
    if (
      color.red < 0 ||
      color.red > 255 ||
      color.green < 0 ||
      color.green > 255 ||
      color.blue < 0 ||
      color.blue > 255
    ) {
      return Promise.reject(new RangeError("The RGB values must be in the range 0 - 255"));
    }
    return await this._ledSet(new Uint8Array([1, color.red, color.green, color.blue]));
  }

  /**
   *  Sets the LED in "breathe" mode where the LED continuously pulses with the specified color, intensity and delay between pulses.
   *
   *  @async
   *  @param {Object} params - Options object for LED breathe mode
   *  @param {number|string} params.color - The color code or color name. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
   *  @param {number} params.intensity - Intensity of LED pulses. Range from 0 to 100 [%].
   *  @param {number} params.delay - Delay between pulses in milliseconds. Range from 50 ms to 10 000 ms.
   *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
   *
   */
  async ledBreathe(params) {
    const colors = ["red", "green", "yellow", "blue", "purple", "cyan", "white"];
    const colorCode = typeof params.color === "string" ? colors.indexOf(params.color) + 1 : params.color;

    if (params.color === undefined || params.intensity === undefined || params.delay === undefined) {
      return Promise.reject(
        new TypeError("The options object for must have the properties 'color', 'intensity' and 'intensity'.")
      );
    }
    if (colorCode < 1 || colorCode > 7) {
      return Promise.reject(new RangeError("The color code must be in the range 1 - 7"));
    }
    if (params.intensity < 0 || params.intensity > 100) {
      return Promise.reject(new RangeError("The intensity must be in the range 0 - 100%"));
    }
    if (params.delay < 50 || params.delay > 10000) {
      return Promise.reject(new RangeError("The delay must be in the range 50 ms - 10 000 ms"));
    }

    return await this._ledSet(new Uint8Array([2, colorCode, params.intensity, params.delay & 0xff, (params.delay >> 8) & 0xff]));
  }

  /**
   *  Sets the LED in one-shot mode. One-shot mode will result in one single pulse of the LED.
   *
   *  @async
   *  @param {Object} params - Option object for LED in one-shot mode
   *  @param {number} params.color - The color code. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
   *  @param {number} params.intensity - Intensity of LED pulses. Range from 0 to 100 [%].
   *  @return {Promise<Error>} Returns a resolved promise or an error in a rejected promise.
   *
   */
  async ledOneShot(params) {
    const colors = ["red", "green", "yellow", "blue", "purple", "cyan", "white"];
    const colorCode = typeof params.color === "string" ? colors.indexOf(params.color) + 1 : params.color;

    if (colorCode === undefined || params.intensity === undefined) {
      return Promise.reject(
        new TypeError("The options object for LED one-shot must have the properties 'color' and 'intensity.")
      );
    }
    if (colorCode < 1 || colorCode > 7) {
      return Promise.reject(new RangeError("The color code must be in the range 1 - 7"));
    }
    if (params.intensity < 1 || params.intensity > 100) {
      return Promise.reject(new RangeError("The intensity must be in the range 0 - 100"));
    }

    return await this._ledSet(new Uint8Array([3, colorCode, params.intensity]));
  }

  /**
   *  Enables button notifications from Thingy. The assigned event handler will be called when the button on the Thingy is pushed or released.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a button object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise with button state when resolved or a promise with an error on rejection.
   *
   */
  async buttonEnable(eventHandler, enable) {
    if (enable) {
      this.buttonEventListeners[0] = this._buttonNotifyHandler.bind(this);
      this.buttonEventListeners[1].push(eventHandler);
    } else {
      this.buttonEventListeners[1].splice(this.buttonEventListeners.indexOf([eventHandler]), 1);
    }
    return await this._notifyCharacteristic(this.buttonCharacteristic, enable, this.buttonEventListeners[0]);
  }

  _buttonNotifyHandler(event) {
    const data = event.target.value;
    const state = data.getUint8(0);
    this.buttonEventListeners[1].forEach((eventHandler) => {
      eventHandler(state);
    });
  }

  /**
   *  Gets the current external pin settings from the Thingy device. Returns an object with pin status information.
   *
   *  @async
   *  @return {Promise<Object|Error>} Returns an external pin status object.
   *
   */
  async externalPinsStatus() {
    try {
      const data = await this._readData(this.externalPinCharacteristic);
      const pinStatus = {
        pin1: data.getUint8(0),
        pin2: data.getUint8(1),
        pin3: data.getUint8(2),
        pin4: data.getUint8(3),
      };
      return pinStatus;
    } catch (error) {
      return new Error("Error when reading from external pin characteristic: " + error);
    }
  }

  /**
   *  Set an external pin to chosen state.
   *
   *  @async
   *  @param {number} pin - Determines which pin is set. Range 1 - 4.
   *  @param {number} value - Sets the value of the pin. 0 = OFF, 255 = ON.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setExternalPin(pin, value) {
    if (pin < 1 || pin > 4) {
      return Promise.reject(new Error("Pin number must be 1 - 4"));
    }
    if (!(value === 0 || value === 255)) {
      return Promise.reject(new Error("Pin status value must be 0 or 255"));
    }

    try {
      // Preserve values for those pins that are not being set
      const receivedData = await this._readData(this.externalPinCharacteristic);
      const dataArray = new Uint8Array(4);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[pin - 1] = value;

      return await this._writeData(this.externalPinCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting external pins: " + error);
    }
  }

  //  ******  //
  /*  Motion service  */
  /**
   *  Gets the current configuration of the Thingy motion module.
   *
   *  @async
   *  @return {Promise<Object|Error>} Returns a motion configuration object when promise resolves, or an error if rejected.
   *
   */
  async getMotionConfig() {
    try {
      const data = await this._readData(this.tmsConfigCharacteristic);
      const littleEndian = true;
      const stepCounterInterval = data.getUint16(0, littleEndian);
      const tempCompInterval = data.getUint16(2, littleEndian);
      const magnetCompInterval = data.getUint16(4, littleEndian);
      const motionProcessingFrequency = data.getUint16(6, littleEndian);
      const wakeOnMotion = data.getUint8(8);
      const config = {
        stepCountInterval: stepCounterInterval,
        tempCompInterval: tempCompInterval,
        magnetCompInterval: magnetCompInterval,
        motionProcessingFrequency: motionProcessingFrequency,
        wakeOnMotion: wakeOnMotion,
      };

      return config;
    } catch (error) {
      return new Error("Error when getting Thingy motion module configuration: " + error);
    }
  }

  /**
   *  Sets the step counter interval.
   *
   *  @async
   *  @param {number} interval - Step counter interval in milliseconds. Must be in the range 100 ms to 5 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setStepCounterInterval(interval) {
    try {
      if (interval < 100 || interval > 5000) {
        return Promise.reject(new Error("The interval has to be in the range 100 - 5000 ms."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.tmsConfigCharacteristic);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;

      return await this._writeData(this.tmsConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new step count interval: " + error);
    }
  }

  /**
   *  Sets the temperature compensation interval.
   *
   *  @async
   *  @param {Number} interval - Temperature compensation interval in milliseconds. Must be in the range 100 ms to 5 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setTemperatureCompInterval(interval) {
    try {
      if (interval < 100 || interval > 5000) {
        return Promise.reject(new Error("The interval has to be in the range 100 - 5000 ms."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.tmsConfigCharacteristic);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[2] = interval & 0xff;
      dataArray[3] = (interval >> 8) & 0xff;

      return await this._writeData(this.tmsConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new temperature compensation interval: " + error);
    }
  }

  /**
   *  Sets the magnetometer compensation interval.
   *
   *  @async
   *  @param {Number} interval - Magnetometer compensation interval in milliseconds. Must be in the range 100 ms to 1 000 ms.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setMagnetCompInterval(interval) {
    try {
      if (interval < 100 || interval > 1000) {
        return Promise.reject(new Error("The interval has to be in the range 100 - 1000 ms."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.tmsConfigCharacteristic);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = interval & 0xff;
      dataArray[5] = (interval >> 8) & 0xff;

      return await this._writeData(this.tmsConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new magnetometer compensation interval: " + error);
    }
  }

  /**
   *  Sets motion processing unit update frequency.
   *
   *  @async
   *  @param {Number} frequency - Motion processing frequency in Hz. The allowed range is 5 - 200 Hz.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setMotionProcessFrequency(frequency) {
    try {
      if (frequency < 100 || frequency > 200) {
        return Promise.reject(new Error("The interval has to be in the range 5 - 200 Hz."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.tmsConfigCharacteristic);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = frequency & 0xff;
      dataArray[7] = (frequency >> 8) & 0xff;

      return await this._writeData(this.tmsConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new motion porcessing unit update frequency: " + error);
    }
  }

  /**
   *  Sets wake-on-motion feature to enabled or disabled state.
   *
   *  @async
   *  @param {boolean} enable - Set to True to enable or False to disable wake-on-motion feature.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection.
   *
   */
  async setWakeOnMotion(enable) {
    try {
      if (typeof enable !== "boolean") {
        return Promise.reject(new Error("The argument must be true or false."));
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._readData(this.tmsConfigCharacteristic);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = enable ? 1 : 0;

      return await this._writeData(this.tmsConfigCharacteristic, dataArray);
    } catch (error) {
      return new Error("Error when setting new magnetometer compensation interval:" + error);
    }
  }

  /**
   *  Enables tap detection notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a tap detection object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async tapEnable(eventHandler, enable) {
    if (enable) {
      this.tapEventListeners[0] = this._tapNotifyHandler.bind(this);
      this.tapEventListeners[1].push(eventHandler);
    } else {
      this.tapEventListeners[1].splice(this.tapEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.tapCharacteristic, enable, this.tapEventListeners[0]);
  }

  _tapNotifyHandler(event) {
    const data = event.target.value;
    const direction = data.getUint8(0);
    const count = data.getUint8(1);
    this.tapEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        direction: direction,
        count: count,
      });
    });
  }

  /**
   *  Enables orientation detection notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a orientation detection object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async orientationEnable(eventHandler, enable) {
    if (enable) {
      this.orientationEventListeners[0] = this._orientationNotifyHandler.bind(this);
      this.orientationEventListeners[1].push(eventHandler);
    } else {
      this.orientationEventListeners[1].splice(this.orientationEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.orientationCharacteristic, enable, this.orientationEventListeners[0]);
  }

  _orientationNotifyHandler(event) {
    const data = event.target.value;
    const orientation = data.getUint8(0);
    this.orientationEventListeners[1].forEach((eventHandler) => {
      eventHandler(orientation);
    });
  }

  /**
   *  Enables quaternion notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a quaternion object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async quaternionEnable(eventHandler, enable) {
    if (enable) {
      this.quaternionEventListeners[0] = this._quaternionNotifyHandler.bind(this);
      this.quaternionEventListeners[1].push(eventHandler);
    } else {
      this.quaternionEventListeners[1].splice(this.quaternionEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.quaternionCharacteristic, enable, this.quaternionEventListeners[0]);
  }

  _quaternionNotifyHandler(event) {
    const data = event.target.value;

    // Divide by (1 << 30) according to sensor specification
    let w = data.getInt32(0, true) / (1 << 30);
    let x = data.getInt32(4, true) / (1 << 30);
    let y = data.getInt32(8, true) / (1 << 30);
    let z = data.getInt32(12, true) / (1 << 30);
    const magnitude = Math.sqrt(Math.pow(w, 2) + Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

    if (magnitude !== 0) {
      w /= magnitude;
      x /= magnitude;
      y /= magnitude;
      z /= magnitude;
    }

    this.quaternionEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        w: w,
        x: x,
        y: y,
        z: z,
      });
    });
  }

  /**
   *  Enables step counter notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a step counter object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async stepEnable(eventHandler, enable) {
    if (enable) {
      this.stepEventListeners[0] = this._stepNotifyHandler.bind(this);
      this.stepEventListeners[1].push(eventHandler);
    } else {
      this.stepEventListeners[1].splice(this.stepEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.stepCharacteristic, enable, this.stepEventListeners[0]);
  }

  _stepNotifyHandler(event) {
    const data = event.target.value;
    const littleEndian = true;
    const count = data.getUint32(0, littleEndian);
    const time = data.getUint32(4, littleEndian);
    this.stepEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        count: count,
        time: {
          value: time,
          unit: "ms",
        },
      });
    });
  }

  /**
   *  Enables raw motion data notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a raw motion data object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async motionRawEnable(eventHandler, enable) {
    if (enable) {
      this.motionRawEventListeners[0] = this._motionRawNotifyHandler.bind(this);
      this.motionRawEventListeners[1].push(eventHandler);
    } else {
      this.motionRawEventListeners[1].splice(this.motionRawEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.motionRawCharacteristic, enable, this.motionRawEventListeners[0]);
  }

  _motionRawNotifyHandler(event) {
    const data = event.target.value;

    // Divide by 2^6 = 64 to get accelerometer correct values
    const accX = data.getInt16(0, true) / 64;
    const accY = data.getInt16(2, true) / 64;
    const accZ = data.getInt16(4, true) / 64;

    // Divide by 2^11 = 2048 to get correct gyroscope values
    const gyroX = data.getInt16(6, true) / 2048;
    const gyroY = data.getInt16(8, true) / 2048;
    const gyroZ = data.getInt16(10, true) / 2048;

    // Divide by 2^12 = 4096 to get correct compass values
    const compassX = data.getInt16(12, true) / 4096;
    const compassY = data.getInt16(14, true) / 4096;
    const compassZ = data.getInt16(16, true) / 4096;

    this.motionRawEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        accelerometer: {
          x: accX,
          y: accY,
          z: accZ,
          unit: "G",
        },
        gyroscope: {
          x: gyroX,
          y: gyroY,
          z: gyroZ,
          unit: "deg/s",
        },
        compass: {
          x: compassX,
          y: compassY,
          z: compassZ,
          unit: "microTesla",
        },
      });
    });
  }

  /**
   *  Enables Euler angle data notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive an Euler angle data object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async eulerEnable(eventHandler, enable) {
    if (enable) {
      this.eulerEventListeners[0] = this._eulerNotifyHandler.bind(this);
      this.eulerEventListeners[1].push(eventHandler);
    } else {
      this.eulerEventListeners[1].splice(this.eulerEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.eulerCharacteristic, enable, this.eulerEventListeners[0]);
  }

  _eulerNotifyHandler(event) {
    const data = event.target.value;

    // Divide by two bytes (1<<16 or 2^16 or 65536) to get correct value
    const roll = data.getInt32(0, true) / 65536;
    const pitch = data.getInt32(4, true) / 65536;
    const yaw = data.getInt32(8, true) / 65536;

    this.eulerEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        roll: roll,
        pitch: pitch,
        yaw: yaw,
      });
    });
  }

  /**
   *  Enables rotation matrix notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @asunc
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive an rotation matrix object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async rotationMatrixEnable(eventHandler, enable) {
    if (enable) {
      this.rotationMatrixEventListeners[0] = this._rotationMatrixNotifyHandler.bind(this);
      this.rotationMatrixEventListeners[1].push(eventHandler);
    } else {
      this.rotationMatrixEventListeners[1].splice(this.rotationMatrixEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(
      this.rotationMatrixCharacteristic,
      enable,
      this.rotationMatrixEventListeners[0]
    );
  }

  _rotationMatrixNotifyHandler(event) {
    const data = event.target.value;

    // Divide by 2^2 = 4 to get correct values
    const r1c1 = data.getInt16(0, true) / 4;
    const r1c2 = data.getInt16(0, true) / 4;
    const r1c3 = data.getInt16(0, true) / 4;
    const r2c1 = data.getInt16(0, true) / 4;
    const r2c2 = data.getInt16(0, true) / 4;
    const r2c3 = data.getInt16(0, true) / 4;
    const r3c1 = data.getInt16(0, true) / 4;
    const r3c2 = data.getInt16(0, true) / 4;
    const r3c3 = data.getInt16(0, true) / 4;

    this.rotationMatrixEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        row1: [r1c1, r1c2, r1c3],
        row2: [r2c1, r2c2, r2c3],
        row3: [r3c1, r3c2, r3c3],
      });
    });
  }

  /**
   *  Enables heading notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a heading object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async headingEnable(eventHandler, enable) {
    if (enable) {
      this.headingEventListeners[0] = this._headingNotifyHandler.bind(this);
      this.headingEventListeners[1].push(eventHandler);
    } else {
      this.headingEventListeners[1].splice(this.headingEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.headingCharacteristic, enable, this.headingEventListeners[0]);
  }

  _headingNotifyHandler(event) {
    const data = event.target.value;

    // Divide by 2^16 = 65536 to get correct heading values
    const heading = data.getInt32(0, true) / 65536;

    this.headingEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        value: heading,
        unit: "degrees",
      });
    });
  }

  /**
   *  Enables gravity vector notifications from Thingy. The assigned event handler will be called when notifications are received.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on notification. Will receive a heading object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
   */
  async gravityVectorEnable(eventHandler, enable) {
    if (enable) {
      this.gravityVectorEventListeners[0] = this._gravityVectorNotifyHandler.bind(this);
      this.gravityVectorEventListeners[1].push(eventHandler);
    } else {
      this.gravityVectorEventListeners[1].splice(this.gravityVectorEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(
      this.gravityVectorCharacteristic,
      enable,
      this.gravityVectorEventListeners[0]
    );
  }

  _gravityVectorNotifyHandler(event) {
    const data = event.target.value;
    const x = data.getFloat32(0, true);
    const y = data.getFloat32(4, true);
    const z = data.getFloat32(8, true);

    this.gravityVectorEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        x: x,
        y: y,
        z: z,
      });
    });
  }

  //  ******  //

  /*  Sound service  */

  microphoneEnable(enable) {
    // Tables of constants needed for when we decode the adpcm-encoded audio from the Thingy
    if (this._MICROPHONE_INDEX_TABLE === undefined) {
      this._MICROPHONE_INDEX_TABLE = [-1, -1, -1, -1, 2, 4, 6, 8, -1, -1, -1, -1, 2, 4, 6, 8];
    }
    if (this._MICROPHONE_STEP_SIZE_TABLE === undefined) {
      this._MICROPHONE_STEP_SIZE_TABLE = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209,
        230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358,
        5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767];
    }
    if (enable) {
      this.microphoneEventListeners[0] = this._microphoneNotifyHandler.bind(this);
      // lager en ny audio context, skal bare ha én av denne
      if (this.audioCtx === undefined) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
    }
    return this._notifyCharacteristic(this.microphoneCharacteristic, enable, this.microphoneEventListeners[0]);
  }
  _microphoneNotifyHandler(event) {
    const audioPacket = event.target.value.buffer;
    const adpcm = {
      header: new DataView(audioPacket.slice(0, 3)),
      data: new DataView(audioPacket.slice(3)),
    };
    const decodedAudio = this._decodeAudio(adpcm);
    this._playDecodedAudio(decodedAudio);
  }
  /*  Sound service  */
  _decodeAudio(adpcm) {
    // Allocate output buffer
    const audioBufferDataLength = adpcm.data.byteLength;
    const audioBuffer = new ArrayBuffer(512);
    const pcm = new DataView(audioBuffer);
    let diff;
    let bufferStep = false;
    let inputBuffer = 0;
    let delta = 0;
    let sign = 0;
    let step;

    // The first 2 bytes of ADPCM frame are the predicted value
    let valuePredicted = adpcm.header.getInt16(0, false);
    // The 3rd byte is the index value
    let index = adpcm.header.getInt8(2);
    if (index < 0) {
      index = 0;
    }
    if (index > 88) {
      index = 88;
    }
    step = this._MICROPHONE_STEP_SIZE_TABLE[index];
    for (let _in = 0, _out = 0; _in < audioBufferDataLength; _out += 2) {
      /* Step 1 - get the delta value */
      if (bufferStep) {
        delta = inputBuffer & 0x0F;
        _in++;
      } else {
        inputBuffer = adpcm.data.getInt8(_in);
        delta = (inputBuffer >> 4) & 0x0F;
      }
      bufferStep = !bufferStep;
      /* Step 2 - Find new index value (for later) */
      index += this._MICROPHONE_INDEX_TABLE[delta];
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
      if ((delta & 4) > 0) {
        diff += step;
      }
      if ((delta & 2) > 0) {
        diff += (step >> 1);
      }
      if ((delta & 1) > 0) {
        diff += (step >> 2);
      }
      if (sign > 0) {
        valuePredicted -= diff;
      } else {
        valuePredicted += diff;
      }
      /* Step 5 - clamp output value */
      if (valuePredicted > 32767) {
        valuePredicted = 32767;
      } else if (valuePredicted < -32768) {
        valuePredicted = -32768;
      }
      /* Step 6 - Update step value */
      step = this._MICROPHONE_STEP_SIZE_TABLE[index];
      /* Step 7 - Output value */
      pcm.setInt16(_out, valuePredicted, true);
    }
    return pcm;
  }
  _playDecodedAudio(audio) {
    if (this._audioStack === undefined) {
      this._audioStack = [];
    }
    this._audioStack.push(audio);
    if (this._audioStack.length) {
      this._scheduleAudioBuffers();
    }
  }
  _scheduleAudioBuffers() {
    while (this._audioStack.length > 0) {
      const bufferTime = 0.01; // Buffer time in seconds before initial audio chunk is played
      const buffer = this._audioStack.shift();
      const channels = 1;
      const framecount = buffer.byteLength / 2;
      if (this._audioNextTime === undefined) {
        this._audioNextTime = 0;
      }
      const myArrayBuffer = this.audioCtx.createBuffer(channels, framecount, 16000);
      // This gives us the actual array that contains the data
      const nowBuffering = myArrayBuffer.getChannelData(0);
      for (let i = 0; i < buffer.byteLength / 2; i++) {
        nowBuffering[i] = buffer.getInt16(2 * i, true) / 32768.0;
      }
      const source = this.audioCtx.createBufferSource();
      source.buffer = myArrayBuffer;
      source.connect(this.audioCtx.destination);
      if (this._audioNextTime === 0) {
        this._audioNextTime = this.audioCtx.currentTime + bufferTime;
      }
      source.start(this._audioNextTime);
      this._audioNextTime += source.buffer.duration;
    }
  }
  //  ******  //

  /*  Battery service  */
  /**
   *  Gets the battery level of Thingy.
   *
   *  @return {Promise<Object | Error>} Returns battery level in percentage when promise is resolved or an error if rejected.
   *
   */
  async getBatteryLevel() {
    try {
      const receivedData = await this._readData(this.batteryCharacteristic);
      const level = receivedData.getUint8(0);

      return {
        value: level,
        unit: "%",
      };
    } catch (error) {
      return error;
    }
  }

  /**
   *  Enables battery level notifications.
   *
   *  @async
   *  @param {function} eventHandler - The callback function that is triggered on battery level change. Will receive a battery level object as argument.
   *  @param {boolean} enable - Enables notifications if true or disables them if set to false.
   *  @return {Promise<Error>} Returns a promise when resolved or a promise with an error on rejection
   *
     */
  async batteryLevelEnable(eventHandler, enable) {
    if (enable) {
      this.batteryLevelEventListeners[0] = this._batteryLevelNotifyHandler.bind(this);
      this.batteryLevelEventListeners[1].push(eventHandler);
    } else {
      this.batteryLevelEventListeners[1].splice(this.batteryLevelEventListeners.indexOf([eventHandler]), 1);
    }

    return await this._notifyCharacteristic(this.batteryCharacteristic, enable, this.batteryLevelEventListeners[0]);
  }

  _batteryLevelNotifyHandler(event) {
    const data = event.target.value;
    const value = data.getUint8(0);

    this.batteryLevelEventListeners[1].forEach((eventHandler) => {
      eventHandler({
        value: value,
        unit: "%",
      });
    });
  }
}

//  ******  //
