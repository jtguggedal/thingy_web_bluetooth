# Nordic Thingy:52 for Web Bluetooth
**About Thingy:52**

The Nordic Thingy:52™ is a compact, power-optimized, multi-sensor development kit. It is an easy-to-use development platform, designed to help you build IoT prototypes and demos, without the need to build hardware or write firmware. Read more about it [here](https://www.nordicsemi.com/eng/Products/Nordic-Thingy-52).

**This repository**

This repository is an attempt to make it easier to start developing applications for Thingy:52 using Web Bluetooth. Web Bluetooth is a JavaScript API that makes it possible to communicate with Bluetooth Low Energy devices in web browsers. The implementation status for different browsers and platforms can be seen [here](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md). 

This is work in progress, and for now this repository will help you connect to a Thingy:52 and access all services and characteristics except for speaker, microphone, MTU (Maximum Transmission Unit), and DFU (Device Firmware Upgrade):

### Get started

- Clone or download this repository, or just copy `js/thingy.js` into your own project.
- If you've used this repository, you can open `index.html` in a supported browser and open the console (ctrl + shift + J or cmd + alt + J). 
- Turn on your Thingy:52. 
- Click the "Connect" button found in `index.html`.
- You can now choose your Thingy:52 and connect to it.
- In the console, you can see the browser connect to the device and discover its services. 
- When connected, the Thingy:52 will use the LED breathe feature and the LED will pulsate with RED light. 
- In the browser, it will also show the current temperature measured by the device in the HTML element below the connect button.

### Examples
The following example will first connect to a thingy:52 with the option logEnabled set to false, then subscribe to and log all incoming data from the temperature sensor. After that we will request the device's name, before setting it to "Thingy". In the end, we set a timeout for 10 secounds before we disconnect from the device.

```javascript

import Thingy from "./js/thingy.js";

const thingy = new Thingy({logEnabled: false});

function myLoggingFunction(data) {
    const temperatureData = data.detail;
    console.log(temperatureData);
}

async function start(device) {
    try {
        await device.connect();
        
        device.addEventListener("temperature", myLoggingFunction);
        await device.temperature.start();
        
        
        const deviceName = await device.name.get();
        console.log(deviceName);

        await device.name.set("Thingy");

        setTimeout(async () => {
        await device.disconnect();
        console.log("Disconnected from the device");
        }, 10000);
        
    } catch (error) {
        console.error(error);
    }
}

start(thingy);
```

The following example will first connect to a thingy:52, and then read the current LED configuration. In the end we will set the LED to breathe mode, with an intensity of 50% and a delay of 1 second.

```javascript

import Thingy from "./js/thingy.js";

const thingy = new Thingy();

async function start(device) {
    try {
        await device.connect();

        const currentLedConfiguration = await device.led.get();
        console.log(currentLedConfiguration);
        
        const newLedConfiguration = {
            mode: "breathe",
            color: "cyan",
            intensity: 50,
            delay: 1000,
        }
        
        await device.led.set(newLedConfiguration);  
    } catch (error) {
        console.error(error);
    }
}

start(thingy);
```

**Note**: the Web Bluetooth API requires that a function trying to connect to a BLE device is initiated by a user action such as a mouse click.

### API documentation
Thingy offers several features, all of which rely on established BLE protocols for sending and receiving data. The BLE operations are abstracted away through the following operations:

| Operation | Description |
| --------- | ----------- |
| start/stop | Subscribes to a feature and relays any incoming data from that feature as an event |
| get | Reads data from the specified feature on Thingy |
| set | Writes data to the specified feature on Thingy |

# Supported operations

| Feature | Start/Stop | Get | Set |
| :----: | :----: | :----: | :----: |
| Absolute orientation | Yes | No | No |
| Button | Yes | No | No |
| Cloud token | No | Yes | Yes |
| Color | Yes | No | No |
| Connection parameters | No | Yes | Yes |
| DFU (in development) | - | - | - |
| Eddystone url | No | Yes | Yes |
| Environment configuration | No | Yes | Yes |
| Euler orientation  | Yes | No | No |
| Firmware | No | Yes | No |
| Gas | Yes | No | No |
| Gravity vector | Yes | No | No |
| Heading | Yes | No | No |
| Humidity | Yes | No | No |
| LED | No | Yes | Yes |
| Microphone (in development) | - | - | - |
| Motion configuration | No | Yes | Yes |
| MTU (in development) | - | - | - |
| Name | No | Yes | Yes |
| Pressure | Yes | No | No |
| Quaternion orientation | Yes | No | No |
| Raw data | Yes | No | No |
| Rotation matrix orientation | Yes | No | No |
| Speaker (in development) | - | - | - |
| Step counter | Yes | No | No |
| Tap | Yes | No | No |
| Temperature | Yes | No | No |





Below you can find extended information on each feature Thingy supports, as well as information about the parameters required to interact with them.

-   [Thingy](#thingy)
    -   [Absolute orientation](#absolute-orientation)
    -   [Button](#button)
    -   [Cloud token](#cloudtoken)
    -   [Color](#color)
    -   [Connection parameters](#connection-parameters)
    -   [DFU](#dfu)
    -   [Eddystone url](#eddystone)
    -   [Environment configuration](#environment-configuration)
    -   [Euler orientation](#euler-orientation)
    -   [Firmware](#firmware)
    -   [Gas](#gas)
    -   [Gravity vector](#gravity-vector)
    -   [Heading](#heading)
    -   [Humidity](#humidity)
    -   [LED](#led)
    -   [Microphone](#microphone)
    -   [Motion configuration](#motion-configuration)
    -   [MTU](#mtu)
    -   [Name](#name)
    -   [Pressure](#pressure)
    -   [Quaternion orientation](#quaternion-orientation)
    -   [Raw data](#raw-data)
    -   [Rotation matrix orientation](#rotation-matrix-orientation)
    -   [Speaker](#speaker)
    -   [Step counter](#step-counter)
    -   [Tap](#tap)
    -   [Temperature](#temperature)


## Thingy

**Parameters**

-   `options`   (optional, default `{logEnabled:true}`)

### Absolute orientation
`thingy.absoluteorientation`

Allows interaction with the connected device's absolute orientation sensor

**Supported operations**

-   `start` - Starts sending absolute orientation data from the connected device
-   `stop`  - Terminates sending absolute orientation data from the connected device

### Button
`thingy.button`

Allows interaction with the connected device's button

**Supported operations**

-   `start` - Starts sending button data from the connected device
-   `stop`  - Terminates sending button data from the connected device

### Cloud token
`thingy.cloudtoken`

Allows interaction with the connected device's cloud token service

**Supported operations**

-   `get` - Gets the cloud token currently written to the connected device
-   `set` - Sets the cloud token of the connected device.
    - **Parameters**:
        - Cloud token - String shorter than or equal to 250 characters.

### Color
`thingy.color`

Allows interaction with the connected device's color sensor (not LED)

**Supported operations**

-   `start` - Starts sending color data from the connected device
-   `stop`  - Terminates sending color data from the connected device

### Connection parameters
`thingy.connectionparameters`

Allows interaction with the connected device's connection parameters

**Supported operations**

-   `get` - Gets the connected device's connection parameters
-   `set` - Sets the connection parameters of the connected device.
    - **Parameters**:
        - Object:
            - minInterval (Minimum connection interval, unit 1.25ms): Number in the interval 6 - 3200 (7.5ms - 4s)
            - maxInterval (Maximum connection interval (unit 1.25ms): Number in the interval 6 - 3200 (7.5ms - 4s)
            - slaveLatency (Slave latency - number of connection events): Number in the interval 0 - 499
            - supervisionTimeout (Supervision timeout, unit 10ms): Number in the interval 10 - 3200 (100ms - 32s)

### DFU
`thingy.dfu`

Allows interaction with the connected device's DFU service (Device Firmware Upgrade)

**Supported operations**

In development

### Eddystone Url
`thingy.eddystone`

Allows interaction with the connected device's eddystone url service

**Supported operations**

-   `get` - Gets the connected device's eddystone url
-   `set` - Sets the eddystone url of the connected device.
    - **Parameters**:
        - Eddystone url - String between 3 and 17 characters, according to **[this](https://github.com/google/eddystone/tree/master/eddystone-url)** format


### Euler orientation
`thingy.eulerorientation`

Allows interaction with the connected device's euler orientation sensor

**Supported operations**

-   `start` - Starts sending euler orientation data from the connected device
-   `stop`  - Terminates sending euler orientation data from the connected device

### Firmware
`thingy.firmware`

Allows interaction with the connected device's firmware service

**Supported operations**

-   `get` - Gets the current firmware version deployed on the device


### Gas
`thingy.gas`

Allows interaction with the connected device's gas sensor (co2 and tvoc)

**Supported operations**

-   `start` - Starts sending gas data from the connected device
-   `stop`  - Terminates sending gas data from the connected device

### Gravity vector
`thingy.gravityvector`

Allows interaction with the connected device's gravity vector sensor

**Supported operations**

-   `start` - Starts sending gravity vector data from the connected device
-   `stop`  - Terminates sending gravity vector data from the connected device

### Heading
`thingy.heading`

Allows interaction with the connected device's heading sensor

**Supported operations**

-   `start` - Starts sending heading data from the connected device
-   `stop`  - Terminates sending heading data from the connected device

### Humidity
`thingy.humidity`

Allows interaction with the connected device's humidity sensor

**Supported operations**

-   `start` - Starts sending humidity data from the connected device
-   `stop`  - Terminates sending humidity data from the connected device

### LED
`thingy.led`

Allows interaction with the connected device's LED

**Supported operations**

-   `get` - Gets the connected device's current LED configuration
-   `set` - Sets the LED configuration of the connected device
    - **Parameters**:
        - Object:
            - mode - Mode of the LED. Can be one of the following: constant, breathe, oneshot, off.
                - mode = constant:
                    - red - Number in the interval 0 - 255
                    - green - Number in the interval 0 - 255
                    - blue - Number in the interval 0 - 255
                - mode = breathe:
                    - color - Either a recognized color (red, green, yellow, blue, purple, cyan, white), or a number in the interval 1 - 7
                    - intensity - Number in the interval 0 - 100
                    - delay - Delay between each breathe (unit ms), number in the interval 50 - 10 000
                - mode = oneshot:
                    - color - Number in the interval 1 - 7
                    - intensity: Number in the interval 0 - 100

### Microphone
`thingy.microphone`

Allows interaction with the connected device's microphone

**Supported operations**

-   `start` - Starts sending microphone data from the connected device
-   `stop`  - Terminates sending microphone data from the connected device

### MTU
`thingy.mtu`

Allows interaction with the connected device's MTU service (Maximum Transmission Unit)

**Supported operations**

In development


### Name
`thingy.name`

Allows interaction with the connected device's name service

**Supported operations**

-   `get` - Gets the name of the connected device
-   `set` - Sets the name of the connected device.
    - **Parameters**:
        - Name - String shorter than or equal to 10 characters.

### Pressure
`thingy.pressure`

Allows interaction with the connected device's pressure sensor

**Supported operations**

-   `start` - Starts sending pressure data from the connected device
-   `stop`  - Terminates sending pressure data from the connected device

### Quaternion orientation
`thingy.quaternionorientation`

Allows interaction with the connected device's quaternion orientation sensor

**Supported operations**

-   `start` - Starts sending quaternion orientation data from the connected device
-   `stop`  - Terminates sending quaternion orientation data from the connected device

### Raw data
`thingy.rawdata`

Allows interaction with the connected device's raw data sensor (includes accelerometer, gyroscope, and compass)

**Supported operations**

-   `start` - Starts sending raw data from the connected device
-   `stop`  - Terminates sending raw data from the connected device

### Rotation matrix orientation
`thingy.rotationmatrixorientation`

Allows interaction with the connected device's rotation matrix orientation sensor

**Supported operations**

-   `start` - Starts sending rotation matrix orientation data from the connected device
-   `stop`  - Terminates sending rotation matrix orientation data from the connected device

### Speaker
`thingy.speaker`

Allows interaction with the connected device's speaker

**Supported operations**

In development


### Step counter
`thingy.stepcounter`

Allows interaction with the connected device's step counter sensor

**Supported operations**

-   `start` - Starts sending step counter data from the connected device
-   `stop`  - Terminates sending step counter data from the connected device

### Tap
`thingy.tap`

Allows interaction with the connected device's tap sensor

**Supported operations**

-   `start` - Starts sending tap data from the connected device
-   `stop`  - Terminates sending tap data from the connected device

### Temperature
`thingy.temperature`

Allows interaction with the connected device's temperature sensor

**Supported operations**

-   `start` - Starts sending temperature data from the connected device
-   `stop`  - Terminates sending temperature data from the connected device