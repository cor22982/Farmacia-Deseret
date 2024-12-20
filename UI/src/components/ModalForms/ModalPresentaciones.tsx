import React, { forwardRef , useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button } from '@mui/material';
import useApi from 'src/hooks/useApi';
import useToken from 'src/hooks/useToken';
import source_link from 'src/repository/source_repo';
import Swal from "sweetalert2";


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
export const ModalPresentaciones = forwardRef<HTMLDivElement, ModalPlaceProps>(
  ({ open, handleClose, handleClick, setCall }, ref) => {

    
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error_get, setErr] = useState('')
    const {llamado, error} = useApi(`${source_link}/insertPresentaciones`)
    const {token} = useToken()

    const onInsert = async() => {
      try{
        const body = { token, nombre, descripcion };
        const response = await llamado(body, 'POST')
        if (response) {
          if (response.success === true){
            
            setNombre('')
            setDescripcion('')
            setCall(0)
            Swal.fire({
              icon: "success",
              title: "Se ingreso correctamente",
              text: response.message,
            });
           
          }else{
            setErr(response.message)
          }
        }else{
          Swal.fire({
            icon: "error",
            title: "Error",
            text:  error || "No se conoce el error",
          });
          setErr(response.message)
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
            INSERTAR PRESENTACION
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre"
              defaultValue=""
              value={nombre}
              InputLabelProps={{ shrink: true }}
              onChange = {(e) => {
                setNombre(e.target.value);
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
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="descripcion"
              label="Descripcion Breve"
              defaultValue=""
              value={descripcion}
              InputLabelProps={{ shrink: true }}
              onChange = {(e) => {
                setDescripcion(e.target.value);
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
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={onInsert}
          >INSERTAR PRESENTACION</Button>
           {error_get && (
              <Typography color="error" variant="body2">
                {error_get}
              </Typography>
            )}
        </Box>
    </Modal>
    )
  }
);
