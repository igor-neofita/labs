// ЛР №4, варіант 1 (№21 у журналі): функції JavaScript.
function calculateSum(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n має бути цілим і невід’ємним');
  return n * (n + 1) / 2;
}

const multiply = function (a, b) { return a * b; };
const power = (a, b) => a ** b;

function harmonicSeries(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n має бути цілим і невід’ємним');
  if (n === 0) return 0;
  return 1 / n + harmonicSeries(n - 1);
}

function createMultiplier(multiplier) {
  return function (value) { return value * multiplier; };
}

function applyFunction(value, func) { return func(value); }
function processSet(set, callback) { set.forEach(callback); }

console.log('ЛР №4. Варіант 1. Номер у журналі: 21');
console.log('Завдання 1, calculateSum(10):', calculateSum(10));
console.log('Завдання 2, multiply(6, 7):', multiply(6, 7));
console.log('Завдання 3, power(2, 5):', power(2, 5));
console.log('Завдання 4, harmonicSeries(4):', harmonicSeries(4).toFixed(6));
const triple = createMultiplier(3);
console.log('Завдання 5, triple(7):', triple(7));
console.log('Завдання 6, подвоєння:', applyFunction(5, x => x * 2));
console.log('Завдання 6, квадрат:', applyFunction(5, x => x ** 2));
console.log('Завдання 7*, Set([1, 2, 3]) × 2:');
processSet(new Set([1, 2, 3]), x => console.log(x * 2));

if (typeof document !== 'undefined') {
  document.getElementById('results').textContent = [
    `1. calculateSum(10) = ${calculateSum(10)}`,
    `2. multiply(6, 7) = ${multiply(6, 7)}`,
    `3. power(2, 5) = ${power(2, 5)}`,
    `4. harmonicSeries(4) = ${harmonicSeries(4).toFixed(6)}`,
    `5. createMultiplier(3)(7) = ${triple(7)}`,
    `6. applyFunction(5, x => x * 2) = ${applyFunction(5, x => x * 2)}`,
    `   applyFunction(5, x => x ** 2) = ${applyFunction(5, x => x ** 2)}`,
    '7*. processSet(Set(1, 2, 3), ×2) = 2, 4, 6',
  ].join('\n');
}
