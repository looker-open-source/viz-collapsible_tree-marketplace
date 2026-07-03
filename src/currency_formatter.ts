// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

/** @fileoverview A set of utility functions for use with parsing and
 * formatting currency values.*/

/**
 * Determines the currency symbol used in the value format.
 *
 * @param valueFormat The format specification to parse.
 * @return The currency associated with the value format.
 */
export function getCurrencySymbol(valueFormat: string) {
  const c = valueFormat.charAt(0);
  return ['$', '£', '€'].includes(c) ? c : '';
}

/**
 * Obtains the span for the generated formatting specification.
 *
 * @param valueFormat The format specification to parse.
 * @return The span used for the generated formatting specification.
 */
export function getFormatSpan(valueFormat: string) {
  const parts = valueFormat.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Determines the suffix to use with the format.
 *
 * @param valueFormat The input value format.
 * @return The suffix to use with the eventual format.
 */
export function getFormatSuffix(valueFormat: string) {
  const c = valueFormat.slice(-1);
  const suffixMap: Record<string, string> = {
    '%': '%',
    '0': 'f',
  };
  return suffixMap[c] ?? '';
}

/**
 * Determines the character used to group digits in the numeral.
 *
 * @param valueFormat The input format to parse.
 * @param symbol The grouping symbol to look for.
 * @param otherwise The value to return if the symbol has not been found.
 */
export function getGroupingSymbol(
  valueFormat: string,
  symbol = ',',
  otherwise = ''
) {
  return valueFormat.indexOf(symbol) > -1 ? symbol : otherwise;
}

/**
 * Converts from the Sheets currency formatting specification
 * to the one acceptable for D3.js.
 *
 * @param valueFormat The sheets format spec.
 * @return The D3 format spec.
 */
export function fromSheetsToD3Format(valueFormat: string) {
  if (!valueFormat) {
    return '';
  }
  const currency = getCurrencySymbol(valueFormat);
  const grouper = getGroupingSymbol(valueFormat, ',', '');
  const n = getFormatSpan(valueFormat);
  const suffix = getFormatSuffix(valueFormat);
  return `${currency}${grouper}.${n}${suffix}`;
}

