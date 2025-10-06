import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertCircle } from 'lucide-react';

const RFQForm = ({ product, initialData, onClose, onSuccess, isResponseForm = false }) => {
  const { currentUser, authToken } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_id: initialData?.product_id || product?.id || '',
    title: initialData?.title || product?.name || '',
    description: initialData?.description || product?.description || '',
    quantity: initialData?.quantity || '',
    budget_range_min: initialData?.budget_range_min || '',
    budget_range_max: initialData?.budget_range_max || '',
    response_deadline: initialData?.response_deadline || '',
    currency_id: initialData?.currency_id || 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Theme colors
  const bhagwa = "#f77f00";
  const cream = "#f6efe6";
  const creamCard = "#efe6d9";
  const darkText = "#5a4632";

  // Fetch all products and extract categories on component mount if no product is provided
  useEffect(() => {
    if (!product) {
      fetchAllProducts();
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: product.id,
        title: product.name,
        description: product.description || ''
      }));
    }
  }, [product]);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok) {
        setAllProducts(data);
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(data.map(product => product.category_name).filter(Boolean))];
        // Add "All Categories" option at the beginning
        setCategories(['All Categories', ...uniqueCategories]);
        setProducts(data); // Initially show all products
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    
    // Filter products by category
    if (category === 'All Categories' || category === '') {
      setProducts(allProducts);
    } else {
      const filteredProducts = allProducts.filter(product => product.category_name === category);
      setProducts(filteredProducts);
    }
    
    // Reset product selection
    setFormData(prev => ({
      ...prev,
      product_id: '',
      title: '',
      description: ''
    }));
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    
    if (!productId || productId === '') {
      setFormData(prev => ({
        ...prev,
        product_id: '',
        title: '',
        description: ''
      }));
      return;
    }
    
    // Convert to string for comparison since options are strings
    const selectedProduct = allProducts.find(p => p.id.toString() == productId);
    
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        product_id: selectedProduct.id, // Keep as original type
        title: selectedProduct.name || '',
        description: selectedProduct.description || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_id: '',
        title: '',
        description: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // If product is pre-selected, product_id might be a number, otherwise it's a string
    const productIdValue = formData.product_id;
    
    // More robust validation for product_id - handle both string and number types
    const hasValidProductId = productIdValue !== undefined && 
                             productIdValue !== null && 
                             productIdValue !== '' && 
                             !isNaN(Number(productIdValue)) && 
                             Number(productIdValue) > 0;
    
    if (!hasValidProductId) {
      return 'Product is required';
    }
    
    if (!formData.title || formData.title.trim() === '') {
      return 'Product title is required';
    }
    
    const quantityValue = formData.quantity;
    const hasValidQuantity = quantityValue !== undefined && 
                            quantityValue !== null && 
                            quantityValue.toString().trim() !== '' && 
                            !isNaN(Number(quantityValue)) && 
                            Number(quantityValue) > 0;
    
    if (!hasValidQuantity) {
      return 'Quantity is required and must be greater than 0';
    }
    
    // Validate budget range if both are provided
    if (formData.budget_range_min && formData.budget_range_max) {
      const min = parseFloat(formData.budget_range_min);
      const max = parseFloat(formData.budget_range_max);
      if (min > max) {
        return 'Minimum budget cannot be greater than maximum budget';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // Prepare data according to RFQ table schema - ensure proper type conversion
      const requestData = {
        product_id: parseInt(formData.product_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        budget_range_min: formData.budget_range_min ? parseFloat(formData.budget_range_min) : null,
        budget_range_max: formData.budget_range_max ? parseFloat(formData.budget_range_max) : null,
        response_deadline: formData.response_deadline || null,
        currency_id: formData.currency_id || 1
      };

      console.log('=== FORM SUBMISSION DEBUG INFO ===');
      console.log('Initial data:', initialData);
      console.log('Form data before validation:', JSON.stringify(formData, null, 2));
      console.log('Request data being sent:', JSON.stringify(requestData, null, 2));

      console.log('Submitting RFQ with data:', requestData);

      // Submit RFQ with authentication token
      const url = initialData ? `/api/buyer/rfqs/${initialData.id}` : '/api/buyer/rfqs';
      const method = initialData ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('RFQ submission response:', data);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RFQ');
      }

      setSuccess(true);
      
      // Handle success callback or default behavior
      if (onSuccess) {
        onSuccess(data.rfq);
      } else {
        // Close the form after a short delay
        setTimeout(() => {
          onClose();
          // Show success message
          const message = initialData 
            ? 'RFQ updated successfully! The seller will respond to your request soon.'
            : 'RFQ submitted successfully! The seller will respond to your request soon.';
          alert(message);
        }, 1500);
      }
    } catch (err) {
      console.error('RFQ submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: darkText }}>
              {initialData ? 'Edit Request for Quotation' : 'Request for Quotation'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: darkText }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 flex items-center" style={{ color: '#dc2626' }}>
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 flex items-center" style={{ color: '#16a34a' }}>
              <AlertCircle className="h-5 w-5 mr-2" />
              RFQ submitted successfully!
            </div>
          )}

          {/* Show category and product selection only if no product is pre-selected */}
          {!product && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                    Select Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    style={{ backgroundColor: "#fff", color: darkText }}
                  >
                    <option value="">Choose a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                    Select Product *
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.product_id.toString()}
                    onChange={handleProductChange}
                    style={{ backgroundColor: "#fff", color: darkText }}
                  >
                    <option value="">Choose a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
                style={{ backgroundColor: "#fff", color: darkText }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                {isResponseForm ? 'Message to Captain' : 'Description'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isResponseForm ? "Enter your message to the captain..." : "Enter product description"}
                style={{ backgroundColor: "#fff", color: darkText }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  required
                  min="1"
                  style={{ backgroundColor: "#fff", color: darkText }}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                  Response Deadline
                </label>
                <input
                  type="date"
                  name="response_deadline"
                  value={formData.response_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: "#fff", color: darkText }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                  Budget Range (Min)
                </label>
                <input
                  type="number"
                  name="budget_range_min"
                  value={formData.budget_range_min}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum budget"
                  min="0"
                  step="0.01"
                  style={{ backgroundColor: "#fff", color: darkText }}
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2" style={{ color: darkText }}>
                  Budget Range (Max)
                </label>
                <input
                  type="number"
                  name="budget_range_max"
                  value={formData.budget_range_max}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maximum budget"
                  min="0"
                  step="0.01"
                  style={{ backgroundColor: "#fff", color: darkText }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full font-semibold"
                style={{ backgroundColor: creamCard, color: darkText }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 rounded-full font-semibold"
                style={{ backgroundColor: bhagwa, color: "#fff" }}
                disabled={loading}
              >
                {loading ? (initialData ? 'Updating...' : 'Submitting...') : (initialData ? 'Update RFQ' : 'Submit RFQ')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RFQForm;