import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  ZAxis
} from 'recharts';
import Warehouse3D from '../components/Warehouse3D';

// Mock WebSocket functionality
const initializeWebSocket = () => {
  // Mock WebSocket connection
  return {
    on: (event: string, callback: (data: any) => void) => {
      // Mock WebSocket event listener
      if (event === 'update') {
        setInterval(() => {
          callback({
            inventory: Math.floor(Math.random() * 1000),
            orders: Math.floor(Math.random() * 100),
            alerts: Math.floor(Math.random() * 10)
          });
        }, 3000);
      }
    }
  };
};

// Sample data for demonstration
const salesData = Array.from({ length: 12 }, (_, i) => ({
  name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: Math.floor(3000 + Math.random() * 5000),
  predicted: Math.floor(3000 + Math.random() * 5000)
}));

const inventoryData = [
  { name: 'In Stock', value: 400 },
  { name: 'Low Stock', value: 100 },
  { name: 'Out of Stock', value: 50 },
];

// LSTM/GRU prediction data
const lstmData = [
  { month: 'Jan', actual: 4000, predicted: 3850 },
  { month: 'Feb', actual: 3000, predicted: 2950 },
  { month: 'Mar', actual: 6000, predicted: 6200 },
  { month: 'Apr', actual: 5800, predicted: 5900 },
  { month: 'May', actual: 6900, predicted: 7000 },
  { month: 'Jun', actual: 8100, predicted: 8000 },
  { month: 'Jul', actual: null, predicted: 8900 },
  { month: 'Aug', actual: null, predicted: 9500 },
  { month: 'Sep', actual: null, predicted: 9200 },
];

// Monte Carlo simulation data
const monteCarloData = Array.from({ length: 100 }, () => ({
  x: Math.random() * 1000,
  y: Math.random() * 1000,
  z: 5 + Math.random() * 20
}));

// Dynamic pricing data
const pricingData = [
  { day: 'Mon', price: 100, demand: 150 },
  { day: 'Tue', price: 95, demand: 180 },
  { day: 'Wed', price: 110, demand: 130 },
  { day: 'Thu', price: 105, demand: 160 },
  { day: 'Fri', price: 90, demand: 200 },
  { day: 'Sat', price: 85, demand: 220 },
  { day: 'Sun', price: 120, demand: 110 },
];

// Supplier lead time data
const supplierData = [
  { name: 'Supplier A', leadTime: 5, reliability: 0.95 },
  { name: 'Supplier B', leadTime: 3, reliability: 0.85 },
  { name: 'Supplier C', leadTime: 7, reliability: 0.98 },
  { name: 'Supplier D', leadTime: 4, reliability: 0.90 },
];

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

// Profit comparison data (in thousands $)
const profitComparisonData = [
  { 
    month: 'Jan', 
    traditional: 4.5, 
    optimized: 4.8,
    lossTraditional: -0.8,
    lossOptimized: -0.3
  },
  { 
    month: 'Feb', 
    traditional: 3.8, 
    optimized: 5.2,
    lossTraditional: -1.2,
    lossOptimized: -0.2
  },
  { 
    month: 'Mar', 
    traditional: 5.2, 
    optimized: 6.5,
    lossTraditional: -0.5,
    lossOptimized: 0.0
  },
  { 
    month: 'Apr', 
    traditional: 4.8, 
    optimized: 6.8,
    lossTraditional: -0.9,
    lossOptimized: 0.1
  },
  { 
    month: 'May', 
    traditional: 5.1, 
    optimized: 7.2,
    lossTraditional: -0.6,
    lossOptimized: 0.3
  },
  { 
    month: 'Jun', 
    traditional: 4.9, 
    optimized: 7.5,
    lossTraditional: -1.1,
    lossOptimized: 0.4
  },
];

// Heatmap data for stockout risk
const heatmapData = [
  { x: 'Mon', y: 'Product A', value: 10 },
  { x: 'Mon', y: 'Product B', value: 30 },
  { x: 'Mon', y: 'Product C', value: 50 },
  { x: 'Tue', y: 'Product A', value: 20 },
  { x: 'Tue', y: 'Product B', value: 25 },
  { x: 'Tue', y: 'Product C', value: 45 },
  { x: 'Wed', y: 'Product A', value: 30 },
  { x: 'Wed', y: 'Product B', value: 40 },
  { x: 'Wed', y: 'Product C', value: 35 },
];

const DemandForecast = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 LSTM/GRU Demand Forecasting</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lstmData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="predicted" name="Predicted (LSTM/GRU)" stroke="#82ca9d" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <p>Using LSTM/GRU neural networks with 95% prediction accuracy</p>
      <p>Next 3 months forecast shows an 8.2% increase in demand</p>
    </div>
  </div>
);

const DynamicPricing = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">💰 Dynamic Pricing</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="price" name="Price ($)" />
          <YAxis type="number" dataKey="demand" name="Demand" />
          <ZAxis type="number" range={[100, 500]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Price Points" data={pricingData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <p>AI-powered dynamic pricing based on demand, inventory levels, and market conditions</p>
      <p>Current optimization: 12.5% increase in revenue</p>
    </div>
  </div>
);

const SupplierAnalytics = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚚 Supplier Lead Time Analysis</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={supplierData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="leadTime" name="Lead Time (days)" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="reliability" name="Reliability" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <p>AI analyzes historical delivery data to predict and optimize supplier lead times</p>
      <p>Recommended: Increase orders with Supplier C (98% reliability)</p>
    </div>
  </div>
);

const StockoutRisk = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔥 Stockout Risk Heatmap</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={heatmapData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="y" type="category" />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8">
            {heatmapData.map((item, index) => (
              <Cell key={`cell-${index}`} fill={item.value > 40 ? '#ff4d4f' : item.value > 20 ? '#faad14' : '#52c41a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <p>Heatmap showing stockout risk across products and days</p>
      <p>Red indicates high risk, yellow medium, green low risk</p>
    </div>
  </div>
);

const MonteCarloSimulation = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎲 Monte Carlo Simulation</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Demand" />
          <YAxis type="number" dataKey="y" name="Inventory" />
          <ZAxis type="number" dataKey="z" range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Simulations" data={monteCarloData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4 text-sm text-gray-600">
      <p>10,000 simulations of demand vs inventory levels</p>
      <p>95% confidence level for optimal reorder points</p>
    </div>
  </div>
);

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'simulation'>('dashboard');
  const [wsData, setWsData] = useState({
    inventory: 0,
    orders: 0,
    alerts: 0
  });

  useEffect(() => {
    const socket = initializeWebSocket();
    
    // Set up WebSocket listener
    const updateData = (data: typeof wsData) => {
      setWsData(data);
    };
    
    socket.on('update', updateData);
    
    // Initial data
    updateData({
      inventory: Math.floor(Math.random() * 1000),
      orders: Math.floor(Math.random() * 100),
      alerts: Math.floor(Math.random() * 10)
    });
    
    return () => {
      // Clean up WebSocket listener if needed
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold">{wsData.inventory}</div>
                <div className="text-sm opacity-90">Items in Stock</div>
                <div className="text-xs opacity-75 mt-1">Real-time updates</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold">{wsData.orders}</div>
                <div className="text-sm opacity-90">Orders Today</div>
                <div className="text-xs opacity-75 mt-1">+12% from yesterday</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold">{wsData.alerts}</div>
                <div className="text-sm opacity-90">Stock Alerts</div>
                <div className="text-xs opacity-75 mt-1">Needs attention</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Sales Performance</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" name="Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="predicted" name="Forecast" stroke="#82ca9d" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📦 Inventory Status</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {inventoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Profit & Loss Comparison (in $K)</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={profitComparisonData}
                      stackOffset="sign"
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Amount ($K)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name) => {
                          const displayName = name
                            .replace('OptimizedProfit', 'AI Optimized Profit')
                            .replace('TraditionalProfit', 'Traditional Profit')
                            .replace('OptimizedLoss', 'AI Optimized Loss')
                            .replace('TraditionalLoss', 'Traditional Loss');
                          return [`$${value}K`, displayName];
                        }} 
                        labelFormatter={(month) => `Month: ${month}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="optimized" 
                        name="OptimizedProfit" 
                        stackId="a" 
                        fill="#82ca9d" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="lossOptimized" 
                        name="OptimizedLoss" 
                        stackId="a" 
                        fill="#ff6b6b"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar 
                        dataKey="traditional" 
                        name="TraditionalProfit" 
                        stackId="b" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="lossTraditional" 
                        name="TraditionalLoss" 
                        stackId="b" 
                        fill="#ff9e7d"
                        radius={[0, 0, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#82ca9d] rounded-sm mr-2"></div>
                    <span>AI Optimized shows higher profits and lower losses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#8884d8] rounded-sm mr-2"></div>
                    <span>Traditional model has higher volatility and losses</span>
                  </div>
                  <div className="text-blue-600 font-medium">
                    AI Optimization reduces losses by 62% on average
                  </div>
                </div>
              </div>
              <StockoutRisk />
            </div>
          </>
        );
      case 'analytics':
        return (
          <div className="space-y-8">
            <DemandForecast />
            <DynamicPricing />
            <SupplierAnalytics />
          </div>
        );
      case 'simulation':
        return (
          <div className="space-y-8">
            <MonteCarloSimulation />
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🏭 3D Warehouse Visualization</h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <Warehouse3D />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Interactive 3D visualization of warehouse layout and inventory distribution</p>
                <p>Click and drag to rotate, scroll to zoom, right-click to pan</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">AI-Powered Inventory Optimization Platform</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === 'dashboard' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === 'analytics' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          📈 Analytics
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === 'simulation' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎲 Simulation
        </button>
      </div>

      {renderTabContent()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Demand Forecasting</h3>
          <p className="text-sm opacity-90">Predict future demand with 95% accuracy using our AI models</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Inventory Optimization</h3>
          <p className="text-sm opacity-90">Reduce carrying costs by up to 30% with smart inventory management</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
          <p className="text-sm opacity-90">Get instant insights with our powerful analytics dashboard</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔍 Advanced Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Key Metrics</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Inventory Turnover</span>
                <span className="font-medium">8.2x</span>
              </li>
              <li className="flex justify-between">
                <span>Stockout Rate</span>
                <span className="text-green-600">2.1%</span>
              </li>
              <li className="flex justify-between">
                <span>Carrying Cost</span>
                <span className="text-red-600">$12,450</span>
              </li>
              <li className="flex justify-between">
                <span>Order Accuracy</span>
                <span className="text-green-600">98.7%</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Performance Trends</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">📈 Data-Driven Decisions</h3>
            <p className="text-gray-600 mb-4">
              Leverage advanced analytics and machine learning to make informed inventory decisions that drive business growth.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">⚡ Real-time Insights</h3>
            <p className="text-gray-600 mb-4">
              Get instant visibility into your inventory performance with our intuitive dashboard and real-time reporting.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">🛠️ Advanced Features</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Automated reorder points</li>
              <li>Supplier performance tracking</li>
              <li>Seasonal demand prediction</li>
              <li>Multi-location inventory management</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">📱 Mobile Friendly</h3>
            <p className="text-gray-600">
              Access your inventory data anytime, anywhere with our fully responsive mobile interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
