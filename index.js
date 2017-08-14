const supportPostMessage = 'postMessage' in window;
/**
 * 构建消息体
 * @class Message
 */
class Messager{
    /**
     * Creates an instance of Messager.
     * @param {any} target 
     * @param {any} name 
     * @param {any} prefix 
     * @memberof Messager
     */
    constructor(target,name,prefix){
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
    send(msg , handlerId){
        const id = this.prefix + ':' + this.name;

        if(typeof msg === 'string'){
            msg = {
                id:'*',
                body:msg
            }
        }

        msg = `${id}__Messenger__${JSON.stringify(msg)}`;
        
        if ( supportPostMessage ){
            this.target.postMessage(msg, handlerId || '*');
        } else {
            let targetFunc = window.navigator[id];
            if ( typeof targetFunc == 'function' ) {
                targetFunc(msg, window);
            } else {
                throw new Error("target callback function is not defined");
            }
        }
    }
}


/**
 * 链接构造器
 * @class Connect
 */
class Connect{
    /**
     * Creates an instance of Connect.
     * @param {string} name 构造期名字
     * @param {string} prefix 前缀
     * @param {array} whiteList 白名单
     * @memberof Connect
     */
    constructor(name , prefix , whiteList){
        this.prefix = prefix;
        this.targets = {};
        this._handlers = {};
        this.whiteList = whiteList || [];

        let _id = `${prefix}:${name}`;

        /**
         * 消息处理器
         * 
         * @param {any} event 
         * @returns 
         */
        const emitter = (event) => {
            if (this.whiteList.length && !~this.whiteList.indexOf(event.origin)) return console.log('不在白名单');
            let {data} = event;
            let [ id , msg] = data.split('__Messenger__');
            let [prefix,name] = id.split(':');
            let _msg = JSON.parse(msg);
            if(_id !== id){
                return console.log('校验失败！')
            }
            
            try {
                this._handlers[_msg.id](_msg.body);
            } catch (error) {
                console.log(error);
            }   
        }

        if ( supportPostMessage ){
            if ( 'addEventListener' in document ) {
                window.addEventListener('message', emitter, false);
            } else if ( 'attachEvent' in document ) {
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
    send(target, msg){
        this.targets[target] && this.targets[target].send(msg);
    }

    /**
     * 📢广播消息
     * 
     * @param {any} msg 
     * @memberof Connect
     */
    broadcast(msg){
        Object.keys(this.targets).forEach(key=>this.targets[key].send(msg));
    }
    /**
     * 注册消息接收器
     * 
     * @param {any} name 
     * @param {any} target 
     * @returns 
     * @memberof Connect
     */
    register(name , target ){
        this.targets[name] = new Messager(target , name , this.prefix);
        return this;
    } 
    /**
     * 监听消息
     * 
     * @param {any} key 
     * @param {any} func 
     * @memberof Connect
     */
    on(key , func){
        if(arguments.length<2){
            key = '*';
            func = arguments[0];
        }
        this._handlers[key] = func;
    }
}

export default (name , prefix , whiteList) => {
    return new Connect(name , prefix , whiteList);
};