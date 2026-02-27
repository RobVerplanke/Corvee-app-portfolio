import { assert } from 'node:assert';
import { getStartOfWeek } from '../databaseWrapper.js';

describe('DatabaseWrapper', function() {
  describe(':getStartOfWeek', function() {
    it('should return the Monday before the received date', function() {
      assert.equal(getStartOfWeek(new Date(2026, 2, 27)), new Date(2026, 2, 23));
    });
  });
});
