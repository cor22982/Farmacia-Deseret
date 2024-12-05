import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { SimpleLayout } from 'src/layouts/simple';
import { Iconify } from 'src/components/iconify';
import { useState, useCallback, useEffect } from 'react';
import {ProductCard} from 'src/components/ProductCard/ProductCard';
import { ModalProduct } from 'src/components/ModalForms/ModalProduct';
import { useGetProducts, Product } from 'src/_mock/product';
import { ModalProductDetail } from 'src/components/ModalForms/ModalProductDetail';
import { ProductsFilterList } from './components/products_filter_list';
import { ProductSearchItem } from './components/products_search';

// ----------------------------------------------------------------------

export function AddProductsView() {

  const [openm, setOpenM] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [valueProduct, setValueProduct] = useState(0);
  const {getProductInfo} = useGetProducts();
  const [product, setProductos] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductInfo();
        setProductos(fetchedProducts)
        
      
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
 
    fetchProducts();
  }, [getProductInfo, setProductos ]); 

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };
  return (
    <DashboardContent>
      <ModalProduct
        setValueProductId={setValueProduct}
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      />
      <ModalProductDetail
        id={valueProduct}
        open={openm2}
        handleClose={() => setOpenM2(false)}
        handleClick={handleClicked}
      />
      <Box display="flex" alignItems="center" mb={5}>
        
        <Typography variant="h4" flexGrow={1}>
          Productos de la Farmacia
        </Typography>
        <Box display="flex" flexDirection="row" gap="20px">
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenM(true)}
          >
          Agregar nuevo Producto
          </Button>
         
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="ep:list" />}
          >
          Generar Listado
          </Button>

        </Box>
        
      </Box>
      <Box display="flex" alignItems="center" mb={5} gap='2rem'>
      <ProductSearchItem/>
        <Box display="flex" alignItems= 'center' flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
            Proveedor
          </Typography>
          <ProductsFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
        </Box>
        
        <Box display="flex"  flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
           Fecha de Vencimiento
          </Typography>
          <ProductsFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
            
        </Box>
        <Box display="flex" alignItems= 'center' flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
           Presentacion
          </Typography>
          <ProductsFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
        </Box>
   
        </Box>
    {product.map((p) => (
        <Box sx={{paddingBottom: '1rem'}}>
            <ProductCard product={p}/>
          </Box>
        ))}
    </DashboardContent>
  );
}
