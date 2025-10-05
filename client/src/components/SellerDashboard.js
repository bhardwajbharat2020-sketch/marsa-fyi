import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Plus, X, Edit, Trash2, Eye, Camera, Upload } from 'lucide-react';
import '../App.css';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for add product modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    branded: 'branded',
    description: '',
    moq: '',
    moqUom: 'pcs',
    quantity: '',
    quantityUom: 'pcs',
    price: '',
    currency: 'USD',
    priceType: 'EXW',
    reLabeling: 'no',
    validityDate: '',
    validityTime: '',
    termsAccepted: false,
    image: null,
    imageUrl: ''
  });

  // State for product sections
  const [approvedProducts, setApprovedProducts] = useState([]);
  const [submittedProducts, setSubmittedProducts] = useState([]);
  const [ineffectiveProducts, setIneffectiveProducts] = useState([]);

  // State for image upload
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Theme colors to match homepage
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('/api/seller/products');
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok) {
          // Categorize products based on status
          const approved = productsData.filter(p => p.status === 'approved');
          const submitted = productsData.filter(p => p.status === 'submitted' || p.status === 'pending');
          const ineffective = productsData.filter(p => p.status === 'rejected' || p.status === 'expired');
          
          setApprovedProducts(approved);
          setSubmittedProducts(submitted);
          setIneffectiveProducts(ineffective);
        } else {
          console.error('Error fetching products:', productsData.error);
        }
        
        // Fetch orders
        const ordersResponse = await fetch('/api/seller/orders');
        const ordersData = await ordersResponse.json();
        
        if (ordersResponse.ok) {
          setOrders(ordersData);
        } else {
          console.error('Error fetching orders:', ordersData.error);
        }
        
        // Fetch RFQs
        const rfqsResponse = await fetch('/api/seller/rfqs');
        const rfqsData = await rfqsResponse.json();
        
        if (rfqsResponse.ok) {
          setRfqs(rfqsData);
        } else {
          console.error('Error fetching RFQs:', rfqsData.error);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes for new product form
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct(prev => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file)
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle camera capture (simulated)
  const handleCameraCapture = () => {
    // In a real app, this would access the device camera
    // For now, we'll simulate by allowing file upload
    document.getElementById('imageUpload').click();
  };

  // Handle add product form submission
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate terms acceptance
    if (!newProduct.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('branded', newProduct.branded);
      formData.append('description', newProduct.description);
      formData.append('moq', newProduct.moq);
      formData.append('moqUom', newProduct.moqUom);
      formData.append('quantity', newProduct.quantity);
      formData.append('quantityUom', newProduct.quantityUom);
      formData.append('price', newProduct.price);
      formData.append('currency', newProduct.currency);
      formData.append('priceType', newProduct.priceType);
      formData.append('reLabeling', newProduct.reLabeling);
      formData.append('validityDate', newProduct.validityDate);
      formData.append('validityTime', newProduct.validityTime);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }
      
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Add the new product to the submitted products list
        setSubmittedProducts(prev => [...prev, result.product]);
        
        // Reset form and close modal
        setNewProduct({
          name: '',
          category: '',
          branded: 'branded',
          description: '',
          moq: '',
          moqUom: 'pcs',
          quantity: '',
          quantityUom: 'pcs',
          price: '',
          currency: 'USD',
          priceType: 'EXW',
          reLabeling: 'no',
          validityDate: '',
          validityTime: '',
          termsAccepted: false,
          image: null,
          imageUrl: ''
        });
        setImagePreview(null);
        setShowAddProductModal(false);
        
        alert('Product submitted successfully for approval!');
      } else {
        alert('Failed to submit product: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error submitting product:', err);
      alert('Failed to submit product. Please try again.');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      rejected: { backgroundColor: '#f8d7da', color: '#721c24' },
      active: { backgroundColor: '#cce5ff', color: '#004085' },
      completed: { backgroundColor: '#d4edda', color: '#155724' },
      open: { backgroundColor: '#fff3cd', color: '#856404' },
      resolved: { backgroundColor: '#d4edda', color: '#155724' },
      submitted: { backgroundColor: '#cce5ff', color: '#004085' },
      expired: { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    
    const style = statusStyles[status.toLowerCase()] || statusStyles.pending;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={style}
      >
        {status}
      </span>
    );
  };

  // Product card component
  const ProductCard = ({ product, showActions = true }) => (
    <div 
      className="rounded-lg shadow-sm p-4 mb-4"
      style={{ backgroundColor: "#fff" }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold" style={{ color: darkText }}>{product.name}</h3>
          <p className="text-sm mt-1" style={{ color: "#7a614a" }}>{product.category}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="font-semibold" style={{ color: darkText }}>
          ${product.price} {product.currency || 'USD'}
        </span>
        {showActions && (
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
            >
              <Eye size={16} style={{ color: darkText }} />
            </button>
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
            >
              <Edit size={16} style={{ color: darkText }} />
            </button>
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: creamCard }}
            >
              <Trash2 size={16} style={{ color: darkText }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Seller Dashboard" role="seller">
      <div className="mb-6 flex flex-wrap gap-2 border-b" style={{ borderColor: "#d9cfc1" }}>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'products' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('products')}
          style={{ 
            color: activeTab === 'products' ? bhagwa : darkText,
            borderColor: activeTab === 'products' ? bhagwa : 'transparent'
          }}
        >
          My Products
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'orders' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('orders')}
          style={{ 
            color: activeTab === 'orders' ? bhagwa : darkText,
            borderColor: activeTab === 'orders' ? bhagwa : 'transparent'
          }}
        >
          Orders
        </button>
        <button 
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'rfqs' ? 'border-b-2' : ''
          }`}
          onClick={() => setActiveTab('rfqs')}
          style={{ 
            color: activeTab === 'rfqs' ? bhagwa : darkText,
            borderColor: activeTab === 'rfqs' ? bhagwa : 'transparent'
          }}
        >
          RFQs
        </button>
      </div>

      {loading && <div className="text-center py-10" style={{ color: darkText }}>Loading dashboard data...</div>}
      {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}
      
      {activeTab === 'products' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>My Products</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                onClick={() => setShowAddProductModal(true)}
                style={{ backgroundColor: bhagwa, color: "#fff" }}
              >
                <Plus size={16} />
                Add New Product
              </button>
            </div>
            
            {/* Approved Products Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Approved Products</h3>
              {approvedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No approved products found.
                </div>
              )}
            </div>
            
            {/* Submitted Products Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Submitted Products</h3>
              {submittedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submittedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No submitted products found.
                </div>
              )}
            </div>
            
            {/* Ineffective Products Section */}
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: darkText }}>Ineffective Products</h3>
              {ineffectiveProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ineffectiveProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6" style={{ color: darkText }}>
                  No ineffective products found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>Order ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{order.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{order.product}</td>
                      <td className="p-3" style={{ color: darkText }}>{order.quantity}</td>
                      <td className="p-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#2ecc71", color: "#fff" }}
                          >
                            Process
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No orders found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rfqs' && (
        <div>
          <div 
            className="rounded-xl shadow-sm p-6 mb-6"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ color: darkText }}>RFQs</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: creamCard }}>
                    <th className="text-left p-3" style={{ color: darkText }}>RFQ ID</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Product</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Quantity</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Status</th>
                    <th className="text-left p-3" style={{ color: darkText }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id} className="border-b" style={{ borderColor: "#d9cfc1" }}>
                      <td className="p-3" style={{ color: darkText }}>{rfq.id}</td>
                      <td className="p-3" style={{ color: darkText }}>{rfq.product}</td>
                      <td className="p-3" style={{ color: darkText }}>{rfq.quantity}</td>
                      <td className="p-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 rounded text-sm"
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                          >
                            Respond
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {rfqs.length === 0 && !loading && (
                <div className="text-center py-10" style={{ color: darkText }}>
                  No RFQs found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div 
            className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: darkText }}>Add New Product</h3>
                <button 
                  className="p-2 rounded-full"
                  onClick={() => setShowAddProductModal(false)}
                  style={{ backgroundColor: creamCard }}
                >
                  <X size={20} style={{ color: darkText }} />
                </button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Name/Version *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.name}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Product Category *
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.category}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>
                  
                  {/* Branded/Unbranded */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Branded/Unbranded *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="branded"
                          value="branded"
                          checked={newProduct.branded === 'branded'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Branded</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="branded"
                          value="unbranded"
                          checked={newProduct.branded === 'unbranded'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Unbranded</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* MOQ and UOM */}
                  <div>
                    <label htmlFor="moq" className="block mb-2 font-medium" style={{ color: darkText }}>
                      MOQ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="moq"
                        name="moq"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.moq}
                        onChange={handleProductInputChange}
                        min="0"
                      />
                      <select
                        name="moqUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.moqUom}
                        onChange={handleProductInputChange}
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="ltr">ltr</option>
                        <option value="mtr">mtr</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Available Quantity and UOM */}
                  <div>
                    <label htmlFor="quantity" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Available Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.quantity}
                        onChange={handleProductInputChange}
                        min="0"
                      />
                      <select
                        name="quantityUom"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.quantityUom}
                        onChange={handleProductInputChange}
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="ltr">ltr</option>
                        <option value="mtr">mtr</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Offer Price and Currency */}
                  <div>
                    <label htmlFor="price" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Offer Price *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.price}
                        onChange={handleProductInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                      <select
                        name="currency"
                        className="p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.currency}
                        onChange={handleProductInputChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Price Type */}
                  <div>
                    <label htmlFor="priceType" className="block mb-2 font-medium" style={{ color: darkText }}>
                      Price Type
                    </label>
                    <select
                      id="priceType"
                      name="priceType"
                      className="w-full p-3 rounded-lg border"
                      style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                      value={newProduct.priceType}
                      onChange={handleProductInputChange}
                    >
                      <option value="EXW">EXW</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="DDP">DDP</option>
                    </select>
                  </div>
                  
                  {/* Re-labeling Option */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Re-labeling Option
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reLabeling"
                          value="yes"
                          checked={newProduct.reLabeling === 'yes'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="reLabeling"
                          value="no"
                          checked={newProduct.reLabeling === 'no'}
                          onChange={handleProductInputChange}
                          className="mr-2"
                        />
                        <span style={{ color: darkText }}>No</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Offer Validity */}
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: darkText }}>
                      Offer Validity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="validityDate"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.validityDate}
                        onChange={handleProductInputChange}
                      />
                      <input
                        type="time"
                        name="validityTime"
                        className="w-full p-3 rounded-lg border"
                        style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                        value={newProduct.validityTime}
                        onChange={handleProductInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block mb-2 font-medium" style={{ color: darkText }}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full p-3 rounded-lg border"
                    style={{ borderColor: "#d9cfc1", backgroundColor: "#fff", color: darkText }}
                    value={newProduct.description}
                    onChange={handleProductInputChange}
                    rows="4"
                    required
                  ></textarea>
                  <p className="text-sm mt-1" style={{ color: "#7a614a" }}>
                    * No contact details allowed in description
                  </p>
                </div>
                
                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block mb-2 font-medium" style={{ color: darkText }}>
                    Product Image
                  </label>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg" 
                    style={{ borderColor: "#d9cfc1", backgroundColor: creamCard }}>
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                        <button 
                          type="button"
                          className="absolute top-2 right-2 p-1 rounded-full"
                          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                          onClick={() => {
                            setImagePreview(null);
                            setNewProduct(prev => ({ ...prev, image: null, imageUrl: '' }));
                          }}
                        >
                          <X size={16} style={{ color: "#fff" }} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera size={48} style={{ color: darkText, marginBottom: '1rem' }} />
                        <p className="text-center mb-4" style={{ color: darkText }}>
                          Take a photo or upload an image
                        </p>
                        <div className="flex gap-3">
                          <button 
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                            onClick={handleCameraCapture}
                            style={{ backgroundColor: bhagwa, color: "#fff" }}
                          >
                            <Camera size={16} />
                            Camera
                          </button>
                          <button 
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                            style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                          >
                            <Upload size={16} />
                            Upload
                            <input
                              id="imageUpload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm mt-2" style={{ color: "#7a614a" }}>
                    Image will be stamped with date/time/latitude/longitude automatically
                  </p>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={newProduct.termsAccepted}
                      onChange={handleProductInputChange}
                      className="mt-1 mr-2"
                      required
                    />
                    <span style={{ color: darkText }}>
                      I accept the Survey Terms & Conditions *
                    </span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded-lg font-medium"
                    onClick={() => setShowAddProductModal(false)}
                    style={{ backgroundColor: "#fff", color: darkText, border: "1px solid #d9cfc1" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: bhagwa, color: "#fff" }}
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboard;