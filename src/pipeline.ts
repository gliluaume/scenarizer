// deno-lint-ignore-file require-await
const action1 = async (input: number) => input + 1;
const action2 = async (input: number) => input + 2;

// const res1 = await action1(0);
// const res2 = await action2(res1);
// console.log( res2)

const pipeline = [action1, action2];

let current = 10;
for (const fn of pipeline) {
    current = await fn(current);
    console.log(current)
}
console.log(current)


let other = 100;
pipeline.forEach(async(fn) => {
    other = await fn(other);
    console.log('other', other);
})