import React, { forwardRef , useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";
import { UploadImage } from '../UploadImage/UploadImage';


interface ModalPlaceProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
  setCall: (call:number) => void;
}
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width:700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2, 
};
export const ModalPlace = forwardRef<HTMLDivElement, ModalPlaceProps>(
  ({ open, handleClose, handleClick, setCall }, ref) => {

    const [place, setPlace] = useState('');
    const [lugar, setLugar] = useState('Lugar');
    const {llamado, error} = useApi(`${source_link}/insertUbicacion`)
    const {token} = useToken()

    const onInsert = async() => {
      try{
        const body = { token, ubicacion:place, lugar_farmacia:lugar };
        const response = await llamado(body, 'POST')
        if (response) {
          if (response.success === true){
            setPlace('')

            setCall(0)
            Swal.fire({
              icon: "success",
              title: "Se ingreso correctamente",
              text: response.message,
            });
           
          }else{
            Swal.fire({
              icon: "error",
              title: "Error",
              text: response.message,
            });
          }
        }else{
          Swal.fire({
            icon: "error",
            title: "Error",
            text:  error || "No se conoce el error",
          });
        }

      }catch(err){
        console.log(err)
      }
     
    };

    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            INSERTAR UBICACION
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              defaultValue=""
              value={place}
              InputLabelProps={{ shrink: true }}
              onChange = {(e) => {
                setPlace(e.target.value);
             }}
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
            <MenuItem value='Lugar'>
              <em>Ubicacion en el Local</em>
            </MenuItem>
            <MenuItem value='bodega'>
              <em>Bodega</em>
            </MenuItem>
            <MenuItem value='farmacia'>
              <em>Farmacia</em>
            </MenuItem>
           
          </Select>
          </FormControl>
          <br/>
          <br/>
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={onInsert}
          >INSERTAR UBICACION</Button>
        </Box>
    </Modal>
    )
  }
);