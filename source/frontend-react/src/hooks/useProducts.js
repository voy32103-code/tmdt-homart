import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';

export function useProducts(selectedCategory = 'all', searchQuery = '') {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await productApi.getAll(params);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refreshProducts: fetchProducts };
}
