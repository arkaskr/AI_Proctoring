import { CandidateInfo, Question, Section } from '../types/exam';

export const mockCandidate: CandidateInfo = {
  name: 'Alex Morgan',
  candidateId: 'CAN-884920-AI',
  rollNumber: 'CS-2026-9042',
  email: 'alex.morgan@university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  examName: 'National Graduate Examination in Computing & AI Architecture',
  examCode: 'NGE-AI-2026-X',
  durationMinutes: 90,
};

export const mockSections: Section[] = [
  {
    id: 'sec-1',
    name: 'Section A: Data Structures & Algorithms',
    description: 'Algorithmic efficiency, graph traversal, and dynamic programming paradigms.',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
  },
  {
    id: 'sec-2',
    name: 'Section B: AI Systems & Neural Architectures',
    description: 'Attention mechanisms, inference optimization, vector search, and loss functions.',
    questionIds: ['q6', 'q7', 'q8', 'q9'],
  },
  {
    id: 'sec-3',
    name: 'Section C: Distributed Systems & Engineering',
    description: 'Consensus protocols, caching strategies, CAP theorem tradeoffs, and live coding.',
    questionIds: ['q10', 'q11', 'q12'],
  },
];

export const mockQuestions: Record<string, Question> = {
  q1: {
    id: 'q1',
    number: 1,
    sectionId: 'sec-1',
    type: 'single_choice',
    title: 'Time Complexity of Tarjan\'s Strongly Connected Components',
    prompt: 'Given a directed graph G = (V, E) represented as an adjacency list, what is the tight asymptotic time complexity of Tarjan\'s Strongly Connected Components (SCC) algorithm using Depth First Search (DFS)?',
    points: 3,
    negativePoints: 1,
    difficulty: 'Medium',
    topic: 'Graph Algorithms',
    options: [
      { id: 'opt-1-a', label: 'A', text: 'O(|V| + |E|)' },
      { id: 'opt-1-b', label: 'B', text: 'O(|V| log |V| + |E|)' },
      { id: 'opt-1-c', label: 'C', text: 'O(|V| · |E|)' },
      { id: 'opt-1-d', label: 'D', text: 'O(|V|^2)' },
    ],
    correctAnswers: ['opt-1-a'],
    hint: 'Tarjan\'s algorithm visits every vertex once and explores every directed edge once during the single DFS pass.',
  },
  q2: {
    id: 'q2',
    number: 2,
    sectionId: 'sec-1',
    type: 'multiple_choice',
    title: 'Self-Balancing Binary Search Tree Invariants',
    prompt: 'Which of the following statements regarding Red-Black Trees and AVL Trees are correct? (Select all that apply)',
    points: 4,
    negativePoints: 1,
    difficulty: 'Hard',
    topic: 'Balanced Search Trees',
    options: [
      { id: 'opt-2-a', label: 'A', text: 'In an AVL tree, the balance factor (height of left subtree minus height of right subtree) of every node is in the set {-1, 0, 1}.' },
      { id: 'opt-2-b', label: 'B', text: 'A Red-Black tree with N nodes guarantees that the tree height will never exceed 2 · log₂(N + 1).' },
      { id: 'opt-2-c', label: 'C', text: 'AVL trees require fewer rotations during insertions on average than Red-Black trees.' },
      { id: 'opt-2-d', label: 'D', text: 'Every path from a node to any of its descendant NIL nodes in a Red-Black tree contains the same number of black nodes.' },
    ],
    correctAnswers: ['opt-2-a', 'opt-2-b', 'opt-2-d'],
  },
  q3: {
    id: 'q3',
    number: 3,
    sectionId: 'sec-1',
    type: 'single_choice',
    title: 'Amortized Analysis of Dynamic Array Resizing',
    prompt: 'Consider a dynamic array initialized with capacity 1. Whenever the array is full upon insertion, its capacity is doubled. What is the amortized cost per insertion operation over a sequence of N insertions starting from an empty array?',
    points: 3,
    negativePoints: 1,
    difficulty: 'Easy',
    topic: 'Amortized Analysis',
    options: [
      { id: 'opt-3-a', label: 'A', text: 'O(1) amortized time' },
      { id: 'opt-3-b', label: 'B', text: 'O(log N) amortized time' },
      { id: 'opt-3-c', label: 'C', text: 'O(N) amortized time' },
      { id: 'opt-3-d', label: 'D', text: 'O(1/N) amortized time' },
    ],
    correctAnswers: ['opt-3-a'],
  },
  q4: {
    id: 'q4',
    number: 4,
    sectionId: 'sec-1',
    type: 'single_choice',
    title: 'Dynamic Programming: Longest Increasing Subsequence',
    prompt: 'Given an integer array nums = [10, 9, 2, 5, 3, 7, 101, 18], what is the length of the Longest Strictly Increasing Subsequence (LIS)?',
    points: 3,
    negativePoints: 1,
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    codeSnippet: `// Example Sequence
nums = [10, 9, 2, 5, 3, 7, 101, 18]
// Subsequence candidates: [2, 3, 7, 101] or [2, 5, 7, 101] or [2, 3, 7, 18]`,
    codeLanguage: 'typescript',
    options: [
      { id: 'opt-4-a', label: 'A', text: '3' },
      { id: 'opt-4-b', label: 'B', text: '4' },
      { id: 'opt-4-c', label: 'C', text: '5' },
      { id: 'opt-4-d', label: 'D', text: '6' },
    ],
    correctAnswers: ['opt-4-b'],
  },
  q5: {
    id: 'q5',
    number: 5,
    sectionId: 'sec-1',
    type: 'coding',
    title: 'Implement In-Place QuickSort Partition (Lomuto or Hoare)',
    prompt: 'Implement a TypeScript function partition(arr: number[], low: number, high: number): number that arranges the elements around a pivot and returns the final pivot index such that all elements before it are <= pivot and all elements after are >= pivot.',
    points: 6,
    difficulty: 'Hard',
    topic: 'Sorting & Divide and Conquer',
    codeSnippet: `function partition(arr: number[], low: number, high: number): number {
  // Select pivot (e.g. arr[high])
  const pivot = arr[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    codeLanguage: 'typescript',
  },
  q6: {
    id: 'q6',
    number: 6,
    sectionId: 'sec-2',
    type: 'single_choice',
    title: 'Multi-Head Self-Attention Computational Complexity',
    prompt: 'In the standard Transformer architecture (Vaswani et al.), for an input sequence length of L and model embedding dimension d_model, what is the computational complexity of the scaled dot-product self-attention mechanism per layer?',
    points: 4,
    negativePoints: 1,
    difficulty: 'Medium',
    topic: 'Transformer Architectures',
    options: [
      { id: 'opt-6-a', label: 'A', text: 'O(L · d_model^2 + L^2 · d_model)' },
      { id: 'opt-6-b', label: 'B', text: 'O(L^3 · d_model)' },
      { id: 'opt-6-c', label: 'C', text: 'O(L · log(L) · d_model)' },
      { id: 'opt-6-d', label: 'D', text: 'O(L^2 · d_model^2)' },
    ],
    correctAnswers: ['opt-6-a'],
  },
  q7: {
    id: 'q7',
    number: 7,
    sectionId: 'sec-2',
    type: 'multiple_choice',
    title: 'Techniques for Mitigating Vanishing/Exploding Gradients',
    prompt: 'Which of the following architectural and optimization techniques directly mitigate the vanishing or exploding gradient problem during deep neural network backpropagation? (Select all that apply)',
    points: 4,
    negativePoints: 1,
    difficulty: 'Medium',
    topic: 'Deep Learning Optimization',
    options: [
      { id: 'opt-7-a', label: 'A', text: 'Residual (skip) connections as found in ResNet architectures.' },
      { id: 'opt-7-b', label: 'B', text: 'Layer Normalization and Batch Normalization.' },
      { id: 'opt-7-c', label: 'C', text: 'Gradient clipping by norm or value.' },
      { id: 'opt-7-d', label: 'D', text: 'Replacing ReLU activations universally with standard Sigmoid activations.' },
    ],
    correctAnswers: ['opt-7-a', 'opt-7-b', 'opt-7-c'],
  },
  q8: {
    id: 'q8',
    number: 8,
    sectionId: 'sec-2',
    type: 'single_choice',
    title: 'HNSW (Hierarchical Navigable Small World) for Vector Search',
    prompt: 'What makes HNSW graphs particularly effective for approximate nearest neighbor (ANN) search over high-dimensional vector embeddings compared to flat brute-force search?',
    points: 3,
    negativePoints: 1,
    difficulty: 'Medium',
    topic: 'Vector Databases',
    options: [
      { id: 'opt-8-a', label: 'A', text: 'It creates multi-layer geometric skip-list structures achieving O(log N) average query time with high recall.' },
      { id: 'opt-8-b', label: 'B', text: 'It compresses all vector dimensions down to 1-bit scalar quantizations without any graph.' },
      { id: 'opt-8-c', label: 'C', text: 'It replaces cosine similarity with Euclidean Manhattan distance exclusively.' },
      { id: 'opt-8-d', label: 'D', text: 'It eliminates the need to store vectors in memory entirely.' },
    ],
    correctAnswers: ['opt-8-a'],
  },
  q9: {
    id: 'q9',
    number: 9,
    sectionId: 'sec-2',
    type: 'text_answer',
    title: 'Mechanisms of Temperature Sampling in Large Language Models',
    prompt: 'Briefly describe the mathematical effect of setting the sampling temperature T approaching 0 versus T > 1.0 on the softmax logits distribution during autoregressive token generation.',
    points: 5,
    difficulty: 'Medium',
    topic: 'LLM Decoding Strategies',
  },
  q10: {
    id: 'q10',
    number: 10,
    sectionId: 'sec-3',
    type: 'single_choice',
    title: 'Raft Consensus Protocol Leader Election Quorum',
    prompt: 'In a Raft cluster consisting of 5 distributed nodes, what is the minimum number of affirmative votes (including the candidate\'s own vote) required for a candidate node to successfully become the leader?',
    points: 3,
    negativePoints: 1,
    difficulty: 'Easy',
    topic: 'Distributed Consensus',
    options: [
      { id: 'opt-10-a', label: 'A', text: '2 votes' },
      { id: 'opt-10-b', label: 'B', text: '3 votes (Majority: ⌊N/2⌋ + 1)' },
      { id: 'opt-10-c', label: 'C', text: '4 votes' },
      { id: 'opt-10-d', label: 'D', text: '5 votes (Unanimous)' },
    ],
    correctAnswers: ['opt-10-b'],
  },
  q11: {
    id: 'q11',
    number: 11,
    sectionId: 'sec-3',
    type: 'multiple_choice',
    title: 'Cache Invalidation Strategies and Write Patterns',
    prompt: 'Which of the following caching strategies guarantee that cache data is always updated synchronously with the backing database before a write operation returns as successful? (Select all that apply)',
    points: 4,
    negativePoints: 1,
    difficulty: 'Hard',
    topic: 'System Design & Caching',
    options: [
      { id: 'opt-11-a', label: 'A', text: 'Write-Through Caching' },
      { id: 'opt-11-b', label: 'B', text: 'Write-Behind (Write-Back) Caching' },
      { id: 'opt-11-c', label: 'C', text: 'Cache-Aside (Lazy Loading) with Write-Around' },
      { id: 'opt-11-d', label: 'D', text: 'Write-Through with synchronous transactional commit' },
    ],
    correctAnswers: ['opt-11-a', 'opt-11-d'],
  },
  q12: {
    id: 'q12',
    number: 12,
    sectionId: 'sec-3',
    type: 'coding',
    title: 'Rate Limiter Token Bucket Implementation',
    prompt: 'Write a basic TokenBucketRateLimiter class with allowRequest(): boolean method that refills tokens at a fixed rate per second up to capacity.',
    points: 6,
    difficulty: 'Hard',
    topic: 'System Design Algorithms',
    codeSnippet: `class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSecond: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public allowRequest(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRatePerSecond;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }
}`,
    codeLanguage: 'typescript',
  },
};
