import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button, Chip } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Iconify } from 'src/components/iconify';

export default function SupplierCard() {
  

  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >

    
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Typography component="div" variant="h3">
              Nombre Proveedor
            </Typography>
            <Chip label="No Sistema" color="primary"/>
            <Chip label="Disponible" color="success"/>
          </Box>
         
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
              Direccion: 5ta calle C 59-65 Pinares del Norte
            </Typography>
           
            <Button
              startIcon={<Iconify icon="mdi:telephone" />}>
              <Typography variant='h6'>Telefono: 38731207</Typography>
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
              Proveedor Alternativo: Nombre Proveedor Alternativo
            </Typography>
           
            <Typography variant='h6'>
              Contacto: Nombre Contacto
            </Typography>
          </Box>
         <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
             Segundo Contacto: Info Segundo Contacto
            </Typography>
     
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'0.2rem' }} >
            <Iconify icon="mingcute:time-line" color="blue"/>
            <Typography variant='h5' color="blue">
             Horario: 
             Lunes a Viernes de 08:00:00 a 16:00:00
            </Typography>
          </Box>
          <br/>
          
        </CardContent>
      </Box>
      
    </Card>
  );
}
