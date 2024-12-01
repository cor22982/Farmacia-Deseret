import React, { forwardRef , useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button } from '@mui/material';
import { UploadImage } from '../UploadImage/UploadImage';

interface ModalSupplierProps {
  open: boolean;
  handleClose: () => void;
  handleClick: () => void;
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
export const ModalSupplier = forwardRef<HTMLDivElement, ModalSupplierProps>(
  ({ open, handleClose, handleClick }, ref) => {
    const [value, setValue] = useState('Proveedor');
    const [image, setImage] = useState<string | null>(null);
    return (
    <Modal 
      open={open} 
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description">
      <Box sx={style} gap="0.1rem">
          <Box display="flex" alignItems= 'center' justifyContent="center">
            <Typography id="modal-modal-title" variant="h3" component="h2">
            INSERTAR PRODUCTO NUEVO
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="name"
              label="Nombre"
              defaultValue=""
              InputLabelProps={{ shrink: true }}
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
              <TextField
              fullWidth
              name="tipo"
              label="Forma Farmaceutica"
              defaultValue=""
              InputLabelProps={{ shrink: true }}
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
            
            value={value}
            onChange={(e) => {setValue(e.target.value)}}
          >
            <MenuItem value="Proveedor">
              <em>Presentacion</em>
            </MenuItem>
            <MenuItem value="opcion1">Opción 1</MenuItem>
            <MenuItem value="opcion2">Opción 2</MenuItem>
            <MenuItem value="opcion3">Opción 3</MenuItem>
          </Select>
          </FormControl>
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
            
            value={value}
            onChange={(e) => {setValue(e.target.value)}}
          >
            <MenuItem value="Proveedor">
              <em>Proveedores</em>
            </MenuItem>
            <MenuItem value="opcion1">Opción 1</MenuItem>
            <MenuItem value="opcion2">Opción 2</MenuItem>
            <MenuItem value="opcion3">Opción 3</MenuItem>
          </Select>
          </FormControl>      
          </Box>
         

          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
            <TextField
              fullWidth
              name="activo"
              label="Activo Principal"
              defaultValue=""
              InputLabelProps={{ shrink: true }}
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
                width: '500px'
              }}
            />   
            <Box display="flex" flexDirection="column">
              <FormLabel id="demo-radio-buttons-group-label">Controlado</FormLabel>
                <RadioGroup
                 row
                 aria-labelledby="demo-row-radio-buttons-group-label"
                 name="row-radio-buttons-group"
                  
                >
                  <FormControlLabel value="si" control={<Radio />} label="Si" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
            </Box>    
          </Box>
          <Box display="flex" flexDirection="row" padding="1rem" gap="1rem" width='auto'>
               
             <TextareaAutosize
             minRows={4}
             style={{ width: '100%', borderRadius: '0.5rem' }}
             placeholder="Descripcion Medicamento"
             />
          </Box>
          <UploadImage image={image} setImage={setImage} />
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={handleClick}
          >INSERTAR PRODUCTO</Button>
        </Box>
    </Modal>
    )
  }
);
