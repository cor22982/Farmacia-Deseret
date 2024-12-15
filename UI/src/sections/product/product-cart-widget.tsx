import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Button, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type Props = BoxProps & {
  totalItems: number;
  precio: number;
  onOpenFilter: () => void;
  onSetCarrito: () => void;
};

export function CartIcon({ precio, onOpenFilter, onSetCarrito, totalItems, sx, ...other }: Props) {
  return (
    
    <Box
      component={RouterLink}
      href="#"
      sx={{
       
        right: 0,
        top: 80,
        gap: '1rem',
        zIndex: 999,
        display: 'flex',
        cursor: 'pointer',
        position: 'fixed',
        color: 'text.primary',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        bgcolor: 'background.paper',
        padding: (theme) => theme.spacing(1, 3, 1, 2),
        boxShadow: (theme) => theme.customShadows.dropdown,
        transition: (theme) => theme.transitions.create(['opacity']),
        '&:hover': { opacity: 0.72 },
        ...sx,
      }}
      {...other}
      
      
    >

      <Box 
        onClick={() =>  onOpenFilter()} 
        display="flex" 
        flexDirection="row" 
        gap="1rem"  sx={{
          '&:hover': {
            opacity: 0.5,
            filter: 'brightness(0.5)',
          },
        }}>
      <Badge showZero badgeContent={totalItems} color="error" max={99}>
        
        
        <Iconify icon="map:grocery-or-supermarket" width={24} />
     
      </Badge>
      <Typography variant='h5'>
      Total: Q {precio}
        </Typography>
        </Box>
        
        <Button onClick={() => {onSetCarrito()}}>
          Nueva Compra
          <Iconify icon="ph:plus-fill" width={24}/>
        </Button>
    </Box>
  );
}
