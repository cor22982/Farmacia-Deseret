import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { ModalProductShow } from 'src/components/ModalProductShow/ModalProductShow';
import { _products } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { Product, useGetProducts } from 'src/_mock/product';
import useProductId from 'src/hooks/useIdProduct';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCarrito } from 'src/_mock/carrito';
import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';
import { ProductFilters } from '../product-filters';

import type { FiltersProps } from '../product-filters';


// ----------------------------------------------------------------------

const GENDER_OPTIONS = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'shose', label: 'Shose' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
];

const RATING_OPTIONS = ['up4Star', 'up3Star', 'up2Star', 'up1Star'];

const PRICE_OPTIONS = [
  { value: 'below', label: 'Below $25' },
  { value: 'between', label: 'Between $25 - $75' },
  { value: 'above', label: 'Above $75' },
];

const COLOR_OPTIONS = [
  '#00AB55',
  '#000000',
  '#FFFFFF',
  '#FFC0CB',
  '#FF4842',
  '#1890FF',
  '#94D82D',
  '#FFC107',
];

const defaultFilters = {
  price: '',
  gender: [GENDER_OPTIONS[0].value],
  colors: [COLOR_OPTIONS[4]],
  rating: RATING_OPTIONS[0],
  category: CATEGORY_OPTIONS[0].value,
};

export function ProductsView() {
  const {getProductInfo_whitout} = useGetProducts();

  const [sortBy, setSortBy] = useState('featured');

  const [openFilter, setOpenFilter] = useState(false);

  const [openProducts, setOpenProducts] = useState(false);

  const {carId, setCarId} = useProductId();

  const {newCarrito} = useCarrito();

  const [idProduct, setIdProduct] = useState(0);

  const [filters, setFilters] = useState<FiltersProps>(defaultFilters);

  const [product_geted, setProductos] = useState<Product[]>([]);

  const onSetCarrito = async() => {
    const respuesta_id = await newCarrito();
    setCarId(respuesta_id)
  }
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductInfo_whitout();
        setProductos(fetchedProducts);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
  
    fetchProducts();
  }, [getProductInfo_whitout, setProductos]);

  const handleOpenFilter = useCallback(() => {
    setOpenFilter(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setOpenFilter(false);
  }, []);

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleSetFilters = useCallback((updateState: Partial<FiltersProps>) => {
    setFilters((prevValue) => ({ ...prevValue, ...updateState }));
  }, []);

  const canReset = Object.keys(filters).some(
    (key) => filters[key as keyof FiltersProps] !== defaultFilters[key as keyof FiltersProps]
  );

  return (
    <DashboardContent>
      <ModalProductShow
        open={openProducts}
        handleClose={() => {setOpenProducts(false)}}
      />
      <Typography variant="h4" sx={{ mb: 5 }}>
        Farmacia Deseret
      </Typography>


      
     
        <CartIcon
        onSetCarrito={onSetCarrito} 
        onOpenFilter={handleOpenFilter}
          precio={100.5}
          totalItems={8} />
  
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <Box gap={1} display="flex" flexShrink={0} sx={{ my: 1 }}>
          <ProductFilters
            canReset={canReset}
            filters={filters}
            onSetFilters={handleSetFilters}
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            onResetFilter={() => setFilters(defaultFilters)}
            options={{
              genders: GENDER_OPTIONS,
              categories: CATEGORY_OPTIONS,
              ratings: RATING_OPTIONS,
              price: PRICE_OPTIONS,
              colors: COLOR_OPTIONS,
            }}
          />

          <ProductSort
            sortBy={sortBy}
            onSort={handleSort}
            options={[
              { value: 'caja', label: 'Caja' },
              { value: 'blister', label: 'Blister' },
              { value: 'unidades', label: 'Unidades' },
              
            ]}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {product_geted.map((product) => (
          <Grid key={product.id} xs={12} sm={6} md={3}>
            <ProductItem 
               openProduct={()=>{setOpenProducts(true)} }
              product={product} />
          </Grid>
        ))}
      </Grid>

      <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}
