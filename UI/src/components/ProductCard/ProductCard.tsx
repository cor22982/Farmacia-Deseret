import { useTheme } from '@mui/material/styles';
import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button, Chip } from '@mui/material';
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
        image={`data:image/jpeg;base64,${product.imagen}`}
        alt="Live from space album cover"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignContent: 'center', alignItems: 'center' }}>
            
            <Typography component="div" variant="h3">
              {product.nombre}
            </Typography>
            <Chip label={`${product.presentacion.toUpperCase()}`} color="primary" />
            <Chip label={`Existencias: ${product.existencias}`} color="success"/>
            
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            
            <Typography component="div" variant="h5">
              PP: Q{product.pp}
            </Typography>
            <Typography component="div" variant="h5">
              Costo: Q{product.costo}
            </Typography>
            <Typography component="div" variant="h5">
              Proveedor: {product.proveedor?.nombre.toUpperCase()}
            </Typography>
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: 'text.secondary',
                maxWidth: 500,
                maxHeight: 200,
                overflowY: 'auto',
                whiteSpace: 'normal',
                textOverflow: 'ellipsis',
                textAlign: 'justify'
              }}
            >
            {product.descripcion_uso}
          </Typography>
          
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
            
          {product.listdetails.map((p) => (
            <Grid fontSize={6}>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem'}} >
                <Typography variant="body2">{p.getDetails_Products()}</Typography>
                <Typography variant="body2">{p.get_fechas()}</Typography>
              </Box>
            </Grid>
          ))}
           
            
          
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
