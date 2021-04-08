import './lib/wx-debug';

import { connect, MqttClient, Store } from './lib';
// export { connect, MqttClient, Store };

const mqtt = { connect, MqttClient, Store };
export default mqtt;
