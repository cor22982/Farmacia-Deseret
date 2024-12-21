import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import Checkbox from '@mui/material/Checkbox';
import { Icon } from "@iconify/react"; 
import FormGroup from '@mui/material/FormGroup';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ProductoCarrito, useGetProductosCarrito  } from 'src/_mock/productos_carrito';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ColorPicker } from 'src/components/color-utils';
import { useEffect, useState } from 'react';
import useCarId from 'src/hooks/useIdProduct';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Carrito } from 'src/_mock/carrito';

// ----------------------------------------------------------------------

export type FiltersProps = {
  price: string;
  rating: string;
  gender: string[];
  colors: string[];
  category: string;

};

type ProductFiltersProps = {
  canReset: boolean;
  openFilter: boolean;
  filters: FiltersProps;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onResetFilter: () => void;
  micarrito: Carrito | null;
  onSetFilters: (updateState: Partial<FiltersProps>) => void;
  options: {
    colors: string[];
    ratings: string[];
    categories: { value: string; label: string }[];
    genders: { value: string; label: string }[];
    price: { value: string; label: string }[];
  };
};

export function ProductFilters({
  filters,
  options,
  canReset,
  openFilter,
  onSetFilters,
  onOpenFilter,
  onCloseFilter,
  onResetFilter,
  micarrito,
  
}: ProductFiltersProps) {

  const {carId} = useCarId ();
  const { llamado:deleteproducto } = useApi(`${source_link}/deleteproductoscarritos`);
  const [carritoproductos, setCarritoProductos] = useState<ProductoCarrito[]>([])
  const {getCarritoProducts} = useGetProductosCarrito ();

  const deleteProducto = async (id_product: number, id_presentacion: number) => {
    const body = { id_carrito: carId, id_product, id_presentacion};
    const respuesta = await deleteproducto(body, 'DELETE');
    
    if (respuesta?.success) { // Verifica que la eliminación fue exitosa
      setCarritoProductos((prevProductos) =>
        prevProductos.filter((producto) => producto.producto_id !== id_product)
      );
    } else {
      console.error("No se pudo eliminar el producto");
    }
  };

   useEffect(() => {
      const fetchProductos = async () => {
        const productos = await getCarritoProducts(carId)
        setCarritoProductos(productos)
      };
    
      fetchProductos();
    }, [carId,getCarritoProducts, setCarritoProductos]);
  


  const renderGender = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Gender</Typography>
      <FormGroup>
        {options.genders.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Checkbox
                checked={filters.gender.includes(option.value)}
                onChange={() => {
                  const checked = filters.gender.includes(option.value)
                    ? filters.gender.filter((value) => value !== option.value)
                    : [...filters.gender, option.value];

                  onSetFilters({ gender: checked });
                }}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
    </Stack>
  );

  const renderCategory = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Category</Typography>
      <RadioGroup>
        {options.categories.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                checked={filters.category.includes(option.value)}
                onChange={() => onSetFilters({ category: option.value })}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Stack>
  );

  const renderColors = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Colors</Typography>
      <ColorPicker
        selected={filters.colors}
        onSelectColor={(colors) => onSetFilters({ colors: colors as string[] })}
        colors={options.colors}
        limit={6}
      />
    </Stack>
  );

  const renderPrice = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Price</Typography>
      <RadioGroup>
        {options.price.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio
                checked={filters.price.includes(option.value)}
                onChange={() => onSetFilters({ price: option.value })}
              />
            }
            label={option.label}
          />
        ))}
      </RadioGroup>
    </Stack>
  );

  const renderRating = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Rating
      </Typography>

      {options.ratings.map((option, index) => (
        <Box
          key={option}
          onClick={() => onSetFilters({ rating: option })}
          sx={{
            mb: 1,
            gap: 1,
            ml: -1,
            p: 0.5,
            display: 'flex',
            borderRadius: 1,
            cursor: 'pointer',
            typography: 'body2',
            alignItems: 'center',
            '&:hover': { opacity: 0.48 },
            ...(filters.rating === option && {
              bgcolor: 'action.selected',
            }),
          }}
        >
          <Rating readOnly value={4 - index} /> & Up
        </Box>
      ))}
    </Stack>
  );

  return (
    <>
      {/* <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpenFilter}
      >
        Filters
      </Button> */}

      <Drawer
        anchor="right"
        open={openFilter}
        onClose={onCloseFilter}
        PaperProps={{
          sx: { width: 550, overflow: 'hidden' },
        }}
      >
        <Box display="flex" alignItems="center" sx={{ pl: 2.5, pr: 1.5, py: 2 }}>
          <Typography variant="h6" flexGrow={1}>
            Carrito
          </Typography>
          

          <IconButton onClick={onResetFilter}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:refresh-linear" />
            </Badge>
          </IconButton>

          <IconButton onClick={onCloseFilter}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}>
          <TableContainer component={Paper}>
                    <Table size="small" aria-label="tabla de detalles de productos" >
                      <TableHead>
                        <TableRow>
                        
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Cantidad</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Producto</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Presentacion</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Precio Unitario</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">Eiminar Producto</Typography>
                          </TableCell> 
                          
                         
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {carritoproductos.map((producto, index) => (
                          <TableRow key={index}>
                            
                            <TableCell>{producto.cantidad}</TableCell>
                            <TableCell sx={{ width: '50px', fontSize: '12px'}}>
                              {producto.producto_nombre}</TableCell>
                              <TableCell>{producto.presentacion?.presentacion?.nombre}</TableCell>
                              <TableCell>Q {producto.presentacion?.pp}</TableCell>
                              <TableCell>
                            <Button
                              onClick={() => {
                                deleteProducto(producto.producto_id, producto.presentacion?.id ?? 0);
                              }}
                            >
                              <Icon icon="mdi:trash" width="20" height="20" color="red" />
                            </Button>
                            </TableCell>
                          </TableRow>

                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
            <Typography variant='h4'>
              Total: Q {micarrito !==null ? micarrito.total : 0.0}
            </Typography>
            <Button variant='contained'>
              Pagar
            </Button>
            <Button variant='contained' color="error">
              Cancelar
            </Button>
           
            
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
