enum PROMISE_STATUS {
    PENDING = 'PENDING',
    FULFILLED = 'FULFILLED',
    REJECTED = 'REJECTED',
}

// 回调
type executorFn = (resolve: resolveFn, reject: rejectFn) => void;
type resolveFn = (data: any) => void;
type rejectFn = (reason: any) => void;

// 把任务加入微队列
function _runMicroTask(callback: Function) {
    if (process && process.nextTick) {
        process.nextTick(callback);
    } else {
        setTimeout(callback, 0);
    }
}

/**
 * 判断是否满足promise A+ 规范
 * @param obj 
 */
function _isPromise(obj: any) {
    return !!(obj && typeof obj === 'object' && typeof obj.then === 'function');
}

interface IHandleStack {
    callback: resolveFn | rejectFn | undefined;
    status: PROMISE_STATUS;
    resolve: resolveFn;
    reject: rejectFn;
}

// Promise A+ 规范
class MyPromise {
    // 状态
    _status: PROMISE_STATUS = PROMISE_STATUS.PENDING;
    // 值
    _value: any = undefined;
    // then执行栈
    _handlerStack: IHandleStack[] = [];
    constructor(executor: executorFn) {
        try {
            executor(this._resolve.bind(this), this._reject.bind(this));
        } catch (error) {
            this._reject(error);
        }
    }

    /**
     * 统一的状态更改
     * @param { PROMISE_STATUS } newStatus 新状态 
     * @param { any } newValue 新值
     */
    _changeStatus(newStatus: PROMISE_STATUS, newValue: any) {
        if (this._status !== PROMISE_STATUS.PENDING) return ;
        this._status = newStatus;
        this._value = newValue;
        this._runHandlerStack();
    }

    /**
     * 执行栈函数
     */
    _runHandlerStack() {
        if (this._status === PROMISE_STATUS.PENDING) return ;
        while(this._handlerStack[0]) {
            const handler = this._handlerStack[0];
            this._runOneHandleStack(handler);
            this._handlerStack.shift();
        }
    }

    /**
     * 执行单个函数
     * @param { Function } handler 
     */
    _runOneHandleStack({ callback, status, resolve, reject }: IHandleStack) {
        _runMicroTask(() => {
            if (this._status !== status) return ;
            if (typeof callback !== 'function') {
                this._status === PROMISE_STATUS.FULFILLED ? resolve(this._value) : reject(this._value);
                return ;
            }

           try {
                const result = callback(this._value);
                if (_isPromise(resolve)) {
                    (result as any).then(resolve, reject);
                } else {
                    resolve(result);
                }
           } catch (error) {
                reject(error);
           }

        })
    }

    /**
     * @param { Function } callback 回调函数
     * @param { PROMISE_STATUS } status 状态
     * @param { Function } resolve
     * @param { Function } reject 
     */
    _handlerStackPush(callback: resolveFn | rejectFn | undefined, status: PROMISE_STATUS, resolve: resolveFn, reject: rejectFn){
        this._handlerStack.push({
            callback,
            status,
            resolve,
            reject,
        })
    }

    /**
     * 成功回调
     * @param {any} data 成功数据 
     */
    _resolve(data: any) {
        this._changeStatus(PROMISE_STATUS.FULFILLED, data);
    }

    /**
     * 失败回调
     * @param {any} reason 失败原因
     */
    _reject(reason: any) {
       this._changeStatus(PROMISE_STATUS.REJECTED, reason);
    }


    /**
     * Promise A+ 规范 then 方法
     * @param { resolveFn } onFulfiller 成功的回调
     * @param { rejectFn } onReject 失败的回调
     */
    then(onFulfiller?: resolveFn, onReject?: rejectFn | undefined) {
        return new MyPromise((resolve, reject) => {
            this._handlerStackPush(onFulfiller, PROMISE_STATUS.FULFILLED, resolve, reject);
            this._handlerStackPush(onReject, PROMISE_STATUS.REJECTED, resolve, reject);
            this._runHandlerStack();
        })
    }

    
    /**
     * catch
     * @param onSettle 
     */
    catch(onSettle: rejectFn){
        return this.then(undefined, onSettle);
    }

    /**
     * 不管失败还是成功都需要执行
     * @param onSettle 
     */
    finally(onSettle: Function) {
        return this.then((data) => {
            onSettle();
            return data;
        }, (reason) => {
            onSettle();
            throw reason;
        })
    }


    /**
     * 1. data 为一个Promise对象， 直接返回
     * 2. data 为一个Promise Like对象， 包装一层再反悔
     * 3. 为其他 同上
     * @param data 
     */
    static resolve(data: any) {
        if (data instanceof MyPromise) {
            return data;
        }
        return new MyPromise((resolve, reject) => {
            if (_isPromise(data)) {
                data.then(resolve, reject);
            } else {
                resolve(data);
            }
        })
    }

    /**
     * reject
     */
    static reject(reason: any) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        })
    }

    /**
     * all 
     * @param proms 
     */
    static all(proms: any[]) {
        return new MyPromise((resolve, reject) => {
            try {
                const result: any[] = [];
                let count = 0;
                let finishCount = 0;
                for (const prom of proms) {
                    console.log('xx');
                    let index = count;
                    count ++;
                    MyPromise.resolve(prom).then((data: any) => {
                        finishCount++;
                        result[index] = data;
                        console.log(data, 'data');
                        if (finishCount === count) {
                            resolve(result);
                        }
                    })
                }

                if (count === 0) {
                    resolve(result);
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}

const pro1 = new MyPromise((resolve) => resolve(1));
const pro2 = new MyPromise((resolve) => {
    setTimeout(() => {
        resolve(2)
    }, 500)
});
const pro3 = new MyPromise((resolve) => resolve(3));


const p = MyPromise.all([pro1, pro2, pro3, 4]).then(data => console.log(data));


// const p = new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(1);
//     })
// })

// p.then(function A1() {});
// setTimeout(() => {
//     p.then(function A2() {});
// })