import { Box, Button, MenuItem, Select, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Iconify } from 'src/components/iconify'
import { DashboardContent } from 'src/layouts/dashboard'
import { useGetProducts, Product } from 'src/_mock/product';
import { ProductAddCard } from 'src/components/ProductAddCard/ProductAddCard';
import { ModalUpdateProduct } from 'src/components/ModalsUser/ModalUpdateProduct';
import { Supplier, useGetProveedores } from 'src/_mock/supplier';
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
        // const fetchedSuppliers = await getProvedor_ById();
        // setSupliers(fetchedSuppliers)
        const fetchedproducts = await getProductInfo_whitout_info('');
        setProducts(fetchedproducts);
        if (call1 === 0){
          setFilteredProducts(fetchedproducts)
          setCall1(call1+1);
        }        
      
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchProducts();
    fetchSupplier()
  }, [call1]); 


  const on_searching = async() => {
    const fetchedproducts = await getProductInfo_whitout_info(searchValue);
    setProducts(fetchedproducts);
    setFilteredProducts(fetchedproducts)
  }

  const on_search_supplier = async(n: string) => {

    const fetchedproducts = await getProductInfo_whitout_info(n);
    setProducts(fetchedproducts);
    setFilteredProducts(fetchedproducts)
    setValueSupplier(Number(n))


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
          products={products}/>
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
        </div>
        <br/>
        {filteredProducts.map((p) => (
        <Box sx={{paddingBottom: '1rem'}}>
            <ProductAddCard
              openUpdate_function={openUpdate_function }
              setCall={setCall1}
              product={p}/>
          </Box>
        ))} 
      </Box>
    </DashboardContent>

  )
}