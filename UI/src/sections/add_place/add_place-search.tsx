import type { Theme, SxProps } from '@mui/material/styles';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import { Place } from 'src/_mock/places';
import { Iconify } from 'src/components/iconify';



// ----------------------------------------------------------------------

type PlaceSearchItemProps = {
  places: Place[];
  sx?: SxProps<Theme>;
  onSearch: (value: string) => void;
};

export function PlaceSearchItem({ places, sx, onSearch }: PlaceSearchItemProps) {
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
      options={places}
      getOptionLabel={(place) => place.ubicacion}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(event, value) => onSearch(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Buscar Ubicaciones..."
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
