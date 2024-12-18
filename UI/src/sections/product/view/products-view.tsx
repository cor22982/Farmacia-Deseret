import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { ModalProductShow } from 'src/components/ModalProductShow/ModalProductShow';
import { _products } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { Product, useGetProducts } from 'src/_mock/product';
import useCarId  from 'src/hooks/useIdProduct';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCarrito , Carrito} from 'src/_mock/carrito';
import { ProductSearchItem } from 'src/sections/add_products/components/products_search';
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
  const {getProductInfo_whitout_info} = useGetProducts();

  const [sortBy, setSortBy] = useState('featured');

  const [openFilter, setOpenFilter] = useState(false);

  const [openProducts, setOpenProducts] = useState(false);

  const {carId, setCarId} = useCarId ();

  const {newCarrito, getCarrito_byId} = useCarrito();

  const [micarrito, setMiCarrito] = useState<Carrito | null>(null)

  const [idProduct, setIdProduct] = useState(0);

  const [filters, setFilters] = useState<FiltersProps>(defaultFilters);

  const [product_geted, setProductos] = useState<Product[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');

  const [filterproduct, setFilterProductos] = useState<Product[]>([]);

  const [call1, setCall1] = useState(0);

  const [product_selected, setProductSelected] = useState<Product| null>(null)

  const onSetCarrito = async() => {
    const respuesta_id = await newCarrito();
    setCarId(respuesta_id)
  }

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const filtered = product_geted.filter((p) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilterProductos(filtered);
    } else {
      setFilterProductos(product_geted);
    }
  };
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductInfo_whitout_info();
        if (carId !== null) {
          try{
          const carrito =  await getCarrito_byId(carId)
          setMiCarrito(carrito)
        }catch(err){
          console.log(err)
        }
        }
        if (call1 === 0){
          setFilterProductos(fetchedProducts)
          setCall1(call1+1);
        }
        setProductos(fetchedProducts);
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
   // console.log(product_geted)
    fetchProducts();
  }, [getProductInfo_whitout_info, setProductos, carId, getCarrito_byId, setMiCarrito, call1, product_geted]);

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
        product={product_selected}
        open={openProducts}
        handleClose={() => {setOpenProducts(false)}}
      />
      <Typography variant="h4" sx={{ mb: 5 }}>
        Farmacia Deseret
      </Typography>
      <Box>
        <Button variant='contained' color='success'
         startIcon={<Iconify icon="tdesign:money" />}>
          Pagar Carrito
        </Button>
      </Box>
      <br />
      
     
     
        <CartIcon
          isCarrito={!!micarrito}
          onSetCarrito={onSetCarrito} 
          onOpenFilter={handleOpenFilter}
          precio={micarrito !== null ? micarrito.total : 0.0}
          totalItems={ micarrito !== null ? micarrito.cantidad_total !== null ? micarrito.cantidad_total : 0 : 0} />
  
      <ProductFilters
            micarrito={micarrito}
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
    <Box  display="flex">
      <Box display="flex" justifyContent="flex-start" >
            <ProductSearchItem
            
            onSearch={handleSearch}
            products={product_geted}/>
          </Box>        
    

        <Box display="flex" ml="auto">


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
      <br/>
      <Grid container spacing={3}>
        {filterproduct.map((product) => (
          <Grid key={product.id} xs={12} sm={6} md={3}>
            <ProductItem
              setProductSelected = {setProductSelected} 
               openProduct={()=>{setOpenProducts(true)} }
              product={product} />
          </Grid>
        ))}
      </Grid>

      <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}
