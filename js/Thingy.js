// @ts-check

import EventTarget from "./EventTarget.js";
import Microphone from "./Microphone.js";
import MTU from "./MTU.js";
import Name from "./Name.js";
import Temperature from "./Temperature.js";
import Pressure from "./Pressure.js";
import LED from "./LED.js";


class Thingy extends EventTarget {
  constructor(options = {logEnabled: true}) {
    super();
    console.log("I am alive!");

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

    if (!window.busyGatt) {
      window.busyGatt = false;
    }

    this.receiveReading = this.receiveReading.bind(this);
    this.logData = this.logData.bind(this);

    this.addEventListener("characteristicvaluechanged", this.receiveReading);

    this.mic = new Microphone(this);
    this.mtu = new MTU(this);
    this.name = new Name(this);
    this.temperature = new Temperature(this);
    this.pressure = new Pressure(this);
    this.led = new LED(this);
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
      this.server = await this.device.gatt.connect();

      if (this.logEnabled) {
        console.log(`Connected to "${this.device.name}"`);
      }
    } catch (error) {
      const e = new Error(error);
      throw e;
    }
  }

  receiveReading(reading) {
    const source = reading.detail.sensor;
    const data = reading.detail.data;

    const ce = new CustomEvent(`${source}Notification`, {detail: data})
    this.dispatchEvent(ce);
  }

  logData(data) {
    if (data.detail) {
      console.log("\n");
      for (const d in data.detail) {
        console.log(`${d}: ${data.detail[d]}`);
      }
    }
  }

  async disconnect() {
    try {
      await this.device.gatt.disconnect();
    } catch (error) {
      const e = new Error(error);
      throw e;
    }
  }
}

export default Thingy;
