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

import FeatureOperations from "./FeatureOperations.js";

class MotionConfigurationService extends FeatureOperations {
  constructor(device) {
    super(device, "motionconfiguration");

    // gatt service and characteristic used to communicate with thingy's motion configuration characteristic
    this.service = {
      uuid: this.device.TMS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TMS_CONFIG_UUID,
        decoder: this.decodeConfigData.bind(this),
        encoder: this.encodeConfigData.bind(this),
      },
    };
  }

  decodeConfigData(data) {
    try {
      const littleEndian = true;
      const stepCounterInterval = data.getUint16(0, littleEndian);
      const temperatureCompensationInterval = data.getUint16(2, littleEndian);
      const magnetometerCompensationInterval = data.getUint16(4, littleEndian);
      const motionProcessingUnitFrequency = data.getUint16(6, littleEndian);
      const wakeOnMotion = data.getUint8(8);

      const formattedData = {
        stepCounterInterval: stepCounterInterval,
        temperatureCompensationInterval: temperatureCompensationInterval,
        magnetometerCompensationInterval: magnetometerCompensationInterval,
        motionProcessingUnitFrequency: motionProcessingUnitFrequency,
        wakeOnMotion: wakeOnMotion,
      };

      return formattedData;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeConfigData(data) {
    try {
      return data;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setStepCounterInterval(interval) {
    try {
      if (interval < 100 || interval > 5000) {
        const e = new RangeError("The step counter interval must be in the range 100 ms - 5000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setTempCompensationInterval(interval) {
    try {
      if (interval < 100 || interval > 5000) {
        const e = new RangeError("The temperature compensation interval must be in the range 100 ms - 5000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[2] = interval & 0xff;
      dataArray[3] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setMagnetCompInterval(interval) {
    try {
      if (interval < 100 || interval > 1000) {
        const e = new RangeError("The magnetometer compensation interval must be in the range 100 ms - 1000 ms");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[4] = interval & 0xff;
      dataArray[5] = (interval >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setMotionProcessFrequency(frequency) {
    try {
      if (frequency < 5 || frequency > 200) {
        const e = new RangeError("The motion processing unit frequency must be in the range 5 hz - 200 hz");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[6] = frequency & 0xff;
      dataArray[7] = (frequency >> 8) & 0xff;

      await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async setWakeOnMotion(enable) {
    try {
      if (typeof enable !== "boolean") {
        const e = new RangeError("The argument must be true or false.");
        this.notifyError(e);
        throw e;
      }

      // Preserve values for those settings that are not being changed
      const receivedData = await this._read("default", true);
      const dataArray = new Uint8Array(9);

      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = receivedData.getUint8(i);
      }

      dataArray[8] = enable ? 1 : 0;

      return await this._write(dataArray, "default");
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default MotionConfigurationService;
