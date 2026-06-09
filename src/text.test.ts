import {expect, describe, test} from '@jest/globals';
import {getEllipsizedText} from './text';

describe('getEllipsizedText', () => {
  test('should ellipsize long text', () => {
    expect(
      getEllipsizedText(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita, laudantium!',
        200,
        100,
        16
      )
    ).toMatch(/\.{3}$/);
    expect(
      getEllipsizedText(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita, laudantium!',
        100,
        200,
        16
      )
    ).toMatch(/\.{3}$/);
  });

  test('should handle undefined parentNodePos', () => {
    expect(
      getEllipsizedText(
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita, laudantium!',
        200,
        undefined,
        16
      )
    ).toMatch(/\.{3}$/);
  });

  test('should not ellipsize short text', () => {
    expect(getEllipsizedText('Lorem ipsum dolor sit amet', 500, 100, 16)).toBe(
      'Lorem ipsum dolor sit amet'
    );
  });
});
