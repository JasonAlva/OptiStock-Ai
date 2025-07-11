import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { useInventoryContext } from '../context/InventoryContext';
import { QLearningAgent } from '../utils/qlearning';
import { BaselineStrategy } from '../utils/baseline';
import { ComparisonResults } from '../types/inventory';

export const OptimizerPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, setResults, isOptimizing, setIsOptimizing } = useInventoryContext();
  
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [episodes, setEpisodes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!config) {
      navigate('/upload');
      return;
    }
  }, [config, navigate]);

  const runOptimization = async () => {
    if (!config) return;

    setIsOptimizing(true);
    setProgress(0);
    setEpisodes(0);
    setIsComplete(false);

    try {
      // Step 1: Initialize
      setCurrentStep('Initializing AI models...');
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Train Q-Learning Agent
      setCurrentStep('Training Reinforcement Learning Agent...');
      setProgress(20);
      
      const qAgent = new QLearningAgent(config.products, config.maxWarehouseCapacity);
      
      // Simulate training with progress updates
      const totalEpisodes = 200;
      for (let i = 0; i < totalEpisodes; i += 10) {
        qAgent.train(10);
        setEpisodes(i + 10);
        setProgress(20 + (i / totalEpisodes) * 40);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Step 3: Run RL Simulation
      setCurrentStep('Running AI optimization simulation...');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const rlResults = qAgent.simulate(config.optimizationDays);

      // Step 4: Run Baseline
      setCurrentStep('Running baseline comparison...');
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const baselineStrategy = new BaselineStrategy(config.products, config.maxWarehouseCapacity);
      const baselineResults = baselineStrategy.simulate(config.optimizationDays);

      // Step 5: Calculate metrics
      setCurrentStep('Calculating performance metrics...');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      const baselineTotalCost = baselineResults.reduce((sum, day) => sum + day.totalCost, 0);
      const rlTotalCost = rlResults.reduce((sum, day) => sum + day.totalCost, 0);
      
      const baselineStockouts = baselineResults.reduce((sum, day) => 
        sum + day.productResults.reduce((pSum, product) => pSum + product.stockoutUnits, 0), 0
      );
      const rlStockouts = rlResults.reduce((sum, day) => 
        sum + day.productResults.reduce((pSum, product) => pSum + product.stockoutUnits, 0), 0
      );

      const baselineRestocks = baselineResults.reduce((sum, day) => 
        sum + day.productResults.reduce((pSum, product) => pSum + (product.restockAction > 0 ? 1 : 0), 0), 0
      );
      const rlRestocks = rlResults.reduce((sum, day) => 
        sum + day.productResults.reduce((pSum, product) => pSum + (product.restockAction > 0 ? 1 : 0), 0), 0
      );

      const costReduction = baselineTotalCost - rlTotalCost;
      const percentImprovement = (costReduction / baselineTotalCost) * 100;

      const comparisonResults: ComparisonResults = {
        baseline: {
          results: baselineResults,
          totalCost: baselineTotalCost,
          totalStockouts: baselineStockouts,
          restockingFrequency: baselineRestocks / config.optimizationDays
        },
        rl: {
          results: rlResults,
          totalCost: rlTotalCost,
          totalStockouts: rlStockouts,
          restockingFrequency: rlRestocks / config.optimizationDays,
          episodes: totalEpisodes,
          finalReward: rlResults[rlResults.length - 1]?.totalProfit || 0
        },
        improvement: {
          costReduction,
          stockoutReduction: baselineStockouts - rlStockouts,
          percentImprovement
        }
      };

      setResults(comparisonResults);
      
      // Step 6: Complete
      setCurrentStep('Optimization complete!');
      setProgress(100);
      setIsComplete(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Optimization error:', error);
      setCurrentStep('Error occurred during optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const viewResults = () => {
    navigate('/dashboard');
  };

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">No configuration found. Please upload your data first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-indigo-600 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Optimization Engine</h1>
          <p className="text-gray-600 text-lg">
            Ready to optimize your inventory with advanced Reinforcement Learning
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{config.products.length}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{config.optimizationDays}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{config.maxWarehouseCapacity}</div>
              <div className="text-sm text-gray-600">Max Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {config.products.reduce((sum, p) => sum + p.initialStock, 0)}
              </div>
              <div className="text-sm text-gray-600">Initial Stock</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {isOptimizing && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Optimization Progress</h3>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-700 mb-2">{currentStep}</p>
              {episodes > 0 && (
                <p className="text-sm text-gray-600">Training Episodes: {episodes}/200</p>
              )}
            </div>
          </div>
        )}

        {/* Features Preview */}
        {!isOptimizing && !isComplete && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">What You'll Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Cost Optimization</h4>
                  <p className="text-sm text-gray-600">Minimize storage costs and stockout penalties</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Smart Restocking</h4>
                  <p className="text-sm text-gray-600">AI-driven restocking recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900">Performance Analysis</h4>
                  <p className="text-sm text-gray-600">Detailed comparison with baseline strategy</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!isOptimizing && !isComplete && (
            <>
              <button
                onClick={() => navigate('/upload')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Modify Configuration
              </button>
              <button
                onClick={runOptimization}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Start Optimization
              </button>
            </>
          )}
          
          {isComplete && (
            <button
              onClick={viewResults}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              View Results Dashboard
            </button>
          )}
          
          {isOptimizing && (
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                Optimizing...
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Technical Details
            </summary>
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p><strong>Algorithm:</strong> Q-Learning with epsilon-greedy exploration</p>
              <p><strong>State Space:</strong> Current stock levels + day of simulation</p>
              <p><strong>Action Space:</strong> Restocking amounts for each product</p>
              <p><strong>Reward Function:</strong> Revenue - Storage Costs - Restocking Costs - Stockout Penalties</p>
              <p><strong>Training Episodes:</strong> 200 episodes of 30-day simulations</p>
              <p><strong>Learning Rate:</strong> 0.1 with discount factor 0.9</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};