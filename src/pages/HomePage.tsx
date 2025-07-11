import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, DollarSign, BarChart3, Zap, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced Q-Learning algorithms continuously learn from your inventory patterns to make optimal restocking decisions.'
    },
    {
      icon: TrendingUp,
      title: 'Cost Optimization',
      description: 'Minimize storage costs, stockout penalties, and overstocking while maximizing profitability and efficiency.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards with real-time insights, comparison charts, and performance metrics.'
    },
    {
      icon: Zap,
      title: 'Real-time Decisions',
      description: 'Get instant recommendations for restocking actions based on current stock levels and demand patterns.'
    },
    {
      icon: DollarSign,
      title: 'ROI Tracking',
      description: 'Track your return on investment with detailed cost comparisons between AI and traditional strategies.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Reduce stockout risks while maintaining optimal inventory levels across all product categories.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-indigo-600 rounded-full">
                <Brain className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              OptiStock AI
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Revolutionize your inventory management with cutting-edge Reinforcement Learning. 
              Optimize costs, prevent stockouts, and maximize profitability with AI that learns from your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Now
              </Link>
              <Link
                to="/about"
                className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose OptiStock AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI system combines the power of reinforcement learning with intuitive design 
              to deliver unprecedented inventory optimization results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How OptiStock AI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our four-step process transforms your inventory management from reactive to predictive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Upload Data', description: 'Import your product data and historical demand patterns via CSV or manual input.' },
              { step: '02', title: 'AI Training', description: 'Our Q-Learning algorithm analyzes patterns and learns optimal restocking strategies.' },
              { step: '03', title: 'Optimization', description: 'Compare AI recommendations against traditional methods with detailed analytics.' },
              { step: '04', title: 'Implementation', description: 'Export results and implement AI-driven restocking decisions in your business.' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already saving costs and improving efficiency with OptiStock AI.
          </p>
          <Link
            to="/upload"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};