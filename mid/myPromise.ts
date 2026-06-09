type executorType = (resolve: (value: unknown) => void, reject: (reason: unknown) => void) => any;
type onFulfilledType = ((value: unknown) => void) | null;
type onRejectedType = ((error: unknown) => void) | null;

enum STATUS_ENUM {
    PADDING,
    RESOLVE,
    REJECT,
}

class MyPromise {
    status = STATUS_ENUM.PADDING;
    value: unknown;
    error: unknown;
    onFulfilled: onFulfilledType = null;;
    onRejected: onRejectedType = null;
    onFulfilledCallbacks: onFulfilledType [] = [];
    onRejectedCallbacks: onFulfilledType [] = [];
    
    constructor(executor: executorType) {
        // this.status = STATUS_ENUM.PADDING;
        executor(this.resolve.bind(this), this.reject.bind(this));
    }

    resolve(value: unknown) {
        if (this.status !== STATUS_ENUM.PADDING) return ;
        setTimeout(() => {
            this.status = STATUS_ENUM.RESOLVE;
            this.value = value;
            // this.onFulfilled!(this.value);
            this.onFulfilledCallbacks.forEach(cb => this.value = cb && cb(this.value));
        })
    }

    reject(reason: unknown) {
        if (this.status !== STATUS_ENUM.PADDING) return ;
        setTimeout(() => {
            this.status = STATUS_ENUM.REJECT;
            this.error = reason;
            // this.onRejected!(this.error);
            this.onRejectedCallbacks.forEach(cb => this.error = cb && cb(this.error));
        })
    }

    then(onFulfilled?: onFulfilledType, onRejected?: onRejectedType){
        if (this.status === STATUS_ENUM.PADDING) {
            onFulfilled && this.onFulfilledCallbacks.push(onFulfilled);
            onRejected && this.onRejectedCallbacks.push(onRejected);
        }else if (this.status === STATUS_ENUM.RESOLVE) {
            onFulfilled && onFulfilled(this.value);
        }else if (this.status === STATUS_ENUM.REJECT) {
            onRejected && onRejected(this.error)
        }
        return this;
    }
}


const pmRun = (keyword: string) => {
    return new MyPromise((resolve, reject) => {
        if (keyword === 'test') {
            resolve(keyword);
        }else {
            reject('error xb');
        }
    })
}


// const promise = new MyPromise()
// new MyPromise((resolve, reject) => {
//     console.log(1);
//     const a = 10;
//     if (a % 2 == 0) resolve(a);
//     else reject(a / 2);
// }).then(res => {
//     console.log(`a: ${res}`);
//     return 'test';
// }).then(res => console.log(`a2: ${res}`));

pmRun('test').then(res => {
    console.log(res, 'khs');
    return pmRun('test');
}).then(res => {
    console.log('wfl');
})