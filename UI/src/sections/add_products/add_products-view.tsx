import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { SimpleLayout } from 'src/layouts/simple';
import { Iconify } from 'src/components/iconify';
import { useState, useCallback } from 'react';
import { ProductsFilterList } from './components/products_filter_list';
// ----------------------------------------------------------------------

export function AddProductsView() {

  const [sortBy, setSortBy] = useState('latest');

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  return (
    <DashboardContent>
      
      <Box display="flex" alignItems="center" mb={5}>
        
        <Typography variant="h4" flexGrow={1}>
          Productos de la Farmacia
        </Typography>
        <Box display="flex" flexDirection="row" gap="20px">
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
          Agregar nuevo Producto
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
        <Box display="flex" alignItems= 'center' flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
            Proveedor
          </Typography>
          <ProductsFilterList
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
           Fecha de Vencimiento
          </Typography>
          <ProductsFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
        </Box>
        <Box display="flex" alignItems= 'center' flexDirection="column">
          <Typography variant="body2" flexGrow={1}>
           Presentacion
          </Typography>
          <ProductsFilterList
            sortBy={sortBy}
            onSort={handleSort}
              options={[
                { value: 'latest', label: 'Latest' },
                { value: 'popular', label: 'Popular' },
                { value: 'oldest', label: 'Oldest' },
              ]}
            />
        </Box>
        </Box>

      
    </DashboardContent>
  );
}
