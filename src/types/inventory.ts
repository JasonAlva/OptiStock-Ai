export interface Product {
  id: string;
  name: string;
  initialStock: number;
  costPerItem: number;
  storageCostPerDay: number;
  stockoutPenalty: number;
  historicalDemand: number[];
}

export interface InventoryConfig {
  products: Product[];
  maxWarehouseCapacity: number;
  optimizationDays: number;
}

export interface SimulationResult {
  day: number;
  productResults: ProductDayResult[];
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface ProductDayResult {
  productId: string;
  stockLevel: number;
  demand: number;
  restockAction: number;
  stockoutUnits: number;
  dailyCost: number;
  dailyRevenue: number;
}

export interface ComparisonResults {
  baseline: {
    results: SimulationResult[];
    totalCost: number;
    totalStockouts: number;
    restockingFrequency: number;
  };
  rl: {
    results: SimulationResult[];
    totalCost: number;
    totalStockouts: number;
    restockingFrequency: number;
    episodes: number;
    finalReward: number;
  };
  improvement: {
    costReduction: number;
    stockoutReduction: number;
    percentImprovement: number;
  };
}

export interface QLearningState {
  stockLevels: number[];
  day: number;
}

export interface QLearningAction {
  restockAmounts: number[];
}