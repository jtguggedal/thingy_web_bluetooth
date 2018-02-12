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

class AdvertisingParametersService extends FeatureOperations {
  constructor(device) {
    super(device, "advertisingparameters");

    // gatt service and characteristic used to communicate with thingy's advertising parameters configuration
    this.service = {
      uuid: this.device.TCS_UUID,
    };

    this.characteristics = {
      default: {
        uuid: this.device.TCS_ADV_PARAMS_UUID,
        decoder: this.decodeAdvertisingParam.bind(this),
        encoder: this.encodeAdvertisingParam.bind(this),
      },
    };
  }

  decodeAdvertisingParam(data) {
    try {
      // Interval is given in units of 0.625 milliseconds
      const littleEndian = true;
      const interval = (data.getUint16(0, littleEndian) * 0.625).toFixed(0);
      const timeout = data.getUint8(2);
      const decodedAdvertisingParams = {
        interval: {
          interval: interval,
          unit: "ms",
        },
        timeout: {
          timeout: timeout,
          unit: "s",
        },
      };
      return decodedAdvertisingParams;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }

  encodeAdvertisingParam(params) {
    try {
      if (typeof params !== "object" || params.interval === undefined || params.timeout === undefined) {
        const e = new RangeError("The argument has to be an object with key/value pairs interval' and 'timeout': {interval: someInterval, timeout: someTimeout}");
        this.notifyError(e);
        throw e;
      }

      // Interval is in units of 0.625 ms.
      const interval = params.interval * 1.6;
      const timeout = params.timeout;

      // Check parameters
      if (interval < 32 || interval > 8000) {
        const e = new RangeError("The advertising interval must be within the range of 20 ms to 5 000 ms");
        this.notifyError(e);
        throw e;
      }
      if (timeout < 0 || timeout > 180) {
        const e = new RangeError("The advertising timeout must be within the range of 0 to 180 s");
        this.notifyError(e);
        throw e;
      }

      const dataArray = new Uint8Array(3);
      dataArray[0] = interval & 0xff;
      dataArray[1] = (interval >> 8) & 0xff;
      dataArray[2] = timeout;

      return dataArray;
    } catch (error) {
      const e = new Error(error);
      this.notifyError(e);
      throw e;
    }
  }
}

export default AdvertisingParametersService;
