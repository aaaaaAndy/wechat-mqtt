与官方mqtt包用法大致相同：
[https://github.com/mqttjs/MQTT.js#readme](https://github.com/mqttjs/MQTT.js#readme)

你可以这样：
```javascript
import mqtt from 'wechat-mqtt';

var client  = mqtt.connect('wxs://mqtt.demo.com')

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
```
也可以这样：
```javascript
import { connect } from 'wechat-mqtt';

var client  = connect('wxs://mqtt.demo.com')

client.on('connect', function () {
  client.subscribe('presence', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})
```