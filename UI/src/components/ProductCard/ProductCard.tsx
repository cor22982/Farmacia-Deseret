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
import { Icon } from '@iconify/react';

interface ProductCardProps {
  product: Product;
  setCall: (call:number) => void;
  setid: (id_number:number) => void;
  setIdProduct: (id_number:number) => void;
  openpresentacion: (id_number:number) => void;
}

export const ProductCard =  forwardRef<HTMLDivElement, ProductCardProps> (
  
  ({ product, setCall,  setid ,  setIdProduct, openpresentacion}, ref) => {
    const {llamado: delete_product} = useApi(`${source_link}/deleteproducts`)
    const {token} = useToken()
    
    const onDeleteButton = async() => {
      Swal.fire({
        title: "Seguro que lo quieres eliminar?",
        text: "No sera posible revertir los cambios!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si elimina el producto"
      }).then(async(result) => {
        if (result.isConfirmed) {
  
          const body = {
            token,
            id: product.id
          };
          const respuesta = await delete_product(body, 'DELETE');
          if (respuesta) {
      
            if (respuesta.success === true){
              setCall(0)
              Swal.fire({
                icon: "success",
                title: "Se elimino de manera exitosa",
                text: respuesta.message,
              });
            }else{
              Swal.fire({
                icon: "error",
                title: "No se puede eliminar",
                text: "No tienes permiso para eliminar",
              });
            }
      
          }else{
            Swal.fire({
              icon: "error",
              title: "Error",
              text:  "No se puede eliminar"
            });
          }
        }
      });
     
      
    }

  return (
    <Card sx={{ display: 'flex', padding: '1rem' }} >
     
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignContent: 'start', alignItems: 'start' }}>
            
            <Typography component="div" variant="h3">
              {product.nombre}
            </Typography>
            <Box display="flex" flexDirection="row" gap="0.5rem">
              <Chip label={`${product.forma_farmaceutica}`} color="primary" />
              <Chip label={`Existencias: ${product.existencias}`} color="success"/>
              <Chip label={`Tipo: ${product.tipo}`} color="error"/>
            </Box>
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            
          
            <Typography component="div" variant="h6">
              Costo por unidad: Q{product.costo}
            </Typography>
            <Typography component="div" variant="h6">
            Ganancia: {(product.ganancia * 100).toFixed(2)}%
            </Typography>
            <Typography component="div" variant="h6">
              Proveedor: {product.proveedor?.nombre.toUpperCase()}
            </Typography>
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap:'2rem' }} >
          <Divider sx={{borderColor: 'black'}}/>
            <Typography component="div" variant="h6">
              Descripcion
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: 'text.secondary',
                maxHeight: 'auto',
                overflowY: 'auto',
                whiteSpace: 'normal',
                textOverflow: 'ellipsis',
                textAlign: 'justify'
              }}
            >
            {product.descripcion_uso}
          </Typography>
          

            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="material-symbols-light:list" />}
                aria-controls="product-details-content"
                id="product-details-header"
              >
                <Typography variant="h6">Cantidades del Producto</Typography>
              </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="tabla de detalles de productos">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Detalles</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Fecha Vencimiento</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.listdetails.map((p, index) => (
                          <TableRow key={index}>
                            <TableCell>{p.getDetails_Products()}</TableCell>
                            <TableCell>{p.get_Fechasformated()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="material-symbols-light:list" />}
                aria-controls="product-details-content"
                id="product-details-header"
              >
                <Typography variant="h6">Presentaciones del Producto</Typography>
              </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table size="small" aria-label="tabla de detalles de productos">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Presentacion</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Precio</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">% Ganancia</Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {product.listpresentaciones.map((p, index) => (
                          <TableRow key={index}>
                            <TableCell>{p.presentacion?.nombre} X {p.cantidad_presentacion}</TableCell>
                            <TableCell>Q {p.pp} c/u</TableCell>
                            <TableCell>{p.porcentaje_ganancia === null ? 0 : p.porcentaje_ganancia * 100}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
            </Accordion>
          </Box>
          <br/>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap:'1rem' }} >
          

          <Button
            startIcon={<Iconify icon="material-symbols:edit" />}
            onClick={() => {setIdProduct(product.id)}}
            >
            Editar
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:delete" />}
            onClick={onDeleteButton}
             variant="contained" color="error"
            >
            Eliminar
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:list" />}
             variant="contained"
             onClick={() => {setid(product.id)}}
            >
            Cantidades
          </Button>
          <Button 
            sx={{ bgcolor: 'black', '&:hover': { bgcolor: 'darkred' } }} 
            variant="contained"
            startIcon={<Iconify icon="cuida:medicine-outline" />}
            onClick={() => {openpresentacion(product.id)}}
            >
            Presentaciones
          </Button>
            </Box>
        </CardContent>
      </Box>
      
    </Card>
  )}
)
