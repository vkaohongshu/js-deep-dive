console.log('========== async await ============');

// function* gen(): Generator<any, number, any> {
//     const num = yield fn(1)
//     console.log(num);
//     const num2 = yield fn(2)
//     console.log(num2);
//     const num3 = yield fn(3)
//     console.log(num3);
//     return 4
// }

// const g = gen();
// let next = g.next(); 
// while(!next.done) {
//     console.log(next = g.next());
// }

function fn(nums: any) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(nums * 2)
    }, 1000)
  })
}


function generatorToAsync(generatorFn: Function) {
    return () => {
        const gen = generatorFn.apply(this, arguments);
        return new Promise((resolve, reject) => {
            function go(arg: any): any {
                const res = gen.next(arg);
                const { value, done } = res;
                if (done) {
                    return resolve(value);
                } else {
                    return Promise.resolve(value).then((res: any) => go(res));
                }
            }
            go('next');
        })
    }
}

function* gen(): Generator<any, number, any> {
  const num1 = yield fn(1)
  console.log(num1) // 2
  const num2 = yield fn(num1)
  console.log(num2) // 4
  const num3 = yield fn(num2)
  console.log(num3) // 8
  return num3
}

const genToAsync = generatorToAsync(gen)
const asyncRes = genToAsync()
console.log(asyncRes) // Promise
asyncRes.then(res => console.log(res)) // 8
