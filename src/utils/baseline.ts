import { Product, SimulationResult, ProductDayResult } from '../types/inventory';

export class BaselineStrategy {
  private products: Product[];
  private maxCapacity: number;

  constructor(products: Product[], maxCapacity: number) {
    this.products = products;
    this.maxCapacity = maxCapacity;
  }

  public simulate(days: number): SimulationResult[] {
    const results: SimulationResult[] = [];
    const stockLevels = this.products.map(p => p.initialStock);
    
    for (let day = 0; day < days; day++) {
      // Baseline strategy: restock to average demand * 2 when stock is below average demand
      const restockAmounts = this.products.map((product, i) => {
        const avgDemand = product.historicalDemand.reduce((a, b) => a + b, 0) / product.historicalDemand.length;
        const targetStock = avgDemand * 2;
        
        if (stockLevels[i] < avgDemand) {
          return Math.min(targetStock - stockLevels[i], this.maxCapacity - stockLevels[i]);
        }
        return 0;
      });
      
      // Apply restocking
      for (let i = 0; i < stockLevels.length; i++) {
        stockLevels[i] += restockAmounts[i];
      }
      
      // Generate demand (same logic as RL)
      const demand = this.products.map((product, i) => {
        const avgDemand = product.historicalDemand.reduce((a, b) => a + b, 0) / product.historicalDemand.length;
        return Math.max(0, Math.floor(avgDemand + (Math.random() - 0.5) * avgDemand * 0.2));
      });
      
      const productResults: ProductDayResult[] = [];
      let totalCost = 0;
      let totalRevenue = 0;
      
      for (let i = 0; i < this.products.length; i++) {
        const product = this.products[i];
        const actualDemand = Math.min(demand[i], stockLevels[i]);
        const stockouts = Math.max(0, demand[i] - stockLevels[i]);
        
        const dailyRevenue = actualDemand * product.costPerItem * 1.5;
        const dailyCost = (stockLevels[i] * product.storageCostPerDay) + 
                         (restockAmounts[i] * product.costPerItem) + 
                         (stockouts * product.stockoutPenalty);
        
        productResults.push({
          productId: product.id,
          stockLevel: stockLevels[i],
          demand: demand[i],
          restockAction: restockAmounts[i],
          stockoutUnits: stockouts,
          dailyCost,
          dailyRevenue
        });
        
        totalCost += dailyCost;
        totalRevenue += dailyRevenue;
        
        // Update stock after demand
        stockLevels[i] = Math.max(0, stockLevels[i] - demand[i]);
      }
      
      results.push({
        day,
        productResults,
        totalCost,
        totalRevenue,
        totalProfit: totalRevenue - totalCost
      });
    }
    
    return results;
  }
}