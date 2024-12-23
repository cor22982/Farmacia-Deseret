import { Typography } from '@mui/material';
import React, { forwardRef, useState } from 'react';
import { Place } from 'src/_mock/places';


interface UbicacionesPrintListProps {
  lista : Place[]
}

export const UbicacionesPrintList = forwardRef<HTMLDivElement, UbicacionesPrintListProps>(
  ({ lista }, ref) => {

   
    const [pago_cantidad, setPago_cantidad] = useState<number | null>(null);

  
    return (
      <div ref={ref} style={{padding: '3rem'}}>
      {lista.map((ubicacio) => (
        <div>
        <Typography variant="h1" key={ubicacio.id}>
          {ubicacio.ubicacion}
        </Typography>
        <br/>
        </div>
      ))}
    </div>
    )
  }
);