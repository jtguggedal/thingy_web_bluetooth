/*
  Copyright (c) 2010 - 2017, Nordic Semiconductor ASA
  All rights reserved.
  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:
  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form, except as embedded into a Nordic
     Semiconductor ASA integrated circuit in a product or a software update for
     such product, must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other
     materials provided with the distribution.
  3. Neither the name of Nordic Semiconductor ASA nor the names of its
     contributors may be used to endorse or promote products derived from this
     software without specific prior written permission.
  4. This software, with or without modification, must only be used with a
     Nordic Semiconductor ASA integrated circuit.
  5. Any software provided in binary form under this license must not be reverse
     engineered, decompiled, modified and/or disassembled.
  THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS
  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
  OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
  OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// @ts-check

import EventTarget from "./EventTarget.js";

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
      const e = new Error(`Could not read the ${this.type} feature at this moment, as Thingy only allows one concurrent BLE operation`);
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
      const e = new Error(`Could not write to  ${this.type} feature, Thingy only allows one concurrent BLE operation`);
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

      const ce = new CustomEvent("characteristicvaluechanged", {detail: {feature: this.type, data: decodedData}});

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
          console.log(`\nNotifications enabled for the ${ch} characteristic of the ${this.type} feature`);
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
          console.log(`\nNotifications disabled for the ${ch} characteristic of the ${this.type} feature`);
        } catch (error) {
          window.busyGatt = false;
          const e = new Error(error);
          this.notifyError(e);
          throw e;
        }
      }
    } else {
      const e = Error(`Could not write to  ${this.type} feature, Thingy only allows one concurrent BLE operation`);
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
