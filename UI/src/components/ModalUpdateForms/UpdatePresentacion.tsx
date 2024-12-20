import React, { forwardRef, useState, useEffect } from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, Button } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from 'sweetalert2';
import { Place, useGetPlaces } from 'src/_mock/places';
import { Presentacion } from 'src/_mock/presentaciones';

interface ModalPlaceProps {
  open: boolean;
  close: (set: boolean) => void;
  handleClick: () => void;
  setCall: (call: number) => void;
  id: string;
  presentacion: Presentacion | null;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
};

export const ModalPresentacionUpdate = forwardRef<HTMLDivElement, ModalPlaceProps>(
  ({ open, close, handleClick, setCall, id, presentacion }, ref) => {


    const handleClose = async() => {
      
      close(false)
    }
    const [nombre, setNombre] = useState(presentacion?.nombre)
    const [descripcion, setDescripcion]  = useState(presentacion?.descripcion)
    const { llamado, error } = useApi(`${source_link}/updatePresentaciones`);
    const { token } = useToken();

    const onInsert = async () => {
      try {
        const body = { token,
                   id: presentacion?.id,
                   nuevoNombre: nombre, 
                   nuevaDescripcion: descripcion };
        const response = await llamado(body, 'PUT');
        if (response) {
          if (response.success === true) {
            handleClick()
            setCall(0);
            Swal.fire({
              icon: 'success',
              title: 'Se actualizo correctamente',
              text: response.message,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message,
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error || 'No se conoce el error',
          });
        }
      } catch (err) {
        console.log(err);
      }
    }; 

    return (
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
              ACTUALIZAR PRESENTACIONES
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width="auto">
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              defaultValue={presentacion?.nombre}
              value={nombre}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setNombre(e.target.value)}
              sx={{
                mb: 0.2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#919191',
                  },
                  '&:hover fieldset': {
                    borderColor: '#262626',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#050505',
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width="auto">
            <TextField
              fullWidth
              name="name"
              label="Descripcion"
              defaultValue={presentacion?.descripcion}
              value={descripcion}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setDescripcion(e.target.value)}
              sx={{
                mb: 0.2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#919191',
                  },
                  '&:hover fieldset': {
                    borderColor: '#262626',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#050505',
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>

         

          <Button 
            variant="contained" 
            color="inherit" 
            component="label" sx={{ width: '100%' }} 
            onClick={onInsert}
          >
            EDITAR PRESENTACION
          </Button>
        </Box>
      </Modal>
    );
  }
);
