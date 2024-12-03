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
import SupplierCard from 'src/components/SupplierCard/SupplierCard';
import { ModalSupplier } from 'src/components/ModalForms/ModalSupplier';
import { ModalSupplierTime } from 'src/components/ModalForms/ModalSupplierTime';
import { SupplierSearchItem } from './components/supplier_search';
import { SupplierFilterList } from './components/supplier_filter_list';

// ----------------------------------------------------------------------

export function AddSourcerView() {

  const [openm, setOpenM] = useState(false);
  const [openm2, setOpenM2] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [value_Id, setValueId] = useState(100000);

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleClicked = () => {
    setOpenM(false)
    setOpenM2(true)
  };
  return (
    <DashboardContent>
     
      <ModalSupplier
        setValueSupplierId={setValueId}
        open={openm}
        handleClose={() => setOpenM(false)}
        handleClick={handleClicked}
      />
      <ModalSupplierTime
        id={value_Id}
        open={openm2}
        handleClose={() => setOpenM2(false)}
        handleClick={handleClicked}
      />
      <Box display="flex" alignItems="center" mb={5}>
        
        <Typography variant="h4" flexGrow={1}>
          Proveedores
        </Typography>
        <Box display="flex" flexDirection="row" gap="20px">
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenM(true)}
          >
          Agregar nuevo Proveedor
          </Button>
         
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="ep:list" />}
          >
          Generar Listado
          </Button>

        </Box>
        
      </Box>
      <Box display="flex" alignItems="center" mb={5} gap='2rem'>
      <SupplierSearchItem/>
        <Box display="flex" alignItems= 'center' flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
            Tipo
          </Typography>
          <SupplierFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
        
        </Box>
        
        <Box display="flex"  flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
           Disponibilidad
          </Typography>
          <SupplierFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Disponible' },
                { value: 'popular', label: 'No Disponible' },
              ]}
            />
        
            
        </Box>
   
        </Box>
    <SupplierCard/>
    </DashboardContent>
  );
}
