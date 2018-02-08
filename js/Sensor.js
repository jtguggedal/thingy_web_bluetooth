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
        }
      }

      console.log(`Connected to the ${this.type} sensor`);
      return Promise.resolve();
    } catch (error) {
			const e = new Error(error);
      this.notifyError(e);
			throw e;
    }
  }

  notifyError(error) {
		console.log(`The ${this.type} sensor has reported an error: ${error}`);

  }

  async _read(ch = "default") {
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
        const dataArray = await this.characteristics[ch].characteristic.readValue();
        window.busyGatt = false;
        return Promise.resolve(this.characteristics[ch].decoder(dataArray));
      } catch (error) {
				const e = new Error(error);
			  this.notifyError(e);
        throw e;
      }
    } else {
      window.busyGatt = false;
      const e = new Error(`Could not read  ${this.type} sensor, Thingy only allows one concurrent BLE operation`);
			this.notifyError(e);
      throw e;
    }
  }

  async _write(dataArray, ch = "default") {
    if (dataArray === undefined) {
      const e = new Error("You have to write a non-empty body");
			this.notifyError(e);
      throw e;
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
        window.busyGatt = true;
        await this.characteristics[ch].characteristic.writeValue(this.characteristics[ch].encoder(dataArray));
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
      const unpackedData = this.characteristics[ch].decoder(eventData);

      const ce = new CustomEvent("characteristicvaluechanged", {detail: {sensor: this.type, data: unpackedData}});

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
          const csn = await characteristic.startNotifications()
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
          const csn = await characteristic.stopNotifications()
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
    }
  }

  hasProperty(property, ch = "default") {
    return (this.characteristics[ch].properties[property] === true ? true : false);
  }
}

export default Sensor;
