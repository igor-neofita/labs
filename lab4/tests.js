const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
const out = []; const context = vm.createContext({console:{log:(...a)=>out.push(a.join(' '))}});
vm.runInContext(source, context);
const tests = [
 ['calculateSum 10', 'calculateSum(10)===55'],
 ['calculateSum 0', 'calculateSum(0)===0'],
 ['multiply', 'multiply(6,7)===42'],
 ['multiply negative', 'multiply(-2,3)===-6'],
 ['power 2^5', 'power(2,5)===32'],
 ['power exponent zero', 'power(3,0)===1'],
 ['harmonicSeries 4', 'Math.abs(harmonicSeries(4)-(25/12))<1e-10'],
 ['harmonicSeries 0', 'harmonicSeries(0)===0'],
 ['closure', 'createMultiplier(3)(7)===21'],
 ['apply double', 'applyFunction(5,x=>x*2)===10'],
 ['apply square', 'applyFunction(5,x=>x*x)===25'],
];
for (const [label, expression] of tests) assert.equal(vm.runInContext(expression,context),true,label);
assert.throws(()=>vm.runInContext('harmonicSeries(-1)',context),/невід’ємним/);
const processed=[];
context.collected=processed;
vm.runInContext('processSet(new Set([1,2,3]),x=>collected.push(x*2))',context);
assert.deepEqual(processed,[2,4,6]);
console.log('PASS: 13 перевірок, варіант 1, студент №21');
