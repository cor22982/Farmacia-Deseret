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
import { UpdateProduct } from 'src/components/ModalUpdateForms/UpdateProduct';
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
  const [filterproduct, setFilterProductos] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [call1, setCall1] = useState(0);

  const [openUpdate, setOpenUpdate] = useState(false);

  const updateOpen = (id:number) => {
    setValueProduct(id)
    setOpenUpdate(true)
  }

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const filtered = product.filter((p) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilterProductos(filtered);
    } else {
      setFilterProductos(product);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductInfo();
        setProductos(fetchedProducts)
        if (call1 === 0){
          setFilterProductos(fetchedProducts)
          setCall1(call1+1);
        }
      
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
 
    fetchProducts();
  }, [getProductInfo, setProductos, setCall1, setFilterProductos, call1 ]); 

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };

  const handleClicked_agregarProductos = (id:number) => {
    setValueProduct(id)
    setOpenM2(true)
  };




  const handleClicked2 = () => {
    setOpenM(true)
    setOpenM2(false)
  };
  return (
    <DashboardContent>
      <ModalProduct
        setCall={setCall1}
        setValueProductId={setValueProduct}
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      />
      <UpdateProduct
        setCall={setCall1}
        setValueProductId={setValueProduct}
        open={openUpdate}
        id_product={valueProduct}
        close={setOpenUpdate}
        handleClick={handleClicked}
        />
      <ModalProductDetail
        setCall={setCall1}
        id={valueProduct}
        open={openm2}
        handleClose={() => setOpenM2(false)}
        handleClick={handleClicked2}
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
      <ProductSearchItem
        
        onSearch={handleSearch}
        products={product}/>
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
    {filterproduct.map((p) => (
        <Box sx={{paddingBottom: '1rem'}}>
            <ProductCard 
              setid={handleClicked_agregarProductos}
              setCall={setCall1}
              setIdProduct={updateOpen}
              product={p}/>
          </Box>
        ))}  
    </DashboardContent>
  );
}
