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

// ----------------------------------------------------------------------

export type ProductItemProps = {
  product: Product;
};

export  const ProductItem = forwardRef<HTMLDivElement, ProductItemProps> (
  ({ product }, ref) => {
  const renderStatus = (
    <Label
      variant="inverted"
      // color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {/* {product.status} */}
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
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.pp && fCurrency(product.pp)}
      </Typography>
      &nbsp;
      {fCurrency(product.pp)}
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {/* {product.status && renderStatus} */}

        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.nombre}
        </Link>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* <ColorPreview colors={product.colors} /> */}
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
})
