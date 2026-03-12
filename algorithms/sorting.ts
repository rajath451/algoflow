
import { SortItem, VisualizerStep } from '../types';

export const ALGO_CODE = {
  'Bubble Sort': [
    "for i from 0 to n-1:",
    "  for j from 0 to n-i-2:",
    "    if array[j] > array[j+1]:",
    "      swap(array[j], array[j+1])"
  ],
  'Selection Sort': [
    "for i from 0 to n-1:",
    "  min_idx = i",
    "  for j from i+1 to n:",
    "    if array[j] < array[min_idx]:",
    "      min_idx = j",
    "  swap(array[i], array[min_idx])"
  ],
  'Insertion Sort': [
    "for i from 1 to n:",
    "  key = array[i]",
    "  j = i - 1",
    "  while j >= 0 and array[j] > key:",
    "    array[j+1] = array[j]",
    "    j = j - 1",
    "  array[j+1] = key"
  ]
};

export function* bubbleSortGenerator(arr: SortItem[]): Generator<VisualizerStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  for (let i = 0; i < n; i++) {
    yield { array: [...a], line: 0, sorted: [...sorted] };
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...a], line: 1, comparing: [j, j + 1], sorted: [...sorted] };
      yield { array: [...a], line: 2, comparing: [j, j + 1], sorted: [...sorted] };
      if (a[j].value > a[j + 1].value) {
        const temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        yield { array: [...a], line: 3, comparing: [j, j + 1], swapped: [j, j + 1], sorted: [...sorted] };
      }
    }
    sorted.push(n - i - 1);
  }
  yield { array: [...a], sorted: a.map((_, idx) => idx), line: -1 };
}

export function* selectionSortGenerator(arr: SortItem[]): Generator<VisualizerStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];

  for (let i = 0; i < n; i++) {
    yield { array: [...a], line: 0, sorted: [...sorted] };
    let minIdx = i;
    yield { array: [...a], line: 1, comparing: [i], sorted: [...sorted] };
    for (let j = i + 1; j < n; j++) {
      yield { array: [...a], line: 2, comparing: [j, minIdx], sorted: [...sorted] };
      yield { array: [...a], line: 3, comparing: [j, minIdx], sorted: [...sorted] };
      if (a[j].value < a[minIdx].value) {
        minIdx = j;
        yield { array: [...a], line: 4, comparing: [minIdx], sorted: [...sorted] };
      }
    }
    const temp = a[i];
    a[i] = a[minIdx];
    a[minIdx] = temp;
    yield { array: [...a], line: 5, swapped: [i, minIdx], sorted: [...sorted] };
    sorted.push(i);
  }
  yield { array: [...a], sorted: a.map((_, idx) => idx), line: -1 };
}

export function* insertionSortGenerator(arr: SortItem[]): Generator<VisualizerStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [0];

  for (let i = 1; i < n; i++) {
    yield { array: [...a], line: 0, comparing: [i], sorted: [...sorted] };
    let key = a[i];
    yield { array: [...a], line: 1, comparing: [i], sorted: [...sorted] };
    let j = i - 1;
    yield { array: [...a], line: 2, comparing: [i, j], sorted: [...sorted] };
    
    while (j >= 0 && a[j].value > key.value) {
      yield { array: [...a], line: 3, comparing: [j, j + 1], sorted: [...sorted] };
      a[j + 1] = a[j];
      yield { array: [...a], line: 4, comparing: [j, j + 1], swapped: [j, j + 1], sorted: [...sorted] };
      j = j - 1;
      yield { array: [...a], line: 5, comparing: [j >= 0 ? j : 0], sorted: [...sorted] };
    }
    a[j + 1] = key;
    yield { array: [...a], line: 6, sorted: [...sorted, i] };
    if (!sorted.includes(i)) sorted.push(i);
  }
  yield { array: [...a], sorted: a.map((_, idx) => idx), line: -1 };
}

export function generateRandomArray(size: number = 20): SortItem[] {
  return Array.from({ length: size }, () => ({
    id: Math.random().toString(36).substr(2, 9),
    value: Math.floor(Math.random() * 90) + 10,
  }));
}

export function parseCustomArray(input: string): SortItem[] {
  return input
    .split(',')
    .map(v => parseInt(v.trim()))
    .filter(v => !isNaN(v))
    .slice(0, 50) // limit for visibility
    .map(v => ({
      id: Math.random().toString(36).substr(2, 9),
      value: Math.min(Math.max(v, 5), 100),
    }));
}
