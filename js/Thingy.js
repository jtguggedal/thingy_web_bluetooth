import EventTarget from "./EventTarget.js";
import MicrophoneSensor from "./MicrophoneSensor.js";
import MTUService from "./MTUService.js";
import NameService from "./NameService.js";
import TemperatureSensor from "./TemperatureSensor.js";
import PressureSensor from "./PressureSensor.js";
import LEDService from "./LEDService.js";
import TapSensor from "./TapSensor.js";
import AbsoluteOrientationSensor from "./AbsoluteOrientationSensor.js";
import QuaternionOrientationSensor from "./QuaternionOrientationSensor.js";
import ButtonSensor from "./ButtonSensor.js";
import CloudTokenService from "./CloudTokenService.js";
import ColorSensor from "./ColorSensor.js";
import ConnectionParametersService from "./ConnectionParametersService.js";
import FirmwareService from "./FirmwareService.js";
import GasSensor from "./GasSensor.js";
import GravityVectorSensor from "./GravityVectorSensor.js";
import HumiditySensor from "./HumiditySensor.js";
import StepCounterSensor from "./StepCounterSensor.js";
import RawDataSensor from "./RawDataSensor.js";
import EulerOrientationSensor from "./EulerOrientationSensor.js";
import RotationMatrixOrientationSensor from "./RotationMatrixOrientationSensor.js";
import HeadingSensor from "./HeadingSensor.js";
import EddystoneUrlService from "./EddystoneUrlService.js";
import EnvironmentConfigurationService from "./EnvironmentConfigurationService.js";


class Thingy extends EventTarget {
  constructor(options = {logEnabled: true}) {
    super();

    if (this.logEnabled) {
      console.log("I am alive!");
    }

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

    this.microphone = new MicrophoneSensor(this);
    this.mtu = new MTUService(this);
    this.name = new NameService(this);
    this.temperature = new TemperatureSensor(this);
    this.pressure = new PressureSensor(this);
    this.led = new LEDService(this);
    this.tap = new TapSensor(this);
    this.orientation = new AbsoluteOrientationSensor(this);
    this.quaternion = new QuaternionOrientationSensor(this);
    this.button = new ButtonSensor(this);
    this.cloudtoken = new CloudTokenService(this);
    this.color = new ColorSensor(this);
    this.connectionparameters = new ConnectionParametersService(this);
    this.eddystone = new EddystoneUrlService(this);
    this.firmware = new FirmwareService(this);
    this.gas = new GasSensor(this);
    this.gravityvector = new GravityVectorSensor(this);
    this.humidity = new HumiditySensor(this);
    this.step = new StepCounterSensor(this);
    this.rawdata = new RawDataSensor(this);
    this.euler = new EulerOrientationSensor(this);
    this.rotation = new RotationMatrixOrientationSensor(this);
    this.heading = new HeadingSensor(this);
    this.environmentconfiguration = new EnvironmentConfigurationService(this);
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
    const sourceFeature = reading.detail.feature;
    const data = reading.detail.data;

    const featureSpecificEvent = new CustomEvent(`${sourceFeature}`, {detail: data});

    this.dispatchEvent(featureSpecificEvent);
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
