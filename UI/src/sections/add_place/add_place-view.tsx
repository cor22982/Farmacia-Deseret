import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { SimpleLayout } from 'src/layouts/simple';
import { Iconify } from 'src/components/iconify';
import { useState, useCallback } from 'react';
import ProductCard from 'src/components/ProductCard/ProductCard';
import { ModalProduct } from 'src/components/ModalForms/ModalProduct';
import { ModalProductDetail } from 'src/components/ModalForms/ModalProductDetail';
import PlaceSupCard from 'src/components/PlaceCard/PlaceCard';
import { PlaceSearchItem } from './add_place-search';


export function AddPlaceView() {

  const [openm, setOpenM] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [sortBy, setSortBy] = useState('latest');

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };
  return (
    <DashboardContent>
      <ModalProduct
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      />
      <ModalProductDetail
        open={openm2}
        handleClose={() => setOpenM2(false)}
        handleClick={handleClicked}
      />
      <Box display="flex" alignItems="center" mb={5}>
        
        <Typography variant="h4" flexGrow={1}>
         Ubicaciones de la Farmacia
        </Typography>
        <Box display="flex" flexDirection="row" gap="20px">
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenM(true)}
          >
          Agregar nueva Ubicacion
          </Button>
        </Box>
        
      </Box>
      <Box display="flex" alignItems="center" mb={5} gap='2rem'>
        <PlaceSearchItem/>
      </Box>
    
    <PlaceSupCard/>
    </DashboardContent>
  );
}
