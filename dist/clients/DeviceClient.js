(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'format', '../util/util.js', './BaseClient.js'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('format'), require('../util/util.js'), require('./BaseClient.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.format, global.util, global.BaseClient);
    global.DeviceClient = mod.exports;
  }
})(this, function (exports, module, _format, _utilUtilJs, _BaseClientJs) {
  /**
   *****************************************************************************
   Copyright (c) 2014, 2015 IBM Corporation and other Contributors.
   All rights reserved. This program and the accompanying materials
   are made available under the terms of the Eclipse Public License v1.0
   which accompanies this distribution, and is available at
   http://www.eclipse.org/legal/epl-v10.html
   Contributors:
   Tim-Daniel Jacobi - Initial Contribution
   *****************************************************************************
   *
   */
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _format2 = _interopRequireDefault(_format);

  var _BaseClient2 = _interopRequireDefault(_BaseClientJs);

  var WILDCARD_TOPIC = 'iot-2/cmd/+/fmt/+';
  var CMD_RE = /^iot-2\/cmd\/(.+)\/fmt\/(.+)$/;
  var QUICKSTART_ORG_ID = "quickstart";

  var DeviceClient = (function (_BaseClient) {
    _inherits(DeviceClient, _BaseClient);

    function DeviceClient(config) {
      _classCallCheck(this, DeviceClient);

      _get(Object.getPrototypeOf(DeviceClient.prototype), 'constructor', this).call(this, config);

      if (!(0, _utilUtilJs.isDefined)(config.type)) {
        throw new Error('config must contain type');
      } else if (!(0, _utilUtilJs.isString)(config.type)) {
        throw new Error('type must be a string');
      }

      if (config.org !== QUICKSTART_ORG_ID) {
        if (!(0, _utilUtilJs.isDefined)(config['auth-method'])) {
          throw new Error('config must contain auth-method');
        } else if (!(0, _utilUtilJs.isString)(config['auth-method'])) {
          throw new Error('auth-method must be a string');
        } else if (config['auth-method'] !== 'token') {
          throw new Error('unsupported authentication method' + config['auth-method']);
        }

        this.mqttConfig.username = 'use-token-auth';
      }

      this.mqttConfig.clientId = "d:" + config.org + ":" + config.type + ":" + config.id;

      console.info("IBMIoTF.DeviceClient initialized for organization : " + config.org);
    }

    _createClass(DeviceClient, [{
      key: 'connect',
      value: function connect() {
        var _this = this;

        _get(Object.getPrototypeOf(DeviceClient.prototype), 'connect', this).call(this);

        var mqtt = this.mqtt;

        this.mqtt.on('connect', function () {
          _this.isConnected = true;

          if (_this.retryCount === 0) {
            _this.emit('connect');
          }

          if (!_this.isQuickstart) {
            mqtt.subscribe(WILDCARD_TOPIC, { qos: 2 }, function () {});
          }
        });

        this.mqtt.on('message', function (topic, payload) {

          console.info("Message received on ", topic, payload);

          var match = CMD_RE.exec(topic);
          _this.emit('command', {
            command: match[1],
            format: match[2],
            payload: payload,
            topic: topic
          });
        });
      }
    }, {
      key: 'publish',
      value: function publish(eventType, eventFormat, payload, qos) {
        if (!this.isConnected) {
          console.error("Client is not connected");
          throw new Error("Client is not connected");
        }

        var topic = (0, _format2['default'])("iot-2/evt/%s/fmt/%s", eventType, eventFormat);
        var QOS = qos || 0;

        console.info("Publishing to topic : " + topic + " with payload : " + payload);

        this.mqtt.publish(topic, payload, { qos: QOS });

        return this;
      }
    }]);

    return DeviceClient;
  })(_BaseClient2['default']);

  module.exports = DeviceClient;
});