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

class ConnectionParametersService extends FeatureOperations {
  constructor(device) {
    super(device, "connectionparameters");

    // gatt service and characteristic used to communicate with Thingy's connection parameters configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_CONN_PARAMS_UUID,
        decoder: this.decodeConnectionParam.bind(this),
        encoder: this.encodeConnectionParam.bind(this),
      },
    };
  }

  decodeConnectionParam(data) {
    try {
      // Connection intervals are given in units of 1.25 ms
      const littleEndian = true;
      const minConnInterval = data.getUint16(0, littleEndian) * 1.25;
      const maxConnInterval = data.getUint16(2, littleEndian) * 1.25;
      const slaveLatency = data.getUint16(4, littleEndian);

      // Supervision timeout is given i units of 10 ms
      const supervisionTimeout = data.getUint16(6, littleEndian) * 10;
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
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  async encodeConnectionParam(params) {
    try {
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

      const receivedData = await this._read("default", true);
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

      return dataArray;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default ConnectionParametersService;
