import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Search, Plus, Edit, Trash2, Upload, Link, Image as ImageIcon, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts } from "@/hooks/useProducts";
import { productApi } from "@/lib/api";
import { formatZMW } from "@/utils/currencyUtils";
import { uploadImage, deleteImage } from "@/utils/fileStorage";
import { Product, ProductFormData } from "@/types/product";
import { getAuthHeader } from '@/lib/api';

// Add pagination constants
const ITEMS_PER_PAGE = 10;

const ProductsAdmin = () => {
  // Use products hook to manage API calls
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    fetchProducts,
    pagination
  } = useProducts();

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [openDialogId, setOpenDialogId] = useState<null | string>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category: "",
    description: "",
    countInStock: "",
    sku: "",
    isFeatured: false,
    brand: "",
    rating: "0.0",
    ingredients: "",
    benefits: "",
    size: "",
    howToUse: "",
    images: [],
    mainImage: '',
  });
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "link">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // --- Add new state for multiple images ---
  const [imageFiles, setImageFiles] = useState<File[]>([]); // for local uploads
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // for previewing

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Load products on component mount, page change, or search term change
    fetchProducts({ 
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      keyword: debouncedSearchTerm
    });
  }, [fetchProducts, currentPage, debouncedSearchTerm]);

  const totalPages = pagination?.pages || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || "",
      description: product.description || "",
      countInStock: product.countInStock.toString(),
      sku: product.sku || "",
      isFeatured: product.isFeatured || false,
      brand: product.brand || "",
      rating: product.rating ? product.rating.toString() : "0.0",
      ingredients: product.ingredients || "",
      benefits: product.benefits || "",
      size: product.size || "",
      howToUse: product.howToUse || "",
      images: product.images || [],
      mainImage: product.mainImage || '',
    });
    setImagePreviews(product.images || []);
    setImageFiles([]);
    setOpenDialogId(product._id);
    
    // Set the appropriate mode based on product data
    setImageUploadMode("upload");
    setPreviewImage(product.mainImage || (product.images && product.images[0]) || null);
    setUploadedFile(null);
  };

  const handleOpenCreateDialog = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      countInStock: "",
      sku: "",
      isFeatured: false,
      brand: "",
      rating: "0.0",
      ingredients: "",
      benefits: "",
      size: "",
      howToUse: "",
      images: [],
      mainImage: '',
    });
    setImagePreviews([]);
    setImageFiles([]);
    setOpenDialogId("new");
    setImageUploadMode("upload");
    setPreviewImage(null);
    setUploadedFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update preview if URL changes
    if (name === "mainImage" && value) {
      setPreviewImage(value);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 12MB",
        variant: "destructive",
      });
      return;
    }

    // Store the file for later upload
    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Multi-image upload handler ---
  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 4) {
      toast({
        title: 'Error',
        description: 'You can upload up to 4 images.',
        variant: 'destructive',
      });
      return;
    }
    setIsImageUploading(true);
    try {
      // Upload to backend
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const res = await fetch('/api/upload/multiple', {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      const newUrls = data.imageUrls;
      setImagePreviews(prev => [...prev, ...newUrls]);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls],
        mainImage: prev.mainImage || newUrls[0],
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload images'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsImageUploading(false);
    }
  };

  // --- Remove image handler ---
  const handleRemoveImage = (url: string) => {
    setImagePreviews(prev => prev.filter(img => img !== url));
    setFormData(prev => {
      const newImages = (prev.images || []).filter(img => img !== url);
      let newMain = prev.mainImage;
      if (prev.mainImage === url) newMain = newImages[0] || '';
      return { ...prev, images: newImages, mainImage: newMain };
    });
  };

  // --- Main image selection handler ---
  const handleSelectMainImage = (url: string) => {
    setFormData(prev => ({ ...prev, mainImage: url }));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.countInStock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!formData.images || formData.images.length < 1 || formData.images.length > 4) {
      toast({
        title: 'Error',
        description: 'Please upload 1-4 images.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.mainImage || !formData.images.includes(formData.mainImage)) {
      toast({
        title: 'Error',
        description: 'Please select a main image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      let imageUrl = formData.mainImage; // Use mainImage directly

      // If we have a file to upload and we're in upload mode
      if (uploadedFile && imageUploadMode === "upload") {
        setIsImageUploading(true);
        try {
          // Upload the image first
          imageUrl = await uploadImage(uploadedFile);
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          setIsImageUploading(false);
          return;
        }
        setIsImageUploading(false);
      }

      // Prepare the product data for API
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        quantity: parseInt(formData.countInStock), // Map countInStock to quantity for backend
        countInStock: parseInt(formData.countInStock), // Keep countInStock for frontend consistency if needed
        image: imageUrl, // Use the uploaded image URL or existing URL
        brand: formData.brand,
        isFeatured: formData.isFeatured,
        sku: formData.sku,
        ingredients: formData.ingredients,
        benefits: formData.benefits,
        size: formData.size,
        howToUse: formData.howToUse,
        images: formData.images,
        mainImage: formData.mainImage,
      };

      if (selectedProduct) {
        // Update existing product
        await productApi.updateProduct(selectedProduct.id || selectedProduct._id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        await productApi.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      // Refresh the products list
      await fetchProducts({ 
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        keyword: debouncedSearchTerm
      });
      setOpenDialogId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
      console.error("Error saving product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    console.log("Deleting product with ID:", id);
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        setIsLoading(true);
        
        const productToDelete = products?.find(p => (p.id === id || p._id === id));
        
        await productApi.deleteProduct(id);
        
        if (productToDelete?.mainImage) {
          await deleteImage(productToDelete.mainImage);
        }
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        
        // Refresh the products list with pagination
        await fetchProducts({ 
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          keyword: debouncedSearchTerm
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
        });
        console.error("Error deleting product:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      mainImage: "",
    }));
    setUploadedFile(null);
  };

  // Add this before the return statement
  const renderPagination = () => {
    if (!products?.length || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span>
            {' '}-{' '}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, pagination?.totalProducts || 0)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{pagination?.totalProducts}</span>
            {' '}products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show first page, last page, current page, and pages around current
              return page === 1 || 
                     page === totalPages || 
                     Math.abs(page - currentPage) <= 1;
            })
            .map((page, index, array) => {
              // If there's a gap in the sequence, show ellipsis
              if (index > 0 && page - array[index - 1] > 1) {
                return (
                  <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? "bg-hello260-green hover:bg-hello260-green/90" : ""}
                >
                  {page}
                </Button>
              );
            })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
        <Button
          onClick={handleOpenCreateDialog}
          className="w-full sm:w-auto bg-hello260-green hover:bg-hello260-green/90 text-white"
        >
          <Plus size={16} className="mr-2" /> New Product
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        {productsLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-hello260-green" />
          </div>
        ) : productsError ? (
          <div className="p-8 text-center text-red-500">
            Failed to load products. Please try again.
          </div>
        ) : !products?.length ? (
          <div className="p-8 text-center text-gray-500">
            No products found. {searchTerm ? "Try a different search term." : ""}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-right py-3 px-4">Price</th>
                    <th className="text-right py-3 px-4">Stock</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id || product._id} className="border-b hover:bg-gray-50 block sm:table-row">
                      <td className="hidden sm:table-cell py-3 px-4 text-gray-500">
                        {product.sku || '-'}
                      </td>
                      <td className="py-3 px-4 block sm:table-cell">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-gray-100 mr-3 overflow-hidden">
                            {product.mainImage ? (
                              <img 
                                src={product.mainImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium block">{product.name}</span>
                            <div className="sm:hidden flex flex-col mt-1">
                              <span className="text-gray-500 text-xs">{product.sku || 'No SKU'}</span>
                              <span className="text-gray-600 text-xs capitalize">{product.category ? product.category.replace('-', ' ') : 'Uncategorized'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell py-3 px-4 capitalize">
                        {product.category ? product.category.replace('-', ' ') : 'Uncategorized'}
                      </td>
                      <td className="py-2 px-4 sm:py-3 sm:text-right sm:table-cell">
                        <div className="flex justify-between sm:block">
                          <span className="sm:hidden text-sm">Price:</span>
                          <span className="font-medium">{formatZMW(product.price)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4 sm:py-3 sm:text-right sm:table-cell">
                        <div className="flex justify-between sm:block">
                          <span className="sm:hidden text-sm">Stock:</span>
                          <span>{product.countInStock}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 sm:text-right block sm:table-cell">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenEditDialog(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit size={16} className="sm:mr-0" />
                            <span className="ml-1 sm:hidden">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id || product._id)}
                            className="text-red-500 hover:text-red-600"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 size={16} className="sm:mr-0" />
                            <span className="ml-1 sm:hidden">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* Product Edit/Create Dialog */}
      <Dialog open={openDialogId !== null} onOpenChange={(open) => !open && setOpenDialogId(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct 
                ? "Update the details of your existing product." 
                : "Fill in the details to create a new product."}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic">
            <TabsList className="w-full mb-4 sm:mb-6 grid grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name*</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (ZMW)*</label>
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock*</label>
                  <Input
                    name="countInStock"
                    type="number"
                    min="0"
                    value={formData.countInStock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category*</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                    aria-label="Product category"
                  >
                    <option value="">Select category</option>
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Supplements">Supplements</option>
                    <option value="First Aid">First Aid</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Brand</label>
                  <Input
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Product brand"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <Input
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <Input
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 30ml, 200g"
                  />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm">Featured Product</label>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                <Textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="List the ingredients used in this product"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Benefits</label>
                <Textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  placeholder="Describe the benefits of this product"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">How to Use</label>
                <Textarea
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleInputChange}
                  placeholder="Provide instructions on how to use this product"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Images (up to 4)</label>
                <div className="flex flex-wrap gap-4 mb-2">
                  {imagePreviews.map((url, idx) => (
                    <div key={url} className="relative group w-24 h-24">
                      <img
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className={`w-full h-full object-cover rounded border-2 ${formData.mainImage === url ? 'border-hello260-green' : 'border-gray-200'}`}
                        onClick={() => handleSelectMainImage(url)}
                        style={{ cursor: 'pointer' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                        aria-label="Remove image"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>
                      {formData.mainImage === url && (
                        <span className="absolute bottom-1 left-1 bg-hello260-green text-white text-xs px-2 py-0.5 rounded">Main</span>
                      )}
                    </div>
                  ))}
                  {imagePreviews.length < 4 && (
                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultiImageUpload}
                        className="hidden"
                        disabled={isImageUploading}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-400">Click an image to set as main. You can upload up to 4 images.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialogId(null)} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProduct} 
              className="w-full sm:w-auto bg-hello260-green hover:bg-hello260-green/90 text-white order-1 sm:order-2"
              disabled={isLoading || isImageUploading}
            >
              {isLoading || isImageUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isImageUploading ? "Uploading Image..." : "Saving..."}
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsAdmin;

