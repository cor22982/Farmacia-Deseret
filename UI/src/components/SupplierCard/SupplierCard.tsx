import { useTheme } from '@mui/material/styles';
import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button, Chip } from '@mui/material';
import { Supplier } from 'src/_mock/supplier';
import Grid from '@mui/material/Unstable_Grid2';
import { Iconify } from 'src/components/iconify';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {obtenerDiaDeLaSemana, diasDeLaSemana } from 'src/_mock/days';

interface SupplierCardProps {
  suplier: Supplier;
}

export const SupplierCard = forwardRef<HTMLDivElement,SupplierCardProps> (
  ({ suplier }, ref) => {
  const [value_suplier, setValueSupplier] = useState(100000); 
  
  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >

    
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <Typography component="div" variant="h3">
              {suplier.nombre.toUpperCase()}
            </Typography>
            <Chip label={`Tipo: ${suplier.tipo}`} color="primary" />
            {
              suplier.estadisponible ? (
              <Chip label="Disponible" color="success"/>):(
                <Chip label="No Disponible" color="error"/>
              )
            }
            
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
         
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
              Direccion: {suplier.direccion}
            </Typography>
           
            <Button
              startIcon={<Iconify icon="mdi:telephone" />}>
              <Typography variant='h6'>Telefono: {suplier.telefono}</Typography>
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
              Proveedor Alternativo: {suplier.alternativo === null ? 'No hay proveedor Alternativo' : suplier.alternativo.toUpperCase()}
            </Typography>
           
            <Typography variant='h6'>
              Contacto: {suplier.contacto}
            </Typography>
          </Box>
         <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'2rem' }} >
            <Typography variant='h6'>
             Segundo Contacto: {suplier.contacto_2 === null ? 'No hay un segundo contacto' : suplier.contacto_2}
            </Typography>
     
          </Box>
          <br/>
          
          <Accordion>
              <AccordionSummary expandIcon={<Iconify icon="mingcute:time-line" />}>
                <Typography variant="h6">Horarios</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {suplier.horarios.length > 0 ? (
                  suplier.horarios.map((horario, index) => (
                    <Typography key={index} variant="body1">
                      {obtenerDiaDeLaSemana(horario.dia)}: {horario.horario_apertura} - {horario.horario_cierre}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body1">No hay horarios disponibles</Typography>
                )}
              </AccordionDetails>
            </Accordion>
            
            
          
          <br/>
          
        </CardContent>
      </Box>
      
    </Card>
  )
}
)
