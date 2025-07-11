import { Product } from '../types/inventory';

export const parseCSV = (csvText: string): Product[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const products: Product[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    
    if (values.length >= 6) {
      const product: Product = {
        id: `product-${i}`,
        name: values[0] || `Product ${i}`,
        initialStock: parseInt(values[1]) || 0,
        costPerItem: parseFloat(values[2]) || 0,
        storageCostPerDay: parseFloat(values[3]) || 0,
        stockoutPenalty: parseFloat(values[4]) || 0,
        historicalDemand: values[5] ? values[5].split(';').map(d => parseInt(d.trim()) || 0) : []
      };
      
      products.push(product);
    }
  }
  
  return products;
};

export const generateSampleCSV = (): string => {
  return `Product Name,Initial Stock,Cost Per Item,Storage Cost Per Day,Stockout Penalty,Historical Demand (semicolon separated)
Widget A,100,10.50,0.25,5.00,15;18;12;20;14;16;13;19;17;15
Widget B,75,25.00,0.50,12.00,8;10;12;9;11;7;13;8;10;9
Widget C,50,45.00,1.00,20.00,5;6;4;7;5;6;8;4;5;6
Gadget X,200,8.75,0.20,3.50,25;30;28;32;26;29;31;27;33;28
Gadget Y,150,15.25,0.35,8.00,12;14;16;13;15;11;17;12;14;13`;
};

export const exportResultsCSV = (results: any): string => {
  if (!results) return '';
  
  let csv = 'Strategy,Day,Product,Stock Level,Demand,Restock Action,Stockouts,Daily Cost,Daily Revenue\n';
  
  // Export baseline results
  results.baseline.results.forEach((dayResult: any) => {
    dayResult.productResults.forEach((productResult: any) => {
      csv += `Baseline,${dayResult.day},${productResult.productId},${productResult.stockLevel},${productResult.demand},${productResult.restockAction},${productResult.stockoutUnits},${productResult.dailyCost.toFixed(2)},${productResult.dailyRevenue.toFixed(2)}\n`;
    });
  });
  
  // Export RL results
  results.rl.results.forEach((dayResult: any) => {
    dayResult.productResults.forEach((productResult: any) => {
      csv += `Reinforcement Learning,${dayResult.day},${productResult.productId},${productResult.stockLevel},${productResult.demand},${productResult.restockAction},${productResult.stockoutUnits},${productResult.dailyCost.toFixed(2)},${productResult.dailyRevenue.toFixed(2)}\n`;
    });
  });
  
  return csv;
};