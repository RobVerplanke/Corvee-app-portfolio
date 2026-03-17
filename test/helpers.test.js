import assert from 'node:assert';
import { getWeekNumber } from '../helpers.js';

const weekNrTests = [
  { date: new Date(2026, 2, 17), expected: 12 },
  { date: new Date(2026, 3, 17), expected: 16 },
  { date: new Date(2027, 1, 1), expected: 5},
];

describe('Helper functions', function () {
  describe('getWeekNumber function', function () {
    weekNrTests.forEach(({date, expected}) => {
      it(`Correctly associates ${date.toLocaleDateString()} with week nr. ${expected}`, function() {
        const result = getWeekNumber(date);
        assert.strictEqual(result, expected);
      });
    });
  });
});
