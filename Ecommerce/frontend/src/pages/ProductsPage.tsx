import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Category, ProductSummary, PagedResponse } from '../types';
import { getCategories, getProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [pagedData, setPagedData] = useState<PagedResponse<ProductSummary> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';
  const selectedSort = searchParams.get('sort') || 'default';
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const [searchInput, setSearchInput] = useState<string>(searchKeyword);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Synchronize search input if URL changes
  useEffect(() => {
    setSearchInput(searchKeyword);
  }, [searchKeyword]);

  // Load products whenever query parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts({
          category: selectedCategory || undefined,
          search: searchKeyword || undefined,
          sort: selectedSort !== 'default' ? selectedSort : undefined,
          page: currentPage,
          size: 12,
        });
        setPagedData(data);
      } catch (err: unknown) {
        console.error('Failed to load products:', err);
        setError('Unable to fetch ThinkMart products from backend. Please verify that the API server is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchKeyword, selectedSort, currentPage]);

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 0 on any filter/search change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold text-purple tracking-widest uppercase">
          Explore Our Collection
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
          ThinkMart <span className="text-purple">Tech Catalogue</span>
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          Discover authentic electronics, gaming rigs, smartphones, and accessories curated for modern lifestyles.
        </p>
      </div>

      {/* Catalog Toolbar */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-line shadow-card space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => updateParam('category', null)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex-shrink-0 transition-all ${
              !selectedCategory
                ? 'bg-purple text-white shadow-sm'
                : 'bg-bg text-muted hover:text-ink hover:bg-lavender'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex-shrink-0 transition-all flex items-center gap-1.5 ${
                selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-purple text-white shadow-sm'
                  : 'bg-bg text-muted hover:text-ink hover:bg-lavender'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Search, Sort, and Clear Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-line/60">
          {/* Keyword Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter by keyword (e.g. MacBook, Ryzen)..."
              className="w-full pl-3.5 pr-9 py-2 bg-bg border border-line rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-purple"
              aria-label="Filter"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Sort Dropdown & Clear Filter */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5 text-xs text-muted font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={selectedSort}
              onChange={(e) => updateParam('sort', e.target.value === 'default' ? null : e.target.value)}
              className="bg-bg border border-line rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-purple/30"
              aria-label="Sort products"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
            </select>

            {(selectedCategory || searchKeyword || selectedSort !== 'default') && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-2 bg-red/10 hover:bg-red/20 text-red text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Counter Bar */}
      <div className="flex items-center justify-between text-xs text-muted font-medium px-1">
        <span>
          Showing {pagedData?.content.length || 0} of {pagedData?.totalElements || 0} products
        </span>
        <span className="hidden sm:inline">⚡ All products include 1-Year Official Brand Warranty</span>
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <LoadingSpinner text="Retrieving ThinkMart products..." />
      ) : error ? (
        <div className="bg-red/10 border border-red/20 text-red p-6 rounded-2xl text-center text-sm">
          {error}
        </div>
      ) : pagedData && pagedData.content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pagedData.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center space-y-4">
          <div className="text-5xl">🔍</div>
          <h3 className="font-heading font-bold text-lg text-ink">No matching products found</h3>
          <p className="text-muted text-sm max-w-md mx-auto">
            We couldn't find any items matching your selected category or search filters. Try clearing your search or checking another category.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-5 py-2.5 bg-purple text-white text-xs font-bold rounded-xl shadow-md hover:bg-purple-dark transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagedData && pagedData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={currentPage <= 0}
            onClick={() => updateParam('page', (currentPage - 1).toString())}
            className="p-2.5 rounded-xl border border-line bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pagedData.totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => updateParam('page', i.toString())}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                currentPage === i
                  ? 'bg-purple text-white shadow-sm'
                  : 'bg-surface border border-line text-muted hover:bg-bg'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= pagedData.totalPages - 1}
            onClick={() => updateParam('page', (currentPage + 1).toString())}
            className="p-2.5 rounded-xl border border-line bg-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

