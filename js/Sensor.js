import EventTarget from "./EventTarget.js";

// @ts-check

class Sensor extends EventTarget {
  constructor(device, type) {
    super();
    this.device = device;
    this.type = type || this.constructor.name;
  }

  async connect() {
    try {
      this.service.service = await this.device.server.getPrimaryService(this.service.uuid);

      for (const ch in this.characteristics) {
        if (Object.prototype.hasOwnProperty.call(this.characteristics, ch)) {
          this.characteristics[ch].characteristic = await this.service.service.getCharacteristic(this.characteristics[ch].uuid);
          if (this.constructor.name !== "CustomSensor") {
            this.characteristics[ch].properties = this.characteristics[ch].characteristic.properties;
          }
          console.log(this.characteristics[ch].properties);
        }
      }

      console.log(`Connected to the ${this.type} sensor`);
      return Promise.resolve();
    } catch (error) {
      this.notifyError(error);
      return Promise.reject(error);
    }
  }

  notifyError(error) {
    console.log(`The ${this.type} sensor has reported an error: ${error}`);
  }

  async _read(ch = "default") {
    if (!this.hasProperty("read", ch)) {
      const e = Error("This characteristic does not have the necessary read property");
      this.notifyError(e);

      return false;
    }

    if (!this.characteristics[ch].decoder) {
      const e = Error("The characteristic you're trying to write does not have a specified decoder");
      this.notifyError(e);
      return false;
    }

    if (!window.busyGatt) {
      try {
        window.busyGatt = true;
        const dataArray = await this.characteristics[ch].characteristic.readValue();
        window.busyGatt = false;
        return this.characteristics[ch].decoder(dataArray);
      } catch (error) {
        this.notifyError(error);
        return;
      }
    } else {
      window.busyGatt = false;
      const e = Error(`Could not read  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
    }
  }

  async _write(dataArray, ch = "default") {
    if (!this.hasProperty("write", ch)) {
      const e = Error("This characteristic does not have the necessary write property");
      this.notifyError(e);

      return false;
    }

    if (!this.characteristics[ch].encoder) {
      const e = Error("The characteristic you're trying to write does not have a specified encoder");
      this.notifyError(e);
      return false;
    }

    if (!window.busyGatt) {
      try {
        window.busyGatt = true;
        await this.characteristics[ch].characteristic.writeValue(this.characteristics[ch].encoder(dataArray));
        window.busyGatt = false;
        return;
      } catch (error) {
        this.notifyError(error);
        return;
      }
    } else {
      window.busyGatt = false;
      const e = Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
    }
  }

  async _notify(enable, ch = "default") {
    if (!this.hasProperty("notify", ch)) {
      const e = Error("This characteristic does not have the necessary notify property");
      this.notifyError(e);

      return false;
    }

    const onReading = (e) => {
      const d = this.unpackEventData(e);
      const fd = this.characteristics[ch].decoder(d);

      const ce = new CustomEvent("characteristicvaluechanged", {detail: {sensor: this.type, data: fd}});

      this.device.dispatchEvent(ce);
    };

    if (!this.characteristics[ch].decoder) {
      const e = Error("The characteristic you're trying to notify does not have a specified decoder");
      this.notifyError(e);
      return false;
    }

    const characteristic = this.characteristics[ch].characteristic;

    if (!window.busyGatt) {
      if (enable) {
        try {
          window.busyGatt = true;
          await characteristic.startNotifications()
            .then((char) => {
              char.addEventListener("characteristicvaluechanged", onReading);
            }).bind(this);
          window.busyGatt = false;
          console.log(`Notifications enabled for the ${ch} characteristic of the ${this.type} sensor`);
        } catch (error) {
          window.busyGatt = false;
          return error;
        }
      } else {
        try {
          window.busyGatt = true;
          await characteristic.stopNotifications()
            .then((char) => {
              char.addEventListener("characteristicvaluechanged", (e) => {
                this.addEventListener("characteristicvaluechanged", );
              }).bind(this);
            });
          window.busyGatt = false;
          console.log("Notifications disabled for ", characteristic.uuid);
        } catch (error) {
          return error;
        }
      }
    } else {
      const e = Error(`Could not write to  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
      this.notifyError(e);
    }
  }

  getProperties(ch = "default") {
    return this.characteristics[ch].properties;
  }

  hasProperty(property, ch = "default") {
    return (this.characteristics[ch].properties[property] === true ? true : false);
  }

  unpackEventData(event) {
    let data;

    if (event.hasOwnProperty("target") && event.target.hasOwnProperty("value")) {
      data = event.target.value;
    } else {
      data = event;
    }

    return data;
  }
  /*
  async get(ch = 'default') {
    try {
      // have to do this here as well as in ._read in case people want to read properties that aren't readable
      if (!this.hasProperty('read', ch)) {) {
        const e = Error("This characteristic does not have the necessary read property");
        this.notifyError(e);

        return false;
      }

      const g = await this._read(ch);
      return g;
    } catch (error) {
      // error it
    }
  }

  async set(value, ch = 'default') {
    try {
      // have to do this here as well as in ._write in case people want to read properties that aren't readable
      if (!this.hasProperty('write', ch)) {
        const e = Error("This characteristic does not have the necessary read property");
        this.notifyError(e);

        return false;
      }

      if (!this.characteristics[ch].encoder) {
        const e = Error("The characteristic you're trying to set does not have a specified setter");
        this.notifyError(e);
        return false;
      }

      const encodedValue = this.characteristics[ch].encoder(value);

      if (encodedValue === false) {
        return false;
      }

      const result = await this._write(encodedValue);

      if (result === false) {
        return false;
      }
    } catch (error) {
      // error it
    }
  }*/
}

export default Sensor;
