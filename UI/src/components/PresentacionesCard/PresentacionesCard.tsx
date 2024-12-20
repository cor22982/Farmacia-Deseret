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
import useToken from 'src/hooks/useToken';
import useApi from 'src/hooks/useApi';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";
import { strict } from 'assert';
import { string } from 'prop-types';
import { Presentacion } from 'src/_mock/presentaciones';

interface PlaceProps {
  presentacion: Presentacion
  setCall: (call:number) => void;
  sePresentacion: (p:Presentacion) => void;
  // setplaceid: (id:string) => void;
}

export const  PresentacionCard = forwardRef<HTMLDivElement,PlaceProps>(

  ({ presentacion, setCall, sePresentacion }, ref) => {
  const [value, setValue] = useState('Proveedor');
  const {llamado: delete_presentacion} = useApi(`${source_link}/delepresentacion`)
  const {token} = useToken();

  // const onEdit = () => {
  //   setplaceid(id.toString())
  // }
  const onDeleteButton = async() => {
    Swal.fire({
      title: "Seguro que lo quieres eliminar?",
      text: "No sera posible revertir los cambios!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si elimina la presentacion"
    }).then(async(result) => {
      if (result.isConfirmed) {

        const body = {
          token,
          id: presentacion.id
        };
        const respuesta = await delete_presentacion(body, 'DELETE');
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
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            
            <Typography component="div" variant="h4">
              {presentacion.nombre}
            </Typography>
            <Typography component="div" variant="body1">
              {presentacion.descripcion}
            </Typography>
            <Button
              startIcon={<Iconify icon="material-symbols:edit" />}
              onClick={()=>{sePresentacion(presentacion)}}

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
          </Box>
         
     
          
        </CardContent>
      </Box>
      
    </Card>
  );
}
)