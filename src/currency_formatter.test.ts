// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

import {expect, describe, test} from '@jest/globals';

import {
  fromSheetsToD3Format,
  fromSheetsToD3FormatOriginal,
  getCurrencySymbol,
  getGroupingSymbol,
  getFormatSpan,
  getFormatSuffix,
} from './currency_formatter';

describe('fromSheetsToD3Format', () => {
  test('should sanitize the format correctly', () => {
    const matches = [
      ['$#,##0%', '$,.0%'],
      ['$#,#0%', '$,.0%'],
      ['$##0%', '$.0%'],
      ['$#,##.##0%', '$,.4%'],
    ];
    for (const [from, to] of matches) {
      expect(fromSheetsToD3FormatOriginal(from)).toBe(to);
      expect(fromSheetsToD3Format(from)).toBe(to);
    }
  });

  test('should return empty string when no value format provided unlike original implementation', () => {
    expect(fromSheetsToD3FormatOriginal('')).toBe(undefined);
    expect(fromSheetsToD3Format('')).toBe('');
  });
});

describe('getCurrencySymbol', () => {
  test('should obtain the correct currency symbol', () => {
    expect(getCurrencySymbol('$#.#%')).toBe('$');
    expect(getCurrencySymbol('£#.#%')).toBe('£');
    expect(getCurrencySymbol('€#.#%')).toBe('€');
    expect(getCurrencySymbol('#.#%')).toBe('');
  });
});

describe('getFormatSpan', () => {
  test('should obtain the span of the format if available', () => {
    expect(getFormatSpan('$#.#%')).toBe(2);
    expect(getFormatSpan('$#.#%')).toBe(2);
    expect(getFormatSpan('$.#%')).toBe(2);
    expect(getFormatSpan('$.')).toBe(0);
  });
});

describe('getFormatSuffix', () => {
  test('should obtain the correct formatting suffix', () => {
    expect(getFormatSuffix('$#.#%')).toBe('%');
    expect(getFormatSuffix('£#.#%')).toBe('%');
    expect(getFormatSuffix('€#.#0')).toBe('f');
    expect(getFormatSuffix('€#.#f')).toBe('');
    expect(getFormatSuffix('#.#')).toBe('');
  });
});

describe('getGroupingSymbol', () => {
  test('should obtain the grouping delimiter', () => {
    expect(getGroupingSymbol('$#,#.#%')).toBe(',');
    expect(getGroupingSymbol('$#,#.#%', ',', '/')).toBe(',');
    expect(getGroupingSymbol('$##.#%', ',', '/')).toBe('/');
    expect(getGroupingSymbol('$#.#%')).toBe('');
  });
});
