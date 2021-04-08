import { Transform } from 'readable-stream';
import * as duplexify from 'duplexify';

/* global wx */
let socketTask;
let proxy;
let stream;

function buildProxy() {
  let proxy = new Transform();
  proxy._write = function (chunk, encoding, next) {
    socketTask.send({
      data: chunk, // .buffer,
      success: function () {
        next();
      },
      fail: function (errMsg) {
        next(new Error(errMsg));
      }
    });
  };
  proxy._flush = function socketEnd(done) {
    socketTask.close({
      success: function () {
        done();
      }
    });
  };

  return proxy;
}

function setDefaultOpts(opts) {
  if (!opts.hostname) {
    opts.hostname = 'localhost';
  }
  if (!opts.path) {
    opts.path = '/';
  }

  if (!opts.wsOptions) {
    opts.wsOptions = {};
  }
}

function buildUrl(opts, client) {
  let protocol = opts.protocol === 'wxs' ? 'wss' : 'ws';
  let url = protocol + '://' + opts.hostname + opts.path;
  if (opts.port && opts.port !== 80 && opts.port !== 443) {
    url = protocol + '://' + opts.hostname + ':' + opts.port + opts.path;
  }
  if (typeof opts.transformWsUrl === 'function') {
    url = opts.transformWsUrl(url, opts, client);
  }
  return url;
}

function bindEventHandler() {
  socketTask.onOpen(() => {
    stream.setReadable(proxy);
    stream.setWritable(proxy);
    stream.emit('connect');
  });

  socketTask.onMessage((res) => {
    let data = res.data;

    // data = data instanceof ArrayBuffer ? Buffer.from(data) : Buffer.from(data, 'utf8');

    // data._isBuffer = true;
    // data = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
    data = new Uint8Array(data);

    proxy.push(data);
  });

  socketTask.onClose(() => {
    stream.end();
    stream.destroy();
  });

  socketTask.onError((res) => {
    stream.destroy(new Error(res.errMsg));
  });
}

function buildStream(client, opts) {
  opts.hostname = opts.hostname || opts.host;

  if (!opts.hostname) {
    throw new Error('Could not determine host. Specify host manually.');
  }

  let websocketSubProtocol = opts.protocolId === 'MQIsdp' && opts.protocolVersion === 3 ? 'mqttv3.1' : 'mqtt';

  setDefaultOpts(opts);

  let url = buildUrl(opts, client);
  socketTask = wx.connectSocket({ url, protocols: [websocketSubProtocol] });

  proxy = buildProxy();
  stream = duplexify.obj();

  stream._destroy = function _destroy(err, cb) {
    socketTask.close({
      success() {
        cb && cb(err);
      }
    });
  };

  let destroyRef = stream.destroy;
  stream.destroy = function destroy() {
    stream.destroy = destroyRef;

    setTimeout(() => {
      socketTask.close({
        fail() {
          stream._destroy(new Error(), () => {});
        }
      });
    }, 0);
  }.bind(stream);

  bindEventHandler();

  return stream;
}

export { buildStream };
