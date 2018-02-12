import EventTarget from "./EventTarget.js";

// @ts-check

class FeatureOperations extends EventTarget {
  constructor(device, type) {
    super();
    this.device = device;
    this.type = type || this.constructor.name;
  }

  async connect() {
    if (!window.busyGatt) {
      try {
        window.busyGatt = true;
        this.service.service = await this.device.server.getPrimaryService(this.service.uuid);

        for (const ch in this.characteristics) {
          if (Object.prototype.hasOwnProperty.call(this.characteristics, ch)) {
            this.characteristics[ch].characteristic = await this.service.service.getCharacteristic(this.characteristics[ch].uuid);
            if (this.constructor.name !== "CustomSensor") {
              this.characteristics[ch].properties = this.characteristics[ch].characteristic.properties;
            }
          }
        }

        window.busyGatt = false;
        console.log(`Connected to the ${this.type} feature`);
      } catch (error) {
        window.busyGatt = false;
        const e = new Error(error);
        this.notifyError(e);
        throw e;
      }
    } else {
      const e = new Error(`Could not connect to the ${this.type} feature at this moment, as Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
      throw e;
    }
  }

  notifyError(error) {
    console.log(`The ${this.type} feature has reported an error: ${error}`);
  }

  notifyWarning(warning) {
    console.log(`The ${this.type} feature has reported a warning: ${warning}`);
  }

  async _read(ch = "default", returnRaw = false) {
    if (!this.characteristics[ch].characteristic) {
      await this.connect();
    }

    if (!this.hasProperty("read", ch)) {
      const e = new Error("This characteristic does not have the necessary read property");
      this.notifyError(e);
      throw e;
    }

    if (!this.characteristics[ch].decoder) {
      const e = new Error("The characteristic you're trying to write does not have a specified decoder");
      this.notifyError(e);
      throw e;
    }

    if (!window.busyGatt) {
      try {
        window.busyGatt = true;
        if (returnRaw === true) {
          const rawProp = await this.characteristics[ch].characteristic.readValue();
          window.busyGatt = false;
          return Promise.resolve(rawProp);
        } else {
          const prop = await this.characteristics[ch].characteristic.readValue();
          window.busyGatt = false;
          return Promise.resolve(this.characteristics[ch].decoder(prop));
        }
      } catch (error) {
        window.busyGatt = false;
        const e = new Error(error);
        this.notifyError(e);
        throw e;
      }
    } else {
      const e = new Error(`Could not read the ${this.type} sensor at this moment, as Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
      throw e;
    }
  }

  async _write(prop, ch = "default") {
    if (prop === undefined) {
      const e = new Error("You have to write a non-empty body");
      this.notifyError(e);
      throw e;
    }

    if (!this.characteristics[ch].characteristic) {
      await this.connect();
    }

    if (!this.hasProperty("write", ch)) {
      const e = new Error("This characteristic does not have the necessary write property");
      this.notifyError(e);
      throw e;
    }

    if (!this.characteristics[ch].encoder) {
      const e = new Error("The characteristic you're trying to write does not have a specified encoder");
      this.notifyError(e);
      throw e;
    }

    if (!window.busyGatt) {
      try {
        const encodedValue = await this.characteristics[ch].encoder(prop);
        window.busyGatt = true;
        await this.characteristics[ch].characteristic.writeValue(encodedValue);
        window.busyGatt = false;
        return;
      } catch (error) {
        const e = new Error(error);
        this.notifyError(e);
        throw e;
      }
    } else {
      window.busyGatt = false;
      const e = new Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
      throw e;
    }
  }

  async _notify(enable, ch = "default") {
    if (!(enable === true || enable === false)) {
      const e = new Error("You have to specify the enable parameter (true/false)");
      this.notifyError(e);
      throw e;
    }

    if (!this.hasProperty("notify", ch)) {
      const e = new Error("This characteristic does not have the necessary notify property");
      this.notifyError(e);
      throw e;
    }

    const onReading = (e) => {
      const eventData = e.target.value;
      const decodedData = this.characteristics[ch].decoder(eventData);

      const ce = new CustomEvent("characteristicvaluechanged", {detail: {sensor: this.type, data: decodedData}});

      this.device.dispatchEvent(ce);
    };

    if (!this.characteristics[ch].decoder) {
      const e = new Error("The characteristic you're trying to notify does not have a specified decoder");
      this.notifyError(e);
      throw e;
    }

    const characteristic = this.characteristics[ch].characteristic;

    if (!window.busyGatt) {
      if (enable) {
        try {
          window.busyGatt = true;
          const csn = await characteristic.startNotifications();
          csn.addEventListener("characteristicvaluechanged", onReading.bind(this));
          window.busyGatt = false;
          console.log(`\nNotifications enabled for the ${ch} characteristic of the ${this.type} sensor`);
        } catch (error) {
          window.busyGatt = false;
          const e = new Error(error);
          this.notifyError(e);
          throw e;
        }
      } else {
        try {
          window.busyGatt = true;
          const csn = await characteristic.stopNotifications();
          csn.removeEventListener("characteristicvaluechanged", onReading.bind(this));
          window.busyGatt = false;
          console.log(`\nNotifications disabled for the ${ch} characteristic of the ${this.type} sensor`);
        } catch (error) {
          window.busyGatt = false;
          const e = new Error(error);
          this.notifyError(e);
          throw e;
        }
      }
    } else {
      const e = Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
      throw e;
    }
  }

  hasProperty(property, ch = "default") {
    return (this.characteristics[ch].properties[property] === true ? true : false);
  }

  async start(ch = "default") {
    try {
      if (!this.characteristics[ch].characteristic) {
        await this.connect();
      }

      if (this.hasProperty("notify", ch)) {
        await this._notify(true, ch);
      } else {
        this.notifyWarning("This characteristic does not support the notify operation");
      }
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async stop(ch = "default") {
    try {
      if (this.characteristics[ch].characteristic) {
        if (this.hasProperty("notify", ch)) {
          await this._notify(false, ch);
        }
      } else {
        this.notifyWarning("This xxxx has not been initiated yet");
      }
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async get(ch = "default") {
    try {
      if (!this.characteristics[ch].characteristic) {
        await this.connect();
      }

      if (this.hasProperty("read", ch)) {
        const d = await this._read(ch);
        return d;
      }
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async set(data, ch = "default") {
    try {
      if (!this.characteristics[ch].characteristic) {
        await this.connect();
      }

      if (this.hasProperty("write", ch)) {
        await this._write(data, ch);
      }
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default FeatureOperations;
