import { useTheme } from '@mui/material/styles';
import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import useToken from 'src/hooks/useToken';
import Grid from '@mui/material/Unstable_Grid2';
import { Product} from 'src/_mock/product';
import { Iconify } from 'src/components/iconify';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import Swal from 'sweetalert2';

interface ProductCardProps {
  product: Product;
  setCall: (call:number) => void;
  openUpdate_function: (product:Product) => void;

}

export const ProductAddCard =  forwardRef<HTMLDivElement, ProductCardProps> (
  
  ({ product, setCall, openUpdate_function}, ref) => {
  const {llamado: delete_product} = useApi(`${source_link}/deleteproducts`)

  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >
      <CardMedia
        component="img"
        sx={{ width: 250 }}
        image={`data:image/jpeg;base64,${product.imagen}`}
        alt="Live from space album cover"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignContent: 'start', alignItems: 'start' }}>
            
            <Typography component="div" variant="h3">
              {product.nombre}
            </Typography>
            <Box display="flex" flexDirection="row" gap="0.5rem">
              <Chip label={`${product.forma_farmaceutica} (${product.presentacion.toUpperCase()})`} color="error" />
              <Chip label={`Proveedor: ${product.proveedor?.nombre}`} color="primary"/>
              <Chip label={`Existencias: ${product.existencias}`} color="success"/>
              
            </Box>
          </Box>
          <br/>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap:'2rem' }} >        
          <TableContainer component={Paper}>
          <Table size="small" aria-label="tabla de detalles de productos">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Ubicacion</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Cantidad</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">Fecha Vencimiento</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {product.listdetails.map((p, index) => (
                <TableRow key={index}>
                  <TableCell>{p.ubicacion.lugar_farmacia}</TableCell>
                  <TableCell>{p.cantidad}</TableCell>
                  <TableCell>{p.get_Fechasformated()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
            <Button 
            variant='contained'
            onClick={() => {openUpdate_function(product)}}>
            Agregar Nuevas Unidades</Button> 
          
        </Box>
  
          
        </CardContent>
      </Box>
      
    </Card>
  )}
)
