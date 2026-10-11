import test from 'node:test';
import assert from 'node:assert/strict';
import * as palette from '../src/config/neuralPalette.mjs';

test('first visit uses the blue neural environment on white glass', () => {
  assert.equal(palette.DEFAULT_NEURAL_THEME, 'blue');
  assert.equal(palette.NEURAL_PALETTES.blue.background, '#ffffff');
  assert.equal(palette.NEURAL_PALETTES.blue.signal, '#0877b5');
  assert.equal(palette.NEURAL_PALETTES.blue.dendrite, '#168bdd');
});

