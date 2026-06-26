// © 2019 Google LLC.  All rights reserved.
//
// This software is subject to the Google Cloud Terms of Service, as
// modified by the "General Software Terms" of the Google Cloud Service Specific Terms, available at: https://cloud.google.com/terms/service-terms.

import {format} from 'd3';

import {
  VisConfig,
  VisQueryResponse,
  VisualizationDefinition,
  Row,
  Cell,
  Link,
} from './types';
import {fromSheetsToD3Format} from './currency_formatter';

export const formatType = (valueFormat: string) => {
  const formattedData = fromSheetsToD3Format(valueFormat);
  return format(formattedData);
};

export const handleErrors = (
  vis: VisualizationDefinition,
  res: VisQueryResponse,
  options: VisConfig
) => {
  const check = (
    group: string,
    noun: string,
    count: number,
    min: number,
    max: number
  ): boolean => {
    if (!vis.addError || !vis.clearErrors) return false;
    if (count < min) {
      vis.addError({
        title: `Not Enough ${noun}s`,
        message: `This visualization requires ${
          min === max ? 'exactly' : 'at least'
        } ${min} ${noun.toLowerCase()}${min === 1 ? '' : 's'}.`,
        group,
      });
      return false;
    }
    if (count > max) {
      vis.addError({
        title: `Too Many ${noun}s`,
        message: `This visualization requires ${
          min === max ? 'exactly' : 'no more than'
        } ${max} ${noun.toLowerCase()}${min === 1 ? '' : 's'}.`,
        group,
      });
      return false;
    }
    vis.clearErrors(group);
    return true;
  };

  const {pivots, dimensions, measure_like: measures} = res.fields;

  return (
    check(
      'pivot-req',
      'Pivot',
      pivots.length,
      options.min_pivots,
      options.max_pivots
    ) &&
    check(
      'dim-req',
      'Dimension',
      dimensions.length,
      options.min_dimensions,
      options.max_dimensions
    ) &&
    check(
      'mes-req',
      'Measure',
      measures.length,
      options.min_measures,
      options.max_measures
    )
  );
};

function descend(obj: any, depth: number = 0) {
  const arr: any[] = [];
  for (const k in obj) {
    if (k === '__data') {
      continue;
    }
    const child: any = {
      name: k,
      depth,
      children: descend(obj[k], depth + 1),
    };
    if (obj[k] && typeof obj[k] === 'object' && '__data' in obj[k]) {
      child.data = obj[k].__data;
    }
    arr.push(child);
  }
  return arr;
}

export function burrow(
  table: any,
  taxonomy: any[],
  linkMap: Map<string, Cell | Link[] | undefined>
) {
  // create nested object
  const obj: any = {};

  table.forEach((row: Row) => {
    // start at root
    let layer = obj;
    // create children as nested objects
    taxonomy.forEach((t: any) => {
      const cell = row[t.name];
      if (cell) {
        const key = cell.value;
        linkMap.set(key, cell.links);
        layer[key] = key in layer ? layer[key] : {};
        layer = layer[key];
      }
    });
    layer.__data = row;
  });

  return {
    name: 'root',
    children: descend(obj, 1),
    depth: 0,
    links: linkMap,
  };
}
