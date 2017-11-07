# Nordic Thingy:52 Web Bluetooth API
**About Thingy:52**

The Nordic Thingy:52™ is a compact, power-optimized, multi-sensor development kit. It is an easy-to-use development platform, designed to help you build IoT prototypes and demos, without the need to build hardware or write firmware. Read more about it [here](https://www.nordicsemi.com/eng/Products/Nordic-Thingy-52).

**This repository**

This repository is an attempt to make it easier to start developing applications for Thingy:52 using Web Bluetooth. Web Bluetooth is a JavaScript API that makes it possible to communicate with Bluetooth Low Energy devices in web browsers. The implementation status for different browsers and platforms can be seen [here](https://github.com/WebBluetoothCG/web-bluetooth/blob/gh-pages/implementation-status.md). Just like the Web Bluetooth API, the methods in the Thingy object return promises.

This is work in progress, and for now this repository will help you connect to a Thingy:52 and access the following data:

- Configuration
    - Name
- Environment
    - Configuration of sensors
    - Temperature
    - Pressure
    - Humidity
    - Gas sensor
    - Color sensor

- User interface
    - RGB LED
    - Button
    - External pins

- Motion
    - Configuration
    - Tap sensing
    - Step counter
    - Orientation
    - Quaternions
    - Euler angles
    - Rotation matrix
    - Heading
    - Gravity vector
    - Raw data
    
- Battery status

### Get started

- Clone or download this repository, or just copy `js/thingy.js` into your own project.
- If you've used this repository, you can open `index.html` in a supported browser and open the console (ctrl + shift + J or cmd + alt + J). 
- Turn on your Thingy:52. 
- Create a new Thingy object and use the [`connect`](#connect) method to establish a BLE connection. 
- You can now use the methods described in the documentation below to access sensor data.
- Note that Web Bluetooth requires connection requests to originate from a user action such as a click. From the console you can however call `connect()` directly.

### Example
The following example will first connect to a thingy:52, then read its name and configure the RGB LED to "breathe"  purple (color code 5, see [here](#ledsetbreathe)) pulses with 20% intensity and with 1500 ms delays between each pulse. 

```
var thingy = new Thingy();
thingy.connect()
.then( () => {
    thingy.nameGet()
    .then( name => {
        console.log("This Thingy:52 is called " + name)
    })
    .then( () => { 
        thingy.ledSetBreathe(5, 20, 1500); 
    })
})
.catch( error => {
    console.log(error);
})
```


### API documentation

-   [Thingy](#thingy)
    -   [batteryLevelEnable](#batterylevelenable)
    -   [batteryLevelGet](#batterylevelget)
    -   [buttonEnable](#buttonenable)
    -   [colorEnable](#colorenable)
    -   [colorIntervalSet](#colorintervalset)
    -   [colorSensorSet](#colorsensorset)
    -   [connect](#connect)
    -   [disconnect](#disconnect)
    -   [environmentConfigGet](#environmentconfigget)
    -   [eulerEnable](#eulerenable)
    -   [externalPinSet](#externalpinset)
    -   [externalPinsGet](#externalpinsget)
    -   [gasEnable](#gasenable)
    -   [gasModeSet](#gasmodeset)
    -   [gravityVectorEnable](#gravityvectorenable)
    -   [headingEnable](#headingenable)
    -   [humidityEnable](#humidityenable)
    -   [humidityIntervalSet](#humidityintervalset)
    -   [ledGetStatus](#ledgetstatus)
    -   [ledSetBreathe](#ledsetbreathe)
    -   [ledSetConstant](#ledsetconstant)
    -   [ledSetOneShot](#ledsetoneshot)
    -   [magnetCompIntervalSet](#magnetcompintervalset)
    -   [motionConfigGet](#motionconfigget)
    -   [motionConfigGet](#motionconfigget-1)
    -   [motionProcessingFrequencySet](#motionprocessingfrequencyset)
    -   [motionRawEnable](#motionrawenable)
    -   [nameGet](#nameget)
    -   [nameGet](#nameget-1)
    -   [nameSet](#nameset)
    -   [orientationEnable](#orientationenable)
    -   [pressureEnable](#pressureenable)
    -   [pressureIntervalSet](#pressureintervalset)
    -   [quaternionEnable](#quaternionenable)
    -   [readData](#readdata)
    -   [rotationMatrixEnable](#rotationmatrixenable)
    -   [stepCounterIntervalSet](#stepcounterintervalset)
    -   [stepEnable](#stepenable)
    -   [tapEnable](#tapenable)
    -   [temperatureCompIntervalSet](#temperaturecompintervalset)
    -   [temperatureEnable](#temperatureenable)
    -   [temperatureIntervalSet](#temperatureintervalset)
    -   [wakeOnMotionSet](#wakeonmotionset)
    -   [writeData](#writedata)

## Thingy

Thingy:52 Web Bluetooth API. <br> 
 BLE service details [here](https://nordicsemiconductor.github.io/Nordic-Thingy52-FW/documentation/firmware_architecture.html#fw_arch_ble_services)

**Parameters**

-   `logEnabled` **bool** Enables logging of all BLE actions. (optional, default `true`)

### batteryLevelEnable

Enables battery level notifications.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on battery level change. Will receive a battery level object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### batteryLevelGet

Gets the battery level of Thingy.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Returns battery level in percentage when promise is resolved or an error if rejected.

### buttonEnable

Enables button notifications from Thingy. The assigned event handler will be called when the button on the Thingy is pushed or released.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a button object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### colorEnable

Enables color sensor notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a color sensor object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### colorIntervalSet

Sets the color sensor update interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Step counter interval in milliseconds. Must be in the range 200 ms to 60 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### colorSensorSet

Sets color sensor LED calibration parameters.

**Parameters**

-   `red` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The red intensity, ranging from 0 to 255.
-   `green` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The green intensity, ranging from 0 to 255.
-   `blue` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The blue intensity, ranging from 0 to 255.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### connect

Connects to Thingy.
 The function stores all discovered services and characteristics to the Thingy object.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns an empty promise when resolved or a promise with error on rejection

### disconnect

Method to disconnect from Thingy.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns an empty promise when resolved or a promise with error on rejection.

### environmentConfigGet

Gets the current configuration of the Thingy environment module.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Returns an environment configuration object when promise resolves, or an error if rejected.

### eulerEnable

Enables Euler angle data notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive an Euler angle data object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### externalPinSet

Set an external pin to chosen state.

**Parameters**

-   `pin`  Determines which pin is set. Range 1 - 4.
-   `value`  Sets the value of the pin. 0 = OFF, 255 = ON.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### externalPinsGet

Gets the current external pin settings from the Thingy device. Returns an object with pin status information.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Returns an external pin status object.

### gasEnable

Enables gas notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a gas object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### gasModeSet

Sets the gas mode.

**Parameters**

-   `mode` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** 1 = 1 s update interval, 2 = 10 s update interval, 3 = 60 s update interval.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### gravityVectorEnable

Enables gravity vector notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a heading object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### headingEnable

Enables heading notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a heading object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### humidityEnable

Enables humidity notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a humidity object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### humidityIntervalSet

Sets the humidity measurement update interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Step counter interval in milliseconds. Must be in the range 100 ms to 60 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### ledGetStatus

Gets the current LED settings from the Thingy device. Returns an object with structure that depends on the settings.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** Returns a LED status object. The content and structure depends on the current mode.

### ledSetBreathe

Sets the LED in "breathe" mode where the LED pulses with the specified color, intensity and delay between pulses.

**Parameters**

-   `color`  The color code. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
-   `intensity`  Intensity of LED pulses. Range from 0 to 100 [%].
-   `delay`  Delay between pulses in milliseconds. Range from 50 ms to 10 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a resolved promise or an error in a rejected promise.

### ledSetConstant

Sets the LED in constant mode with the specified RGB color.

**Parameters**

-   `red`  The value for red color in an RGB color. Ranges from 0 to 255.
-   `green`  The value for green color in an RGB color. Ranges from 0 to 255.
-   `blue`  The value for blue color in an RGB color. Ranges from 0 to 255.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a resolved promise or an error in a rejected promise.

### ledSetOneShot

Sets the LED in one-shot mode

**Parameters**

-   `color`  The color code. 1 = red, 2 = green, 3 = yellow, 4 = blue, 5 = purple, 6 = cyan, 7 = white.
-   `intensity`  Intensity of LED pulses. Range from 0 to 100 [%].

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a resolved promise or an error in a rejected promise.

### magnetCompIntervalSet

Sets the magnetometer compensation interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Magnetometer compensation interval in milliseconds. Must be in the range 100 ms to 1 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### motionConfigGet

Motion service

### motionConfigGet

Gets the current configuration of the Thingy motion module.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Returns a motion configuration object when promise resolves, or an error if rejected.

### motionProcessingFrequencySet

Sets motion processing unit update frequency.

**Parameters**

-   `frequency` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Motion processing frequency in Hz. The allowed range is 5 - 200 Hz.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### motionRawEnable

Enables raw motion data notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a raw motion data object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### nameGet

Gets the name of the Thingy device.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** Returns a string with the name when resolved or a promise with error on rejection.

### nameGet

Configuration service

### nameSet

Sets the name of the Thingy device.

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name that will be given to the Thingy.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** Returns a string with the name when resolved or a promise with error on rejection.

### orientationEnable

Enables orientation detection notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a orientation detection object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### pressureEnable

Enables pressure notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a pressure object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### pressureIntervalSet

Sets the pressure measurement update interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Step counter interval in milliseconds. Must be in the range 50 ms to 60 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### quaternionEnable

Enables quaternion notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a quaternion object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### readData

Method to read data from a Web Bluetooth characteristic. 
 Implements a simple solution to avoid starting new GATT requests while another is pending.
 Any attempt to read while another GATT operation is in progress, will result in a rejected promise.

**Parameters**

-   `characteristic` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Web Bluetooth characteristic object

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;([Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) \| [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error))>** Returns Uint8Array when resolved or an error when rejected

### rotationMatrixEnable

Enables rotation matrix notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive an rotation matrix object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### stepCounterIntervalSet

Sets the step counter interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Step counter interval in milliseconds. Must be in the range 100 ms to 5 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### stepEnable

Enables step counter notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a step counter object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### tapEnable

Enables tap detection notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **callback** The callback function that is triggered on notification. Will receive a tap detection object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### temperatureCompIntervalSet

Sets the temperature compensation interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Temperature compensation interval in milliseconds. Must be in the range 100 ms to 5 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### temperatureEnable

Enables temperature notifications from Thingy. The assigned event handler will be called when notifications are received.

**Parameters**

-   `eventHandler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The callback function that is triggered on notification. Will receive a temperature object as argument.
-   `enable` **bool** Enables notifications if true or disables them if set to false.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection

### temperatureIntervalSet

Sets the temperature measurement update interval.

**Parameters**

-   `interval` **[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** Step counter interval in milliseconds. Must be in the range 100 ms to 60 000 ms.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### wakeOnMotionSet

Sets wake-on-motion feature to enabled or disabled state.

**Parameters**

-   `enable` **bool** Set to True to enable or False to disable wake-on-motion feature.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>** Returns a promise when resolved or a promise with an error on rejection.

### writeData

Method to write data to a Web Bluetooth characteristic.
 Implements a simple solution to avoid starting new GATT requests while another is pending.
 Any attempt to send data during another GATT operation will result in a rejected promise.
 No retransmission is implemented at this level.

**Parameters**

-   `characteristic` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Web Bluetooth characteristic object
-   `dataArray` **[Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)** Typed array of bytes to send

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 
