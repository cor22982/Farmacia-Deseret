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
import { ProductCard} from 'src/components/ProductCard/ProductCard';
import { ModalProduct } from 'src/components/ModalForms/ModalProduct';
import { ModalProductDetail } from 'src/components/ModalForms/ModalProductDetail';
import {PlaceSupCard} from 'src/components/PlaceCard/PlaceCard';
import { ModalPlace } from 'src/components/ModalForms/ModalPlace';
import { ModalPlaceUpdate } from 'src/components/ModalUpdateForms/UpdateUbicacion';
import { useGetPlaces, Place } from 'src/_mock/places';
import { Presentacion, useGetPresentaciones } from 'src/_mock/presentaciones';
import { PresentacionCard } from 'src/components/PresentacionesCard/PresentacionesCard';
import { ModalPresentaciones } from 'src/components/ModalForms/ModalPresentaciones';
import { ModalPresentacionUpdate } from 'src/components/ModalUpdateForms/UpdatePresentacion';




export function AddPresentacionesView() {

  const [openm, setOpenM] = useState(false);
  const [openupdate, setOpenUpdate] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const { getPlaces } = useGetPlaces();
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [place_set, setPlace] = useState("");
  const [searchValue, setSearchValue] = useState<string>('');
  const [call1, setCall1] = useState(0);

  const [presentacionselect, setPresentacionSelect] = useState<Presentacion|null>(null)

  const [presentaciones, setPresentaciones]  = useState<Presentacion[]>([]);
  const { getPresentaciones} = useGetPresentaciones();

  const [idplace, setPlaceId] = useState<string>('');


  useEffect(() => {
    const fetchPresentaciones = async () => {
      try {
        const fetchedPresentaciones = await getPresentaciones();
        if (call1 === 0){
          setPresentaciones(fetchedPresentaciones)
          setCall1(call1+1);
        }
        
      } catch (error) {
        console.error("Error fetching presentaciones:", error);
      }
    };

    fetchPresentaciones();
  }, [getPresentaciones, call1]); 

  

  


  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };

  const setUpdate_Open = async (p:Presentacion) => {
    await setPresentacionSelect(p)
    setOpenUpdate(true)
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
      <ModalPresentaciones
        setCall={setCall1}
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      />

      <ModalPresentacionUpdate
        presentacion={presentacionselect} 
        setCall={setCall1}
        id={idplace}
        open={openupdate}
        close={setOpenUpdate}
        handleClick={() => setOpenUpdate(false)}
      />
      
      <Box display="flex" alignItems="center" mb={5}>
        
        <Typography variant="h4" flexGrow={1}>
         Presentaciones de Productos
        </Typography>
        <Box display="flex" flexDirection="row" gap="20px">
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenM(true)}
          >
          Agregar nueva Presentacion
          </Button>
        </Box>
        
      </Box>
     
      <Grid container
  spacing={2}   sx={{ maxHeight: '65vh', overflowY: 'auto' }}>
      {presentaciones.map((p) => (
          <Box key={p.id} paddingBottom="1rem" paddingLeft="1rem">
            <PresentacionCard
              sePresentacion={setUpdate_Open}
              setCall={setCall1}
              presentacion={p}/>
          </Box>
        ))}
      </Grid>
    </DashboardContent>
  );
}
