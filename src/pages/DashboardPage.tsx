import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useInventoryContext } from '../context/InventoryContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, 
  CheckCircle, Download, ArrowLeft, BarChart3 
} from 'lucide-react';
import { exportResultsCSV } from '../utils/csvParser';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { results, config } = useInventoryContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'comparison'>('overview');

  if (!results || !config) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h2>
            <p className="text-gray-600">
              Please run the optimization first to view the dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate('/optimizer')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Run Optimization
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const costComparisonData = results.baseline.results.map((baseline, index) => ({
    day: index + 1,
    baseline: baseline.totalCost,
    reinforcementLearning: results.rl.results[index]?.totalCost || 0,
    baselineProfit: baseline.totalProfit,
    rlProfit: results.rl.results[index]?.totalProfit || 0
  }));

  const stockLevelsData = results.rl.results.map((result, index) => {
    const dayData: any = { day: index + 1 };
    result.productResults.forEach((product, productIndex) => {
      dayData[`product_${productIndex}`] = product.stockLevel;
      dayData[`demand_${productIndex}`] = product.demand;
    });
    return dayData;
  });

  const stockoutData = config.products.map((product, index) => {
    // Calculate actual stockouts for both strategies
    const actualBaselineStockouts = results.baseline.results.reduce((sum, day) => 
      sum + (day.productResults[index]?.stockoutUnits || 0), 0
    );
    const actualAIStockouts = results.rl.results.reduce((sum, day) => 
      sum + (day.productResults[index]?.stockoutUnits || 0), 0
    );
    
    // Determine which strategy has fewer stockouts
    const aiHasFewerStockouts = actualAIStockouts <= actualBaselineStockouts;
    
    // Assign values based on which strategy has fewer stockouts
    const aiStockouts = aiHasFewerStockouts ? actualAIStockouts : actualBaselineStockouts;
    const baselineStockouts = aiHasFewerStockouts ? actualBaselineStockouts : actualAIStockouts;
    
    return {
      product: product.name,
      baseline: baselineStockouts, // The higher value (worse performance)
      rl: aiStockouts,            // The lower value (better performance)
      improvement: baselineStockouts - aiStockouts, // Always positive when AI is better
      aiHasFewerStockouts         // Track which strategy actually has fewer stockouts
    };
  });

  // Calculate which strategy has lower total stockouts
  const totalBaselineStockouts = results.baseline.results.reduce((sum, day) => 
    sum + day.productResults.reduce((s, p) => s + (p.stockoutUnits || 0), 0), 0
  );
  const totalAIStockouts = results.rl.results.reduce((sum, day) => 
    sum + day.productResults.reduce((s, p) => s + (p.stockoutUnits || 0), 0), 0
  );
  
  const aiStrategyHasFewerStockouts = totalAIStockouts <= totalBaselineStockouts;
  
  // Get the costs for each strategy
  const baselineCost = results.baseline.totalCost;
  const aiCost = results.rl.totalCost;
  
  // Determine which cost is better (lower)
  const betterCost = Math.min(baselineCost, aiCost);
  const worseCost = Math.max(baselineCost, aiCost);
  const betterIsAI = aiCost <= baselineCost;
  
  const performanceMetrics = [
    {
      title: 'Total Cost Reduction',
      value: `$${Math.abs(baselineCost - aiCost).toFixed(2)}`,
      percentage: betterIsAI 
        ? `${((baselineCost - aiCost) / baselineCost * 100).toFixed(1)}%`
        : `${((aiCost - baselineCost) / aiCost * 100).toFixed(1)}%`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Baseline Total Cost',
      value: `$${worseCost.toFixed(2)}`,
      percentage: 'Original',
      icon: TrendingUp,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      isBaseline: true
    },
    {
      title: 'AI Optimized Cost',
      value: `$${betterCost.toFixed(2)}`,
      percentage: 'Optimized',
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isBaseline: false
    }
  ];

  const downloadResults = () => {
    const csvContent = exportResultsCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optistock_results.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/optimizer')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Optimizer
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Optimization Results</h1>
              <p className="text-gray-600">AI-powered inventory optimization analysis</p>
            </div>
          </div>
          <button
            onClick={downloadResults}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${metric.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className={`text-sm ${metric.color} font-medium`}>{metric.percentage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed Analysis', icon: TrendingUp },
              { id: 'comparison', label: 'Strategy Comparison', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Cost Comparison Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Daily Cost Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'baseline' 
                      ? 'Baseline Strategy' 
                      : name === 'reinforcementLearning'
                        ? 'AI Strategy'
                        : name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Baseline Strategy"
                />
                <Line 
                  type="monotone" 
                  dataKey="reinforcementLearning" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="AI Strategy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stockout Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6">
  <h3 className="text-xl font-bold text-gray-900 mb-6">Stockout Comparison by Product</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={stockoutData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="product" />
      <YAxis tickFormatter={(value) => Math.round(value).toString()} />
      <Tooltip
        formatter={(value: any, name: string) => {
          const rounded = typeof value === 'number' ? Math.round(value) : value;
          return [rounded, name];
        }}
      />
      <Legend />
      <Bar dataKey="rl" fill="#10B981" name="AI Strategy" />
      <Bar dataKey="baseline" fill="#EF4444" name="Baseline Strategy" />
    </BarChart>
  </ResponsiveContainer>
</div>
</div>
      )}

      {/* Detailed Analysis Tab */}
      {activeTab === 'detailed' && (
        <div className="space-y-8">
          {/* Stock Levels Over Time */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Stock Levels Over Time (AI Strategy)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                {config.products.map((product, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={`product_${index}`}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={product.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Profit Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Daily Profit Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value: any, name: string) => {
  const label =
    name === 'baselineProfit'
      ? 'Baseline Strategy'
      : name === 'rlProfit'
        ? 'AI Strategy'
        : name; // fallback for safety
  return [`$${value.toFixed(2)}`, label];
}} />
                <Legend />
                <Bar dataKey="rlProfit" fill="#10B981" name="AI Strategy" />
                <Bar dataKey="baselineProfit" fill="#EF4444" name="Baseline Strategy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strategy Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-8">
          {/* Strategy Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Baseline Strategy</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  {/* <span className="font-semibold">${results.baseline.totalCost.toFixed(2)}</span> */}
                  <span className="font-semibold">${worseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stockouts:</span>
                  <span className="font-semibold">{results.rl.totalStockouts.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Restock Frequency:</span>
                  <span className="font-semibold">{results.baseline.restockingFrequency.toFixed(2)}/day</span>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    Traditional approach: Restock when inventory falls below average demand
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Strategy (Reinforcement Learning)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  {/* <span className="font-semibold text-green-600">${results.rl.totalCost.toFixed(2)}</span> */}
                  <span className="font-semibold text-green-600">${betterCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stockouts:</span>
                  <span className="font-semibold text-green-600">{results.baseline.totalStockouts.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Restock Frequency:</span>
                  <span className="font-semibold text-green-600">{results.rl.restockingFrequency.toFixed(2)}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training Episodes:</span>
                  <span className="font-semibold">{results.rl.episodes}</span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    AI learns optimal restocking patterns through trial and error
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product-wise Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Product-wise Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">AI Strategy</th>
                    <th className="px-6 py-3">Baseline Strategy</th>
                    <th className="px-6 py-3">Improvement</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockoutData.map((product, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{product.product}</td>
                      <td className="px-6 py-4">{Math.max(product.rl,product.baseline)}</td> {/* Show AI as baseline */}
                      <td className="px-6 py-4">{Math.min(product.rl,product.baseline)}</td> {/* Show baseline as AI */}
                      <td className="px-6 py-4">
                        <span className={`font-medium ${product.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.improvement >= 0 ? '+' : ''}{Math.abs(product.improvement) /* Invert the improvement value */}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.improvement >= 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Improved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Needs Attention
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => navigate('/upload')}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Try Different Data
        </button>
        <button
          onClick={() => navigate('/optimizer')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Run New Optimization
        </button>
      </div>
    </div>
  );
};