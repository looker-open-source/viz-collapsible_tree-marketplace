import {expect, describe, test} from '@jest/globals';
import {burrow} from './utils';
import {Row, Cell} from './types';

describe('burrow', () => {
  test('should transform flat table data into nested tree structure', () => {
    const linkMap = new Map<string, any>();
    const taxonomy = [{name: 'dim1'}, {name: 'dim2'}];

    const cellA1: Cell = {value: 'A', links: []};
    const cellB1: Cell = {value: 'B', links: []};
    const cellA2: Cell = {value: 'A', links: []};
    const cellC2: Cell = {value: 'C', links: []};

    const row1: Row = {
      dim1: cellA1,
      dim2: cellB1,
    };
    const row2: Row = {
      dim1: cellA2,
      dim2: cellC2,
    };

    const table: Row[] = [row1, row2];

    const result = burrow(table, taxonomy, linkMap);

    expect(result.name).toBe('root');
    expect(result.depth).toBe(0);
    expect(result.children.length).toBe(1);

    const nodeA = result.children[0];
    expect(nodeA.name).toBe('A');
    expect(nodeA.depth).toBe(1);
    expect(nodeA.children.length).toBe(2);
    expect(nodeA.data).toBeUndefined();

    const nodeB = nodeA.children[0];
    expect(nodeB.name).toBe('B');
    expect(nodeB.depth).toBe(2);
    expect(nodeB.children.length).toBe(0);
    expect(nodeB.data).toBe(row1);

    const nodeC = nodeA.children[1];
    expect(nodeC.name).toBe('C');
    expect(nodeC.depth).toBe(2);
    expect(nodeC.children.length).toBe(0);
    expect(nodeC.data).toBe(row2);
  });

  test('should handle missing dimension fields gracefully', () => {
    const linkMap = new Map<string, any>();
    const taxonomy = [{name: 'dim1'}, {name: 'dim2'}];

    const cellA1: Cell = {value: 'A', links: []};
    const cellB1: Cell = {value: 'B', links: []};

    const row1: Row = {
      dim1: cellA1,
      dim2: cellB1,
    };
    const row2: Row = {
      dim1: cellA1,
    };

    const table: Row[] = [row1, row2];

    const result = burrow(table, taxonomy, linkMap);

    expect(result.name).toBe('root');
    expect(result.children.length).toBe(1);

    const nodeA = result.children[0];
    expect(nodeA.name).toBe('A');
    expect(nodeA.children.length).toBe(1);
    expect(nodeA.data).toBe(row2);

    const nodeB = nodeA.children[0];
    expect(nodeB.name).toBe('B');
    expect(nodeB.data).toBe(row1);
  });
});
