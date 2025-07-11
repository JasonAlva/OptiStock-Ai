import { Product, SimulationResult, ProductDayResult, QLearningState, QLearningAction } from '../types/inventory';

export class QLearningAgent {
  private qTable: Map<string, Map<string, number>> = new Map();
  private learningRate = 0.2;  // Increased learning rate
  private discountFactor = 0.95;  // Increased discount factor
  private epsilon = 1.0;  // Start with full exploration
  private minEpsilon = 0.01;  // Minimum exploration rate
  private epsilonDecay = 0.995;  // Decay rate for exploration
  private products: Product[];
  private maxCapacity: number;

  constructor(products: Product[], maxCapacity: number) {
    this.products = products;
    this.maxCapacity = maxCapacity;
  }

  private stateToString(state: QLearningState): string {
    return `${state.stockLevels.join(',')}_${state.day}`;
  }

  private actionToString(action: QLearningAction): string {
    return action.restockAmounts.join(',');
  }

  private generatePossibleActions(currentStock: number[]): QLearningAction[] {
    const actions: QLearningAction[] = [];
    const maxRestockPerProduct = 50;
    
    // Generate strategic actions based on demand patterns
    for (let i = 0; i < 10; i++) {
      const restockAmounts = this.products.map((product, idx) => {
        const avgDemand = product.historicalDemand.reduce((a, b) => a + b, 0) / 
                         product.historicalDemand.length;
        const safetyStock = Math.ceil(avgDemand * 1.5); // 1.5x average demand
        const suggestedOrder = Math.max(0, safetyStock - currentStock[idx]);
        const maxPossible = Math.min(maxRestockPerProduct, this.maxCapacity - currentStock[idx]);
        
        // Add some randomness but bias towards suggested order
        const variation = Math.floor((Math.random() - 0.3) * avgDemand);
        return Math.max(0, Math.min(maxPossible, suggestedOrder + variation));
      });
      actions.push({ restockAmounts });
    }
    
    // Include the "do nothing" action
    actions.push({ restockAmounts: new Array(this.products.length).fill(0) });
    
    return actions;
  }

  private calculateReward(
    _previousStock: number[],  // Using _ prefix to indicate unused parameter
    action: QLearningAction,
    newStock: number[],
    demand: number[],
    day: number
  ): number {
    let totalReward = 0;

    for (let i = 0; i < this.products.length; i++) {
      const product = this.products[i];
      const actualDemand = Math.min(demand[i], newStock[i]);
      const stockouts = Math.max(0, demand[i] - newStock[i]);
      
      // Revenue from sales (reduced weight)
      const revenue = actualDemand * product.costPerItem * 1.5;
      
      // Storage costs (increased weight)
      const storageCost = newStock[i] * product.storageCostPerDay * 1.2;
      
      // Restocking costs
      const restockCost = action.restockAmounts[i] * product.costPerItem;
      
      // Stockout penalties (significantly increased with non-linear scaling)
      const stockoutPenalty = Math.pow(stockouts, 1.5) * product.stockoutPenalty * 5;
      
      // Add day-based penalty (encourage better planning)
      const dayPenalty = (day / 30) * 0.1 * storageCost;
      
      totalReward += (revenue - storageCost - restockCost - stockoutPenalty - dayPenalty);
    }

    return totalReward;
  }

  private getQValue(state: string, action: string): number {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    return this.qTable.get(state)!.get(action) || 0;
  }

  private setQValue(state: string, action: string, value: number): void {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, new Map());
    }
    this.qTable.get(state)!.set(action, value);
  }

  private selectAction(state: QLearningState): QLearningAction {
    const normalizedState = this.normalizeState(state);
    const stateStr = this.stateToString(normalizedState);
    const possibleActions = this.generatePossibleActions(state.stockLevels);

    // Epsilon-greedy with decay
    if (Math.random() < this.epsilon) {
      // With probability epsilon, explore
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    } else {
      // With probability 1-epsilon, exploit
      let bestAction = possibleActions[0];
      let bestValue = -Infinity;

      for (const action of possibleActions) {
        const actionStr = this.actionToString(action);
        const qValue = this.getQValue(stateStr, actionStr);
        
        // Add small random noise to break ties
        const noise = Math.random() * 1e-6;
        
        if (qValue + noise > bestValue) {
          bestValue = qValue + noise;
          bestAction = action;
        }
      }

      return bestAction;
    }
  }

  private normalizeState(state: QLearningState): QLearningState {
    const normalizedStock = state.stockLevels.map((stock) => {
      return stock / this.maxCapacity; // Normalize to [0, 1]
    });
    
    const normalizedDay = state.day / 30; // Normalize day to [0, 1]
    
    return {
      stockLevels: normalizedStock,
      day: normalizedDay
    };
  }

  public train(episodes: number = 1000): void {
    for (let episode = 0; episode < episodes; episode++) {
      const stockLevels = this.products.map(p => p.initialStock);
      let episodeReward = 0;
      
      for (let day = 0; day < 30; day++) {
        const state: QLearningState = {
          stockLevels: [...stockLevels],
          day
        };
        
        const action = this.selectAction(state);
        
        // Apply action (restock)
        for (let i = 0; i < stockLevels.length; i++) {
          stockLevels[i] += action.restockAmounts[i];
        }
        
        // Generate more realistic demand
        const demand = this.products.map((product) => {
          const history = product.historicalDemand;
          const dayDemand = history[day % history.length]; // Base on historical pattern
          const noise = (Math.random() - 0.5) * dayDemand * 0.2; // 20% noise
          return Math.max(0, Math.floor(dayDemand + noise));
        });
        
        // Calculate reward
        const newStock = stockLevels.map((stock, i) => Math.max(0, stock - demand[i]));
        const reward = this.calculateReward(state.stockLevels, action, stockLevels, demand, day);
        episodeReward += reward;
        
        // Update stock levels after demand
        for (let i = 0; i < stockLevels.length; i++) {
          stockLevels[i] = newStock[i];
        }
        
        // Q-learning update with adaptive learning rate
        const normalizedState = this.normalizeState(state);
        const stateStr = this.stateToString(normalizedState);
        const actionStr = this.actionToString(action);
        const currentQ = this.getQValue(stateStr, actionStr);
        
        // Next state
        const nextState: QLearningState = {
          stockLevels: [...stockLevels],
          day: day + 1
        };
        
        // Adaptive learning rate
        const adaptiveLearningRate = this.learningRate / Math.sqrt(episode + 1);
        
        // Update Q-value
        const normalizedNextState = this.normalizeState(nextState);
        const nextStateStr = this.stateToString(normalizedNextState);
        const nextActions = this.generatePossibleActions(nextState.stockLevels);
        let maxNextQ = -Infinity;
        
        for (const nextAction of nextActions) {
          const nextActionStr = this.actionToString(nextAction);
          const nextQ = this.getQValue(nextStateStr, nextActionStr);
          maxNextQ = Math.max(maxNextQ, nextQ);
        }
        
        const newQ = currentQ + adaptiveLearningRate * 
                    (reward + this.discountFactor * maxNextQ - currentQ);
        this.setQValue(stateStr, actionStr, newQ);
      }
      
      // Decay epsilon
      this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.epsilonDecay);
      
      // Log progress
      if (episode % 50 === 0) {
        console.log(`Episode ${episode}, Epsilon: ${this.epsilon.toFixed(3)}, ` +
                   `Avg Reward: ${(episodeReward/30).toFixed(2)}`);
      }
    }
  }

  public simulate(days: number): SimulationResult[] {
    const results: SimulationResult[] = [];
    const stockLevels = this.products.map(p => p.initialStock);
    
    for (let day = 0; day < days; day++) {
      const state: QLearningState = {
        stockLevels: [...stockLevels],
        day
      };
      
      const action = this.selectAction(state);
      
      // Apply restocking
      action.restockAmounts.forEach((amount, i) => {
        stockLevels[i] += amount;
      });
      
      // Generate demand with historical pattern
      const demand = this.products.map((p) => {
        const history = p.historicalDemand;
        const dayDemand = history[day % history.length];
        const noise = (Math.random() - 0.5) * dayDemand * 0.2;
        return Math.max(0, Math.floor(dayDemand + noise));
      });
      
      const productResults: ProductDayResult[] = [];
      let totalCost = 0;
      let totalRevenue = 0;
      
      // Process each product
      this.products.forEach((product, i) => {
        const actualDemand = Math.min(demand[i], stockLevels[i]);
        const stockouts = Math.max(0, demand[i] - stockLevels[i]);
        
        const dailyRevenue = actualDemand * product.costPerItem * 1.5;
        const dailyCost = (stockLevels[i] * product.storageCostPerDay) + 
                         (action.restockAmounts[i] * product.costPerItem) + 
                         (stockouts * product.stockoutPenalty);
        
        productResults.push({
          productId: product.id,
          stockLevel: stockLevels[i],
          demand: demand[i],
          restockAction: action.restockAmounts[i],
          stockoutUnits: stockouts,
          dailyCost,
          dailyRevenue
        });
        
        totalCost += dailyCost;
        totalRevenue += dailyRevenue;
        
        // Update stock after demand
        stockLevels[i] = Math.max(0, stockLevels[i] - demand[i]);
      });
      
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