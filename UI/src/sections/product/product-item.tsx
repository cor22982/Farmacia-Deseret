import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';
import { Product } from 'src/_mock/product';
import { Label } from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';
import { forwardRef } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from "@iconify/react"; 

// ----------------------------------------------------------------------

export type ProductItemProps = {
  product: Product;
};

export  const ProductItem = forwardRef<HTMLDivElement, ProductItemProps> (
  ({ product }, ref) => {
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
     {product.presentacion}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product.nombre}
      src={`data:image/jpeg;base64,${product.imagen}`}
      sx={{
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
      {fCurrency(product.pp)}</strong>
      
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.presentacion && renderStatus}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.nombre}
        </Link>

        <Box display="flex"  justifyContent="space-between" alignContent="center" alignItems="center">
          {/* <ColorPreview colors={product.colors} /> */}
          {renderPrice}
          <IconButton
          >
           <Icon icon="icon-park-outline:add" width="24" height="24" color='blue'/>
        </IconButton>
        </Box>

      </Stack>
    </Card>
  );
})
