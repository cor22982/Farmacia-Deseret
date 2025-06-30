import { LinearProgress, Box, Button, MenuItem, Select, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Iconify } from 'src/components/iconify'
import { DashboardContent } from 'src/layouts/dashboard'
import { useGetProducts, Product } from 'src/_mock/product';
import { ProductAddCard } from 'src/components/ProductAddCard/ProductAddCard';
import { ModalUpdateProduct } from 'src/components/ModalsUser/ModalUpdateProduct';
import { Supplier, useGetProveedores } from 'src/_mock/supplier';
import useToken, { parseJwt } from 'src/hooks/useToken';
import { ProductSearchItem } from '../add_products/components/products_search';


export function AddProductUserView() {
  const {getProductInfo_whitout_info} = useGetProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [call1, setCall1] = useState(0);
  const [suppliers, setSupliers] = useState<Supplier[]>([]);
  const [valueProduct, setValueProduct] = useState<Product | null>(null);
  const [openUpdate , setOpenUpdate] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const { getProvedor_ById } = useGetProveedores();
  const [value_suplier, setValueSupplier] = useState(100000);
  const [isRendering, setIsRendering] = useState(true);
  
  const [buscar, setBuscar_valor] = useState('')


  const {token} = useToken()
  const jwt = token ? parseJwt(token) : null;
  const rol = jwt ? jwt.rol : null;


  
  

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const filtered = products.filter((p) =>
        p.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const openUpdate_function = (product:Product) => {
    setValueProduct(product)
    setOpenUpdate(true)
  }

  // useEffect para suppliers - se ejecuta una sola vez al montar el componente
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const fetchedSuppliers = await getProvedor_ById();
        setSupliers(fetchedSuppliers);
      } catch (error_t) {
        console.error("Error fetching suppliers:", error_t);
      }
    };

    fetchSupplier();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProvedor_ById]);

  // useEffect que maneja setIsRendering - solo cuando cambia 'buscar'
  useEffect(() => {
    const fetchProducts = async () => {
      setIsRendering(true);
      try {
        const fetchedproducts = await getProductInfo_whitout_info(buscar);
        setProducts(fetchedproducts);
        
        if (call1 === 0) {
          setFilteredProducts(fetchedproducts);
          setCall1(call1 + 1);
        } else {
          setFilteredProducts(fetchedproducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsRendering(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar]);

  // useEffect adicional para cuando cambien call1 o las funciones (sin loading)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedproducts = await getProductInfo_whitout_info(buscar);
        setProducts(fetchedproducts);
        
        if (call1 === 0) {
          setFilteredProducts(fetchedproducts);
          setCall1(call1 + 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call1, getProductInfo_whitout_info]);

  const on_searching = async() => {
    // Limpiar búsqueda por proveedor
    setValueSupplier(100000);
    setBuscar_valor(searchValue);
  }

  const on_search_supplier = async(n: string) => {
    setIsRendering(true);
    try {
      // Limpiar búsqueda por texto
      setSearchValue('');
      setBuscar_valor('');
      
      const fetchedproducts = await getProductInfo_whitout_info(n);
      setProducts(fetchedproducts);
      setFilteredProducts(fetchedproducts);
      setValueSupplier(Number(n));
    } catch (error) {
      console.error("Error fetching products by supplier:", error);
    } finally {
      setIsRendering(false);
    }
  }

  return ( 
    <DashboardContent>
       <Box display="flex" mb={5} flexDirection="column">
        <ModalUpdateProduct
          open={openUpdate}
          handleClose={()=>{setOpenUpdate(false)}}
          product={valueProduct}
          setCall={setCall1}
          />
        <Typography variant="h4" flexGrow={1}>
          Agregar Cantidades a Productos
        </Typography>
        <br/>
        <div style={{display: 'flex', gap: '2rem'}}>
          <ProductSearchItem
            onEnter={on_searching}
            onSearch={handleSearch}
            products={products}
            
          />
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
              <MenuItem key={suplie.id} value={suplie.id}>
                <em>{suplie.nombre}</em>
              </MenuItem>
            ))}
          </Select>
        </div>
        <br/>

        {isRendering ? (
          <LinearProgress />
        ) : (
          <Box>
            {filteredProducts.map((p) => (
              <Box key={p.id} sx={{paddingBottom: '1rem'}}>
                <ProductAddCard
                  openUpdate_function={openUpdate_function}
                  setCall={setCall1}
                  product={p}
                />
              </Box>
            ))} 
          </Box>
        )}
      </Box>
    </DashboardContent>
  )
}