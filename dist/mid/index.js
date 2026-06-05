"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flat(arr) {
    // const str = JSON.stringify(arr);
    // flat
    // return  arr.flat(Infinity);
    // replace + split
    // return str.replace(/(\[|\])/g, '').split(',');
    // replace + JSON.parse
    // const s = str.replace(/(\[|\])/g, '');
    // return JSON.parse(`[${s}]`);
    // 递归
    return arr.reduce((prev, curr) => {
        if (Array.isArray(curr)) {
            prev.push(...flat(curr));
        }
        else {
            prev.push(curr);
        }
        return prev;
    }, []);
}
let ary = [1, [2, [3, [4, 5]]], 6]; // -> [1, 2, 3, 4, 5, 6]
console.log(flat(ary));
// map 实现
function myMap(arr, callback, that) {
    if (arr === null || arr === undefined || !Array.isArray(arr)) {
        throw new TypeError("Cannot read property 'map' of not Array or null or undefined!");
    }
    if (typeof callback !== 'function') {
        throw new TypeError(`${callback} is not a function`);
    }
    const O = Object(arr);
    // 保证 len 为数字且为整数
    const len = O.length >>> 0;
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
        if (i in O) {
            const keyValue = O[i];
            const value = callback(keyValue, i, O);
            result[i] = value;
        }
    }
    return result;
}
// ary.map((item, index) => 
const mapArr = [1, 2, 3, 4, 5, 6, 7];
const r = myMap(mapArr, (item, index) => item + index);
// console.log(r);
// reduce 实现
function myReduce(arr, callback, initVal) {
    if (arr === null || arr === undefined || !Array.isArray(arr)) {
        throw new TypeError("Cannot read property 'reduce' of not Array or null or undefined!");
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
        throw new TypeError(`${callback} is not a function`);
    }
    const O = Object(arr);
    const len = O.length >>> 0;
    let value = initVal;
    let i = 0;
    if (value === undefined) {
        for (; i < len; i++) {
            if (i in O) {
                value = O[i];
                i++;
                break;
            }
        }
    }
    if (i === len && value === undefined) {
        throw new Error('Each element of the array is empty');
    }
    for (; i < len; i++) {
        if (i in O) {
            value = callback(value, O[i]);
        }
    }
    return value;
}
// mapArr.reduce((prev, cur) => cur + prev, 0);
const my = myReduce(mapArr, (prev, cur) => cur + prev, 0);
console.log(my);
function myPush(arr, ...items) {
    const O = Object(arr);
    const len = arr.length >>> 0;
    const argsLen = items.length >>> 0;
    if (len + argsLen > 2 ** 53 - 1) {
        throw new TypeError("The number of array is over the max value restricted!");
    }
    for (let i = 0; i < argsLen; i++) {
        O[len + i] = items[i];
    }
    const newLength = len + argsLen;
    O.length = newLength;
    return newLength;
}
function myPop(arr) {
    const O = Object(arr);
    let len = arr.length >>> 0;
    if (len === 0) {
        O.length = 0;
        return undefined;
    }
    len--;
    const value = O[len];
    delete O[len];
    O.length = len;
    return value;
}
// filter 
function myFilter(arr, callback) {
    if (arr === undefined || arr === null || !Array.isArray(arr)) {
        throw new TypeError(`Cannot read property 'filter' of not Array or null or undefined!`);
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
        throw new TypeError(`${callback} is not a function!`);
    }
    const O = Object(arr);
    const len = O.length >>> 0;
    const result = [];
    let resLen = 0;
    for (let i = 0; i < len; i++) {
        if (i in O) {
            const item = O[i];
            if (callback(item, i, O)) {
                result[resLen++] = item;
            }
        }
    }
    return result;
}
const filterArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const vf = myFilter(filterArr, (item) => item % 2 === 0);
console.log(vf);
// new 
function myNew(targetFn, ...args) {
    if (typeof targetFn !== 'function') {
        throw new TypeError(`new function the first param must be a function`);
    }
    const o = Object.create(targetFn.prototype);
    const res = targetFn.call(o, ...args);
    const isObject = typeof o === 'object' && o !== null;
    const isFunction = typeof res === 'function';
    return isObject || isFunction ? res : o;
}
//# sourceMappingURL=index.js.map