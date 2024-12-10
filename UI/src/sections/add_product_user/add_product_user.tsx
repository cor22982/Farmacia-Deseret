import { Box, Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Iconify } from 'src/components/iconify'
import { DashboardContent } from 'src/layouts/dashboard'
import { useGetProducts, Product } from 'src/_mock/product';
import { ProductAddCard } from 'src/components/ProductAddCard/ProductAddCard';
import { ModalUpdateProduct } from 'src/components/ModalsUser/ModalUpdateProduct';
import { ProductSearchItem } from '../add_products/components/products_search';

export function AddProductUserView() {
  const {getProductInfo_whitout_info} = useGetProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [call1, setCall1] = useState(0);
  const [valueProduct, setValueProduct] = useState<Product | null>(null);
  const [openUpdate , setOpenUpdate] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  
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
    const fetchProducts = async () => {
      try {
        const fetchedproducts = await getProductInfo_whitout_info();
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
  }, [getProductInfo_whitout_info, setProducts, call1, setCall1, setFilteredProducts]); 
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
        <ProductSearchItem
        
        onSearch={handleSearch}
        products={products}/>
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