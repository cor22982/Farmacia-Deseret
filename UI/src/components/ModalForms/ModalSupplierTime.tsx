import React, { forwardRef , useState} from 'react';
import { Modal, Typography, Box, TextField, Select, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextareaAutosize, Button, Grid } from '@mui/material';
import { UploadImage } from '../UploadImage/UploadImage';

interface ModalSupplierTimeProps {
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
export const ModalSupplierTime = forwardRef<HTMLDivElement, ModalSupplierTimeProps>(
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
            Agregar Horarios
            </Typography>
          </Box>
          <br/>
          <Box display="flex" alignContent="center" justifyContent="center" paddingLeft="10rem">
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1 }}>
            
            <Grid fontSize={6} display="flex" justifyContent="center" alignContent='center'>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap:'5rem'}} >
                <Typography variant="body2">Lunes</Typography>
                <Typography variant="body2">Abre a las 6:00 am y Cierra a las 7:00 pm</Typography>
              </Box>
            </Grid>
           
          
          
          </Grid>    
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
            <MenuItem value="Dia">
              <em>Dia</em>
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
              name="ha"
              label="Hora Apertura"
              defaultValue=""
              type="time"
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
                }
              }}
            />  
            <TextField
              fullWidth
              name="hc"
              label="Hora Cierre"
              type="time"
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
                }
              }}
            />    
              
          </Box>
          
        
          <br/>
          <Button
            variant="contained" color="inherit" component="label"
            sx={{
              width:'100%'
            }}
            onClick={handleClick}
          >Agregar Horario</Button>
        </Box>
    </Modal>
    )
  }
);