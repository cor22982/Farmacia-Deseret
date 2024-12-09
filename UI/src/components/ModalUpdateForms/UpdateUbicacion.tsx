import React, { forwardRef, useState, useEffect } from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, Button } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from 'sweetalert2';
import { Place, useGetPlaces } from 'src/_mock/places';

interface ModalPlaceProps {
  open: boolean;
  close: (set: boolean) => void;
  handleClick: () => void;
  setCall: (call: number) => void;
  id: string;
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

export const ModalPlaceUpdate = forwardRef<HTMLDivElement, ModalPlaceProps>(
  ({ open, close, handleClick, setCall, id }, ref) => {


    const handleClose = async() => {
      await setPlace('')
      await setLugar('Lugar')
      close(false)
    }
    const [place_get, setPlace_id] = useState<Place | null>(null);
    const [place, setPlace] = useState('');
    const [lugar, setLugar] = useState('Lugar');
    const { getPlaceById } = useGetPlaces();
    const { llamado, error } = useApi(`${source_link}/updateUbicaciones`);
    const { token } = useToken();
    const [one, setOne] = useState(0);

    useEffect(() => {
      const fetchPlace = async () => {
        try {
          
          if (open === true && one===0){
            const fetchedplace = await getPlaceById(id);
            setPlace(fetchedplace?.ubicacion || '')
            setLugar(fetchedplace?.lugar_farmacia || 'Lugar')
            console.log(fetchedplace)
           
            setOne(1)
          }
          else if (open === false){
            setOne(0)
          }
          
        } catch (error_er) {
          console.error('Error fetching places:', error_er);
        }
      };
      fetchPlace();
    }, [id , getPlaceById, open, setPlace, setOne, one]);

   
    

    const onInsert = async () => {
      try {
        const body = { token, id,nuevaUbicacion: place, lugarf: lugar };
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
              ACTUALIZAR UBICACION
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width="auto">
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              defaultValue={place_get?.ubicacion}
              value={place}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setPlace(e.target.value)}
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

          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              sx={{
                mb: 1,
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
              value={lugar}
              onChange={(e) => setLugar(String(e.target.value))}
            >
              <MenuItem value="Lugar">
                <em>Ubicacion en el Local</em>
              </MenuItem>
              <MenuItem value="bodega">
                <em>Bodega</em>
              </MenuItem>
              <MenuItem value="farmacia">
                <em>Farmacia</em>
              </MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="inherit" component="label" sx={{ width: '100%' }} onClick={onInsert}>
            EDITAR UBICACION
          </Button>
        </Box>
      </Modal>
    );
  }
);
