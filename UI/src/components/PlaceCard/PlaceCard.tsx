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

interface PlaceProps {
  name: string;
  id: number;
  lugar_farmacia: string;
  setCall: (call:number) => void;
}

export const  PlaceSupCard = forwardRef<HTMLDivElement,PlaceProps>(

  ({ name, lugar_farmacia, id, setCall }, ref) => {
  const [value, setValue] = useState('Proveedor');
  const {llamado: delete_place} = useApi(`${source_link}/deleteubicacion`)
  const {token} = useToken();

  const onDeleteButton = async() => {
    Swal.fire({
      title: "Seguro que lo quieres eliminar?",
      text: "No sera posible revertir los cambios!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si elimina la ubicacion"
    }).then(async(result) => {
      if (result.isConfirmed) {

        const body = {
          token,
          id
        };
        const respuesta = await delete_place(body, 'DELETE');
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
            {
              lugar_farmacia !== '' ?(
                <Chip label={`${lugar_farmacia}`} color="primary" />
              ):(
                <></>
              )
            }
          
            <Typography component="div" variant="h4">
              {name}
            </Typography>

            <Button
            startIcon={<Iconify icon="material-symbols:edit" />}
            >
            Editar
          </Button>
          <Button
            startIcon={<Iconify icon="material-symbols:delete" />}
            onClick={onDeleteButton}
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