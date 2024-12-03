import type { Theme, SxProps } from '@mui/material/styles';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { Supplier } from 'src/_mock/supplier';
import { Iconify } from 'src/components/iconify';



// ----------------------------------------------------------------------

type SupplierSearchItemProps = {
  sx?: SxProps<Theme>;
  suppliers: Supplier[];
  onSearch: (value: string) => void;
};

export function SupplierSearchItem({  sx, suppliers, onSearch }: SupplierSearchItemProps) {
  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            [`& .${autocompleteClasses.option}`]: {
              typography: 'body2',
            },
            ...sx,
          },
        },
      }}
      options={suppliers}
      getOptionLabel={(suplie) => suplie.nombre}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(event, value) => onSearch(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Buscar Proveedor..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ ml: 1, width: 20, height: 20, color: 'text.disabled' }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}
    /> 
  );
}
