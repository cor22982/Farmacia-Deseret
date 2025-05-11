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
import { ModalPresentacionProduct } from 'src/components/ModalForms/ModalPresentacionProduct';
import { ModalStepper } from 'src/components/Stepper/Add_Cantidades_Presentaciones';
import { ModalStepperProducto } from 'src/components/Stepper/Stepper_Producto';
import { ModalUploadAll } from 'src/components/ModalUploadAll/ModalUploadAll';
import { Supplier, useGetProveedores } from 'src/_mock/supplier';
import { MenuItem, Select } from '@mui/material';
import { ProductSearchItem } from './components/products_search';




// ----------------------------------------------------------------------

export function AddProductsView() {

  const [openm, setOpenM] = useState(false);
  const [openm3, setOpenM3] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [openPresentaciones, setOpenPresentaciones] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [valueProduct, setValueProduct] = useState(0);
  const {getProductInfo} = useGetProducts();
  const [product, setProductos] = useState<Product[]>([]);
  const [filterproduct, setFilterProductos] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [call1, setCall1] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSupliers] = useState<Supplier[]>([]);

  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [value_suplier, setValueSupplier] = useState(100000); 
  const { getProvedor_ById } = useGetProveedores();

  const [to_search, setTosearch] = useState('')


  const [openUpdate, setOpenUpdate] = useState(false);

  const updateOpen = (id:number) => {
    setValueProduct(id)
    setOpenUpdate(true)
  }

  const presentacionOpen = (id:number) => {
    setValueProduct(id)
    setOpenPresentaciones(true)
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
    const fetchSupplier = async () => {
        try {
          const fetchedSuppliers = await getProvedor_ById();
          setSupliers(fetchedSuppliers)
          
        
        } catch (error_t) {
          console.error("Error fetching places:", error_t);
        }
      };

    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProductInfo(offset, limit, '');
        setProductos(fetchedProducts);
        
          setFilterProductos(fetchedProducts);
          
       
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };
  
    fetchProducts();
    fetchSupplier();
  }, [offset, limit, call1, setCall1, setFilterProductos, setProductos]);
  

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleClicked = () => {
    setOpenM(false)
    setOpenPresentaciones(true)
  };

  const handleClicked_agregarProductos = (id:number) => {
    setValueProduct(id)
    setOpenM2(true)
  };


  const on_Search_Demand = async() => {
    setTosearch(searchValue)
    const fetchedProducts = await getProductInfo(offset, limit, searchValue);
    setProductos(fetchedProducts);
    
    setFilterProductos(fetchedProducts);


  }

  const on_search_supplier = async(n: string) => {
     setValueSupplier(Number(n))

     const fetchedProducts = await getProductInfo(offset, limit, n);
     setProductos(fetchedProducts);
    
     setFilterProductos(fetchedProducts);
  }


  const handleClicked2 = () => {
    setOpenM(true)
    setOpenM2(false)
  };
  return (
    <DashboardContent>
      {/* <ModalProduct
        setCall={setCall1}
        setValueProductId={setValueProduct}
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      /> */}

    
      <UpdateProduct
        setCall={setCall1}
        setValueProductId={setValueProduct}
        open={openUpdate}
        id_product={valueProduct}
        close={setOpenUpdate}
        handleClick={handleClicked}
        />
      {/* <ModalProductDetail
        setCall={setCall1}
        id={valueProduct}
        open={openm2}
        handleClose={() => setOpenM2(false)}
        handleClick={handleClicked2}
      /> */}

      <ModalStepperProducto
         id={valueProduct}
         setValueProductId={setValueProduct}
         open={openm}
         setCall={setCall1}
         handleClose={() => setOpenM(false)}
      />

      <ModalStepper
        setCall={setCall1}
        id_product={valueProduct}
        open={openm2}
        handleClick={handleClicked2}
        handleClose={() => setOpenM2(false)}
        />
      {/* <ModalPresentacionProduct
        setCall={setCall1}
        id={valueProduct}
        open={openPresentaciones}
        handleClose={() => setOpenPresentaciones(false)}
        handleClick={handleClicked2}
      /> */}
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

         
         
        

        </Box>
        
      </Box>
      <Box display="flex" alignItems="center" mb={5} gap='2rem'>
      <ProductSearchItem
        
        onSearch={handleSearch}
        onEnter={on_Search_Demand}
        products={product}/>


          <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#919191',
                    },
                    '&:hover fieldset': {
                      borderColor: '#262626',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#050505',
                      borderWidth: 2,
                    },
                  },
                }}
                value={value_suplier}
                onChange={(e) => on_search_supplier(String(e.target.value))}
              >
                <MenuItem value={100000}>
                  <em>Proveedor</em>
                </MenuItem>
                {suppliers.map((suplie) => (
                  <MenuItem value={suplie.id}>
                    <em>{suplie.nombre}</em>
                  </MenuItem>
                ))}
          </Select>
        
        
       
       
   
        </Box> 
                      {!loading && (
                        <Box display="flex" justifyContent="center" p={2} gap={2}>
                          <Button
                            variant="outlined"
                            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                            disabled={offset === 0 || loading}
                          >
                            Atrás
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => setOffset((prev) => prev + limit)}
                            disabled={!hasMore || loading}
                          >
                            Siguiente
                          </Button>
                        </Box>
                      )}
    {filterproduct.map((p) => (
        <Box sx={{paddingBottom: '1rem'}}>
            <ProductCard 
              openpresentacion={presentacionOpen}
              setid={handleClicked_agregarProductos}
              setCall={setCall1}
              setIdProduct={updateOpen}
              product={p}/>
          </Box>
        ))}  
    </DashboardContent>
  );
}
