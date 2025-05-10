import type { Theme, SxProps } from '@mui/material/styles';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { Product } from 'src/_mock/product';
import { Iconify } from 'src/components/iconify';
import { useState } from 'react';

// ----------------------------------------------------------------------

type ProductSearchItemProps = {
  sx?: SxProps<Theme>;
  products: Product[];
  onSearch: (value: string) => void;
  onEnter?: () => void; // <-- función opcional
};

export function ProductSearchItem({ sx, products, onSearch, onEnter }: ProductSearchItemProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnter) {
      onEnter(); // ejecuta si se definió
    }
  };

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
      options={products}
      getOptionLabel={(product) => product.nombre}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      inputValue={inputValue}
      onInputChange={(event, value) => {
        setInputValue(value);
        onSearch(value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Buscar Productos..."
          onKeyDown={handleKeyDown}
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
