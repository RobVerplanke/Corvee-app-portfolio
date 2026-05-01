import assert from 'node:assert';
import { getWeekNumber, getMondayFromWeekNumber } from '../helpers.js';

const weekNrTests = [
  { date: new Date(2026, 2, 17), expected: 12 },
  { date: new Date(2026, 3, 17), expected: 16 },
  { date: new Date(2027, 1, 1), expected: 5},
];

const mondayFromWeekNumberTests = [
  { year: 2026, weekNr: 12, expected: new Date(2026, 2, 16)},
  { year: 2026, weekNr: 16, expected: new Date(2026, 3, 13)},
  { year: 2026, weekNr: 5, expected: new Date(2026, 0, 26)},
  { year: 2025, weekNr: 5, expected: new Date(2025, 0, 27)},
  { year: 2029, weekNr: 5, expected: new Date(2029, 0, 29)},
]

describe('Helper functions', function () {
  describe('getWeekNumber function', function () {
    weekNrTests.forEach(({date, expected}) => {
      it(`Correctly associates ${date.toLocaleDateString()} with week nr. ${expected}`, function() {
        const result = getWeekNumber(date);
        assert.strictEqual(result, expected);
      });
    });
  });
  describe('getMondayFromWeekNumber function', function () {
    mondayFromWeekNumberTests.forEach(({year, weekNr, expected}) => {
      it(`Correctly associates week number ${weekNr} with ${expected}`, function() {
        const result = getMondayFromWeekNumber(year, weekNr);
        assert.strictEqual(result.valueOf(), expected.valueOf());
      })
    })
  })
});
