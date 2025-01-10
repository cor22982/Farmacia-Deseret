import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Collapse, IconButton } from '@mui/material';
import { useState } from 'react';
import { Iconify } from 'src/components/iconify';

const rows = [
  { 
    no: 1,
    id: 5,
    
    articulo: 'ACEITE DE RICINO 1 ONZ LASANA',
    existencia: 3,
    costo: 6.5,
    pp: 11.0,
    porcentaje: '41%',
    totalCosto: 19.5,
    totalPp: 33.0,
    history: [
      { presentacion: 'Blister x 10', pp: 3.5, ganancia: '45%' },
      { presentacion: 'Caja x 100', pp: 20.5, ganancia: '75%' }
    ],
  },
  {
    no: 2,
    id: 2,
    
    articulo: 'ACETAMINOFEN 500 MG BLIST X 10 CAJA X 100 CAP/ARGUS',
    existencia: 66,
    costo: 1.42,
    pp: 2.5,
    porcentaje: '43%',
    totalCosto: 93.59,
    totalPp: 165.0,
    history: [{ presentacion: 'Blister x 10', pp: 3.5, ganancia: '45%'}],
  },
  {
    no: 3,
    id: 3,
    
    articulo: 'ACICLOVIR 400 MG/5ML FCO 100 ML CAPLIN',
    existencia: 2,
    costo: 19.95,
    pp: 38.0,
    porcentaje: '48%',
    totalCosto: 39.9,
    totalPp: 76.0,
    history: [],
  },
];

const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'no', headerName: 'No', width: 30 },
  { field: 'articulo', headerName: 'Artículo', width: 250, editable: true },
  { field: 'existencia', headerName: 'Existencia', type: 'number', width: 90 },
  { field: 'costo', headerName: 'Costo (Q)', type: 'number', width: 100 },
  { field: 'pp', headerName: 'PP (Q)', type: 'number', width: 80 },
  { field: 'porcentaje', headerName: 'Ganancia %', width: 100 },
  { field: 'totalCosto', headerName: 'Total Costo (Q)', type: 'number', width: 130 },
  { field: 'totalPp', headerName: 'Total PP (Q)', type: 'number', width: 100 },
];

function CollapsibleRow({ row }: { row: typeof rows[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => setOpen(!open)} size="small">
          {open ? <Iconify icon="simple-line-icons:arrow-up" width={14}/> : <Iconify icon="simple-line-icons:arrow-down"width={14} />}
        </IconButton>
        <Typography variant="body2" sx={{ ml: 2 }}>
          {row.articulo}
        </Typography>
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ ml: 4, mt: 1 }}>
          <Typography variant="subtitle2">Detalles:</Typography>
          {row.history.length > 0 ? (
            row.history.map((entry, index) => (
              <Typography key={index} variant="body2">
                - {entry.presentacion}: Q{entry.pp}  Existencias {100}  Ganancia:{entry.ganancia}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">Sin detalles disponibles.</Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export function GainsView() {
  return (
    <DashboardContent>
      <Box
        sx={{
          height: 500,
          width: '100%',
          border: 'none', // Eliminar el borde
          '& .MuiDataGrid-root': {
            border: 'none', // Eliminar el borde en la raíz
          },
          '& .MuiDataGrid-columnHeaders': {
            color: 'blue', // Cambia el color del texto de los headers
            fontWeight: 'bold',
            
          },
        }}
      >
        <Typography variant="h4" flexGrow={1}>
          Ganancias del Producto
        </Typography>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'id', headerName: 'No', width: 50 },
            {
              field: 'articulo',
              headerName: 'Artículo',
              width: 300,
              renderCell: (params) => <CollapsibleRow row={params.row} />,
            },
            ...columns.filter((col) => col.field !== 'articulo' && col.field !== 'no'),
          ]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
        />
      </Box>
    </DashboardContent>
  );
}
