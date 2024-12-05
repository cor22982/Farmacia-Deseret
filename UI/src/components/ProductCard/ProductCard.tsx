import { useTheme } from '@mui/material/styles';
import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button } from '@mui/material';
import useToken from 'src/hooks/useToken';
import Grid from '@mui/material/Unstable_Grid2';
import { Product} from 'src/_mock/product';
import { Iconify } from 'src/components/iconify';

interface ProductCardProps {
  product: Product;
}

export const ProductCard =  forwardRef<HTMLDivElement, ProductCardProps> (
  
  ({ product }, ref) => {
    const {token} = useToken()
  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image="data:image/jpeg;base64,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"
        alt="Live from space album cover"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Typography component="div" variant="h5">
              Producto
            </Typography>
            <Typography component="div" variant="h5">
              PP: Q100.00
            </Typography>
            <Typography component="div" variant="h5">
              Proveedor
            </Typography>
            <Typography component="div" variant="h5">
              Presentacion
            </Typography>
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: 'text.secondary',
                maxWidth: 300,
                maxHeight: 200,
                overflowY: 'auto',
                whiteSpace: 'normal',
                textOverflow: 'ellipsis',
                textAlign: 'justify'
              }}
            >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
          </Typography>
          
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
            
            <Grid fontSize={6}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem'}} >
                <Typography variant="body2">Cantidad: 20</Typography>
                <Typography variant="body2">Fecha Vencimiento: 31/12/2024</Typography>
              </Box>
            </Grid>
            <Grid fontSize={6}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem'}} >
                <Typography variant="body2">Cantidad: 20</Typography>
                <Typography variant="body2">Fecha Vencimiento: 31/12/2024</Typography>
              </Box>
            </Grid>
            <Grid fontSize={6}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem'}} >
                <Typography variant="body2">Cantidad: 20</Typography>
                <Typography variant="body2">Fecha Vencimiento: 31/12/2024</Typography>
              </Box>
            </Grid>
          
          </Grid>     
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem' }} >
          <Button sx={{ bgcolor: 'red', '&:hover': { bgcolor: 'darkred' } }} variant="contained">
            Hacer una Oferta
          </Button>

          <Button
            startIcon={<Iconify icon="material-symbols:edit" />}
            >
            Editar
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:delete" />}
            >
            Eliminar
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:list" />}
            >
            Agregar nueva cantidad
          </Button>
            </Box>
        </CardContent>
      </Box>
      
    </Card>
  )}
)
