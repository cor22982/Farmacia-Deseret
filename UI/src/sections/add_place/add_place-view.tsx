import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { SimpleLayout } from 'src/layouts/simple';
import { Iconify } from 'src/components/iconify';
import { useState, useCallback, useEffect } from 'react';
import ProductCard from 'src/components/ProductCard/ProductCard';
import { ModalProduct } from 'src/components/ModalForms/ModalProduct';
import { ModalProductDetail } from 'src/components/ModalForms/ModalProductDetail';
import {PlaceSupCard} from 'src/components/PlaceCard/PlaceCard';
import { ModalPlace } from 'src/components/ModalForms/ModalPlace';
import { useGetPlaces, Place } from 'src/_mock/places';

import { PlaceSearchItem } from './add_place-search';


export function AddPlaceView() {

  const [openm, setOpenM] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const { getPlaces } = useGetPlaces();
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [place_set, setPlace] = useState("");
  const [searchValue, setSearchValue] = useState<string>('');
  const [call1, setCall1] = useState(0);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const fetchedPlaces = await getPlaces();
        setPlaces(fetchedPlaces);
        if (call1 === 0){
          setFilteredPlaces(fetchedPlaces)
          setCall1(call1+1);
        }
      
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, [getPlaces, setCall1, call1]); 

  

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);


  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      const filtered = places.filter((place) =>
        place.ubicacion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPlaces(filtered);
    } else {
      setFilteredPlaces(places); // Muestra todas las ubicaciones si no hay búsqueda
    }
  };
  return (
    <DashboardContent>
      <ModalPlace
        open={openm}
        handleClose={() => setOpenM(false)}
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
        <PlaceSearchItem 
         onSearch={handleSearch}
        places={places}
       />
      </Box> 
      <Grid container
  spacing={2}   sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {filteredPlaces.map((place) => (
          <Box key={place.id} paddingBottom="1rem" paddingLeft="1rem">
            <PlaceSupCard name={place.ubicacion} />
          </Box>
        ))}
      </Grid>
    </DashboardContent>
  );
}
