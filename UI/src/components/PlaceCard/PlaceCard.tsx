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
import { forwardRef, useState } from 'react';

interface PlaceProps {
  name: string;
}

export const  PlaceSupCard = forwardRef<HTMLDivElement,PlaceProps>(

  ({ name }, ref) => {
  const [value, setValue] = useState('Proveedor');
  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >

    
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Typography component="div" variant="h4">
              {name}
            </Typography>
          
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
          </Box>
         
     
          
        </CardContent>
      </Box>
      
    </Card>
  );
}
)