
export interface SortItem {
  id: string;
  value: number;
}

export type ViewType = 'Sorting' | 'LinkedList' | 'BST' | 'Hashing' | 'Graphs' | 'Playground';

export interface SortState {
  array: SortItem[];
  comparingIndices: number[];
  swappedIndices: number[];
  sortedIndices: number[];
  isSorting: boolean;
  isPaused: boolean;
  currentAlgo: AlgorithmType;
  currentLine: number;
}

export type AlgorithmType = 'Bubble Sort' | 'Selection Sort' | 'Insertion Sort';

export interface VisualizerStep {
  array?: any;
  comparing?: any[];
  swapped?: any[];
  sorted?: any[];
  line?: number;
  highlightNodes?: string[];
  highlightEdges?: string[];
  message?: string;
}

// Linked List Node
export interface LLNode {
  id: string;
  value: number;
  nextId: string | null;
}

// Tree Node
export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}
