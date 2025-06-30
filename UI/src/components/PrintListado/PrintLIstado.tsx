import { Typography } from '@mui/material';
import React, { forwardRef, useState } from 'react';
import { Product } from 'src/_mock/product';


interface ProductPrintListProps {
  lista : Product[]
}
export const PrintListado = forwardRef<HTMLDivElement, ProductPrintListProps>(
  ({ lista }, ref) => (
    <div ref={ref} style={{ padding: '3rem' }}>
      {lista.map((product) => (
        <div key={product.id}>
          <Typography variant="h5">
            {product.nombre}
          </Typography>

          Proveedor : 
          <Typography variant="h5">
            {product.proveedor?.nombre}
          </Typography>
          <br />
        </div>
      ))}
    </div>
  )
);
