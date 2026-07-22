import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import VehicleModal from '../components/VehicleModal.jsx';
import {
  Search,
  Filter,
  Plus,
  ShoppingBag,
  Trash2,
  Edit2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Inline Restock quantities state
  const [restockQuantities, setRestockQuantities] = useState({});

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      // Build search query params
      const params = {};
      if (searchTerm) {
        params.make = searchTerm; // Matches either make or model in our custom logic
      }
      if (searchCategory) {
        params.category = searchCategory;
      }
      if (minPrice) {
        params.minPrice = minPrice;
      }
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }

      // If any search parameter is present, we call the search endpoint.
      // Else, we fetch all vehicles.
      const hasQueryParams = searchTerm || searchCategory || minPrice || maxPrice;
      const endpoint = hasQueryParams ? '/vehicles/search' : '/vehicles';
      
      const res = await api.get(endpoint, { params });
      setVehicles(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve vehicle inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchTerm, searchCategory, minPrice, maxPrice]);

  const handlePurchase = async (id) => {
    try {
      await api.post(`/vehicles/${id}/purchase`);
      // Update inventory list locally
      setVehicles(prev =>
        prev.map(v => (v.id === id ? { ...v, quantity: v.quantity - 1 } : v))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete purchase.');
    }
  };

  const handleRestock = async (e, id) => {
    e.preventDefault();
    const qty = Number(restockQuantities[id]);
    if (!qty || qty <= 0) {
      alert('Please enter a restock quantity greater than 0.');
      return;
    }

    try {
      const res = await api.post(`/vehicles/${id}/restock`, { quantity: qty });
      // Update local state
      setVehicles(prev =>
        prev.map(v => (v.id === id ? { ...v, quantity: res.data.quantity } : v))
      );
      // Clear input
      setRestockQuantities(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to restock vehicle.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from inventory?')) {
      return;
    }

    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete vehicle.');
    }
  };

  const openAddModal = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleRestockQtyChange = (id, val) => {
    setRestockQuantities(prev => ({ ...prev, [id]: val }));
  };

  // Unique categories for the dropdown filter
  const categories = ['Sedan', 'SUV', 'Coupe', 'Truck', 'Hatchback', 'Electric', 'Convertible'];

  // Default vehicle card placeholders if imageUrl not set
  const getPlaceholderImage = (make) => {
    const brand = make.toLowerCase();
    if (brand.includes('tesla') || brand.includes('electric')) {
      return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'; // EV
    }
    if (brand.includes('porsche') || brand.includes('ferrari') || brand.includes('corvette')) {
      return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'; // Sports Car
    }
    if (brand.includes('ford') || brand.includes('jeep') || brand.includes('toyota')) {
      return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'; // SUV/Truck
    }
    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800'; // Luxury Sedan
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Dealership Fleet</h2>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and manage our premium vehicle inventory.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="glass rounded-3xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by make or model..."
              className="block w-full pl-12 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`flex items-center justify-center space-x-2 w-full md:w-auto px-5 py-3 border rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                isFilterExpanded
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isFilterExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchCategory('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="px-5 py-3 text-sm font-semibold bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {isFilterExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800/60 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                <option value="" className="bg-slate-950">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-950">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Min Price (USD)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Max Price (USD)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 80000"
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-400 text-sm mt-4 font-medium">Loading fleet database...</p>
        </div>
      ) : error ? (
        <div className="glass border border-red-500/20 bg-red-500/5 p-6 rounded-3xl text-center">
          <p className="text-red-400 font-semibold">{error}</p>
          <button
            onClick={fetchVehicles}
            className="mt-4 px-5 py-2.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl">
          <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-white mb-1">No Vehicles Found</h4>
          <p className="text-sm text-slate-500">
            We couldn't find any vehicles matching your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => {
            const isOutOfStock = v.quantity <= 0;
            return (
              <div
                key={v.id}
                className="glass rounded-3xl overflow-hidden group hover:border-slate-700 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={v.imageUrl || getPlaceholderImage(v.make)}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                      {v.category}
                    </span>
                  </div>
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Admin controls floating */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(v)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-xl shadow-lg transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {v.make} <span className="font-light text-slate-300">{v.model}</span>
                      </h3>
                      <span className="text-lg font-extrabold text-teal-400">
                        ${v.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-500'
                            : v.quantity <= 2
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span className="text-xs text-slate-400 font-medium">
                        {isOutOfStock
                          ? 'Out of Stock'
                          : `${v.quantity} units available`}
                      </span>
                    </div>
                  </div>

                  {/* Footer Action area */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-4">
                    {/* User purchase button */}
                    {!isAdmin && (
                      <button
                        onClick={() => handlePurchase(v.id)}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white hover:shadow-indigo-500/20'
                        }`}
                      >
                        <ShoppingBag className="w-4.5 h-4.5" />
                        <span>{isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}</span>
                      </button>
                    )}

                    {/* Admin restocking bar */}
                    {isAdmin && (
                      <form
                        onSubmit={(e) => handleRestock(e, v.id)}
                        className="flex space-x-2"
                      >
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={restockQuantities[v.id] || ''}
                          onChange={(e) => handleRestockQtyChange(v.id, e.target.value)}
                          className="w-20 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                        <button
                          type="submit"
                          className="flex-grow flex items-center justify-center space-x-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selectedVehicle}
        onSaveSuccess={fetchVehicles}
      />
    </div>
  );
};

export default Dashboard;
