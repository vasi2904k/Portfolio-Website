import test from 'node:test';
import assert from 'node:assert/strict';
import * as palette from '../src/config/neuralPalette.mjs';

test('first visit uses the neon blue environment', () => {
  assert.equal(palette.DEFAULT_NEURAL_THEME, 'blue');
  assert.equal(palette.NEURAL_PALETTES.blue.signal, '#38bfff');
  assert.equal(palette.NEURAL_PALETTES.blue.dendrite, '#168bdd');
});

