import { useTheme } from '@mui/material/styles';
import React, { forwardRef , useState, useEffect,  useCallback} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Button, Chip, Divider } from '@mui/material';
import { Supplier } from 'src/_mock/supplier';
import Grid from '@mui/material/Unstable_Grid2';
import { Iconify } from 'src/components/iconify';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {obtenerDiaDeLaSemana, diasDeLaSemana } from 'src/_mock/days';
import useToken from 'src/hooks/useToken';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";

interface SupplierCardProps {
  suplier: Supplier;
  setCall: (call:number) => void;
  setIdSupplier: (id:number) => void;
  setOpenAgregar: (id:number) => void;
  
}

export const SupplierCard = forwardRef<HTMLDivElement,SupplierCardProps> (
  ({ suplier, setCall, setIdSupplier, setOpenAgregar }, ref) => {
  const {llamado: delete_supplier} = useApi(`${source_link}/deleteproveedores`)
  const {token} = useToken(); 
  
  const onDeleteButton = async() => {
    Swal.fire({
      title: "Seguro que lo quieres eliminar?",
      text: "No sera posible revertir los cambios!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si elimina el proveedor"
    }).then(async(result) => {
      if (result.isConfirmed) {

        const body = {
          token,
          id: suplier.id
        };
        const respuesta = await delete_supplier(body, 'DELETE');
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

  const onEdit = () => {
    setIdSupplier(suplier.id)
  }
  const onAgregarHorio = () => {
    setOpenAgregar(suplier.id)
  }
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
          <Divider/>
          <Accordion>
              <AccordionSummary expandIcon={<Iconify icon="mingcute:time-line" />}>
                <Typography variant="h6">Horarios</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {suplier.horarios.length > 0 ? (
                  suplier.horarios
                    .sort((a, b) => a.dia - b.dia) // Ordenamos por el número del día
                    .map((horario, index) => (
                      <Typography key={index} variant="body1">
                        {obtenerDiaDeLaSemana(horario.dia)}: {horario.horario_apertura.slice(0, 5)} - {horario.horario_cierre.slice(0, 5)}
                      </Typography> 
                    ))
                ) : (
                  <Typography variant="body1">No hay horarios disponibles</Typography>
                )}
              </AccordionDetails>


            </Accordion>
            <Divider />
            
          
          <br/>
          <Box display="flex" gap="1rem">
            <Button
              startIcon={<Iconify icon="material-symbols:edit" />}
              onClick={onEdit}
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
              startIcon={<Iconify icon="mingcute:time-line" />}
              onClick={onAgregarHorio}
              variant="contained"
              >
              Agregar Horarios
            </Button>
          </Box>
        </CardContent>
      </Box>
      
    </Card>
  )
}
)
