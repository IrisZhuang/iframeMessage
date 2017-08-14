(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.message = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var supportPostMessage = 'postMessage' in window;
    /**
     * 构建消息体
     * @class Message
     */

    var Messager = function () {
        /**
         * Creates an instance of Messager.
         * @param {any} target 
         * @param {any} name 
         * @param {any} prefix 
         * @memberof Messager
         */
        function Messager(target, name, prefix) {
            _classCallCheck(this, Messager);

            this.target = target;
            this.name = name;
            this.prefix = prefix;
        }
        /**
         * 发送消息
         * 
         * @param {object | string } msg  消息题
         * @param {string} handlerId 接受器id
         * @memberof Messager
         */


        _createClass(Messager, [{
            key: 'send',
            value: function send(msg, handlerId) {
                var id = this.prefix + ':' + this.name;

                if (typeof msg === 'string') {
                    msg = {
                        id: '*',
                        body: msg
                    };
                }

                msg = id + '__Messenger__' + JSON.stringify(msg);

                if (supportPostMessage) {
                    this.target.postMessage(msg, handlerId || '*');
                } else {
                    var targetFunc = window.navigator[id];
                    if (typeof targetFunc == 'function') {
                        targetFunc(msg, window);
                    } else {
                        throw new Error("target callback function is not defined");
                    }
                }
            }
        }]);

        return Messager;
    }();

    var Connect = function () {
        /**
         * Creates an instance of Connect.
         * @param {string} name 构造期名字
         * @param {string} prefix 前缀
         * @param {array} whiteList 白名单
         * @memberof Connect
         */
        function Connect(name, prefix, whiteList) {
            var _this = this;

            _classCallCheck(this, Connect);

            this.prefix = prefix;
            this.targets = {};
            this._handlers = {};
            this.whiteList = whiteList || [];

            var _id = prefix + ':' + name;

            /**
             * 消息处理器
             * 
             * @param {any} event 
             * @returns 
             */
            var emitter = function emitter(event) {
                if (_this.whiteList.length && !~_this.whiteList.indexOf(event.origin)) return console.log('不在白名单');
                var data = event.data;

                var _data$split = data.split('__Messenger__'),
                    _data$split2 = _slicedToArray(_data$split, 2),
                    id = _data$split2[0],
                    msg = _data$split2[1];

                var _id$split = id.split(':'),
                    _id$split2 = _slicedToArray(_id$split, 2),
                    prefix = _id$split2[0],
                    name = _id$split2[1];

                var _msg = JSON.parse(msg);
                if (_id !== id) {
                    return console.log('校验失败！');
                }

                try {
                    _this._handlers[_msg.id](_msg.body);
                } catch (error) {
                    console.log(error);
                }
            };

            if (supportPostMessage) {
                if ('addEventListener' in document) {
                    window.addEventListener('message', emitter, false);
                } else if ('attachEvent' in document) {
                    window.attachEvent('onmessage', emitter);
                }
            } else {
                // 兼容IE 6/7
                window.navigator[_id] = emitter;
            }
        }

        /**
         * 发送消息到特定的target
         * 
         * @param {any} target 
         * @param {any} msg 
         * @memberof Connect
         */


        _createClass(Connect, [{
            key: 'send',
            value: function send(target, msg) {
                this.targets[target] && this.targets[target].send(msg);
            }
        }, {
            key: 'broadcast',
            value: function broadcast(msg) {
                var _this2 = this;

                Object.keys(this.targets).forEach(function (key) {
                    return _this2.targets[key].send(msg);
                });
            }
        }, {
            key: 'register',
            value: function register(name, target) {
                this.targets[name] = new Messager(target, name, this.prefix);
                return this;
            }
        }, {
            key: 'on',
            value: function on(key, func) {
                if (arguments.length < 2) {
                    key = '*';
                    func = arguments[0];
                }
                this._handlers[key] = func;
            }
        }]);

        return Connect;
    }();

    exports.default = function (name, prefix, whiteList) {
        return new Connect(name, prefix, whiteList);
    };
});