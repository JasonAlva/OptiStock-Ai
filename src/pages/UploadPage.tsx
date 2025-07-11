import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Plus, Trash2, Download } from 'lucide-react';
import { useInventoryContext } from '../context/InventoryContext';
import { Product, InventoryConfig } from '../types/inventory';
import { parseCSV, generateSampleCSV } from '../utils/csvParser';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setConfig } = useInventoryContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadMethod, setUploadMethod] = useState<'csv' | 'manual'>('csv');
  const [products, setProducts] = useState<Product[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(500);
  const [optimizationDays, setOptimizationDays] = useState<number>(30);
  const [csvPreview, setCsvPreview] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        setCsvPreview(csvText);
        try {
          const parsedProducts = parseCSV(csvText);
          setProducts(parsedProducts);
        } catch (error) {
          alert('Error parsing CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_inventory_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const addManualProduct = () => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: '',
      initialStock: 0,
      costPerItem: 0,
      storageCostPerDay: 0,
      stockoutPenalty: 0,
      historicalDemand: []
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = () => {
    if (products.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const config: InventoryConfig = {
      products,
      maxWarehouseCapacity: maxCapacity,
      optimizationDays
    };

    setConfig(config);
    navigate('/optimizer');
  };

  const loadSampleData = () => {
    const sampleProducts: Product[] = [
      {
        id: 'widget-a',
        name: 'Widget A',
        initialStock: 100,
        costPerItem: 10.50,
        storageCostPerDay: 0.25,
        stockoutPenalty: 5.00,
        historicalDemand: [15, 18, 12, 20, 14, 16, 13, 19, 17, 15, 14, 18, 16, 12, 20]
      },
      {
        id: 'widget-b',
        name: 'Widget B',
        initialStock: 75,
        costPerItem: 25.00,
        storageCostPerDay: 0.50,
        stockoutPenalty: 12.00,
        historicalDemand: [8, 10, 12, 9, 11, 7, 13, 8, 10, 9, 11, 8, 12, 10, 9]
      },
      {
        id: 'gadget-x',
        name: 'Gadget X',
        initialStock: 200,
        costPerItem: 8.75,
        storageCostPerDay: 0.20,
        stockoutPenalty: 3.50,
        historicalDemand: [25, 30, 28, 32, 26, 29, 31, 27, 33, 28, 26, 30, 29, 27, 31]
      }
    ];
    setProducts(sampleProducts);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Inventory Data</h1>
          <p className="text-gray-600">
            Upload your inventory data via CSV file or enter it manually to get started with AI-powered optimization.
          </p>
        </div>

        {/* Upload Method Selection */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setUploadMethod('csv')}
              className={`pb-4 px-2 font-medium text-sm ${
                uploadMethod === 'csv'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              CSV Upload
            </button>
            <button
              onClick={() => setUploadMethod('manual')}
              className={`pb-4 px-2 font-medium text-sm ${
                uploadMethod === 'manual'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Manual Entry
            </button>
          </div>
        </div>

        {/* CSV Upload Section */}
        {uploadMethod === 'csv' && (
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
              <p className="text-gray-600 mb-4">
                Upload a CSV file with your inventory data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Choose File
                </button>
                <button
                  onClick={downloadSampleCSV}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download Sample
                </button>
              </div>
            </div>

            {csvPreview && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">CSV Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {csvPreview.split('\n').slice(0, 6).join('\n')}
                    {csvPreview.split('\n').length > 6 && '\n...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Section */}
        {uploadMethod === 'manual' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <div className="space-x-2">
                <button
                  onClick={loadSampleData}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={addManualProduct}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            {products.map((product, index) => (
              <div key={product.id} className="bg-gray-50 p-6 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      value={product.initialStock}
                      onChange={(e) => updateProduct(product.id, 'initialStock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Per Item ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.costPerItem}
                      onChange={(e) => updateProduct(product.id, 'costPerItem', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Cost Per Day ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.storageCostPerDay}
                      onChange={(e) => updateProduct(product.id, 'storageCostPerDay', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stockout Penalty ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={product.stockoutPenalty}
                      onChange={(e) => updateProduct(product.id, 'stockoutPenalty', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Historical Demand (comma separated)
                    </label>
                    <input
                      type="text"
                      value={product.historicalDemand.join(', ')}
                      onChange={(e) => updateProduct(product.id, 'historicalDemand', 
                        e.target.value.split(',').map(d => parseInt(d.trim()) || 0)
                      )}
                      placeholder="e.g., 15, 18, 12, 20, 14"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Configuration */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Warehouse Capacity
              </label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Optimization Duration (days)
              </label>
              <input
                type="number"
                value={optimizationDays}
                onChange={(e) => setOptimizationDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {products.length > 0 && (
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Products:</span>
                <span className="ml-2 text-blue-900">{products.length}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Total Initial Stock:</span>
                <span className="ml-2 text-blue-900">
                  {products.reduce((sum, p) => sum + p.initialStock, 0)}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Warehouse Capacity:</span>
                <span className="ml-2 text-blue-900">{maxCapacity}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Simulation Days:</span>
                <span className="ml-2 text-blue-900">{optimizationDays}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={products.length === 0}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Proceed to Optimization
          </button>
        </div>
      </div>
    </div>
  );
};