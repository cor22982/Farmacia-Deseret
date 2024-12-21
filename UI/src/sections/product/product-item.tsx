import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useCarId from 'src/hooks/useIdProduct';
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { fCurrency } from 'src/utils/format-number';
import { Product } from 'src/_mock/product';
import { Label } from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';
import { forwardRef } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from "@iconify/react"; 
import Swal from "sweetalert2";
import { PresentacionProducto } from 'src/_mock/presentacion_producto';

// ----------------------------------------------------------------------

export type ProductItemProps = {
  product: Product;
  presentacion: PresentacionProducto;
  openProduct:  () => void;
  setProductSelected: (p:Product) => void;
  setPresentacionSelected: (ps: PresentacionProducto) => void;
};

export  const ProductItem = forwardRef<HTMLDivElement, ProductItemProps> (
  ({ product,  openProduct, setProductSelected,  presentacion, setPresentacionSelected }, ref) => {


  const onproduct = () => {
    openProduct()
    setProductSelected(product)
    setPresentacionSelected(presentacion)

  }
  const {carId, setCarId} = useCarId ();
  const {llamado} = useApi(`${source_link}/agregar_carrito`);

  const addtoCarrito = async()=>{
    const body = {opcion: 'uno' , carrito:carId, producto: product.id, presentacion: presentacion.id }
    const respuesta = await llamado(body, 'POST')
    console.log(respuesta)
    if (respuesta.success === false) {
      Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: respuesta.message,
                  });
    }
  }
  const renderStatus = (
    <Label
      variant="inverted"
      color='primary'
      sx={{
        zIndex: 9,
        top: 16,
        right: 16, 
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
     {presentacion.presentacion?.nombre} X {presentacion.cantidad_presentacion}
    </Label>
  );

  const renderImg = (
    <Box
      onClick={ onproduct}
      component="img"
      alt={product.nombre}
      src={`data:image/jpeg;base64,${product.imagen}`}
      sx={{
        cursor: 'pointer',
        top: 0,
        width: 1,
        height: 1,
       
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1" >
      <strong>&nbsp;
      {fCurrency(presentacion.pp)}</strong>
      
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.presentacion && renderStatus}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
      <Link
        color="inherit"
        underline="hover"
        variant="subtitle2"
        sx={{ whiteSpace: 'normal', wordBreak: 'break-word' ,  textAlign: 'center' }}
      >
        {product.nombre}
      </Link>

        <Box display="flex"  justifyContent="space-between" alignContent="center" alignItems="center">
          {/* <ColorPreview colors={product.colors} /> */}
          {renderPrice}
          <IconButton
            onClick={addtoCarrito }
          >
           <Icon icon="icon-park-outline:add" width="24" height="24" color='blue'/>
        </IconButton>
        </Box>

      </Stack>
    </Card>
  );
})
