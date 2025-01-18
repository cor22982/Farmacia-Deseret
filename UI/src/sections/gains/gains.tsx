import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Collapse, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useGetGanancias } from 'src/_mock/ganancia'; // Importa tu hook personalizado

function CollapsibleRow({ row }: { row: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => setOpen(!open)} size="small">
          {open ? (
            <Iconify icon="simple-line-icons:arrow-up" width={14} />
          ) : (
            <Iconify icon="simple-line-icons:arrow-down" width={14} />
          )}
        </IconButton>
        <Typography variant="body2" sx={{ ml: 2 }}>
          {row.articulo}
        </Typography>
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ ml: 4, mt: 1 }}>
          <Typography variant="subtitle2">Detalles:</Typography>
          {row.history.length > 0 ? (
            row.history.map((entry: any, index: number) => (
              <Typography key={index} variant="body2">
                - {entry.presentacion}: Q{entry.pp} Existencias: {entry.existencia} Ganancia: {entry.ganancia}
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
  const { getGanancias } = useGetGanancias(); // Hook para obtener datos
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ganancias = await getGanancias();
      const formattedRows = ganancias.map((ganancia, index) => ({
        id: ganancia.id,
        no: index + 1,
        articulo: ganancia.articulo,
        existencia: ganancia.existencia,
        costo: ganancia.costo.toFixed(2),
        pp: ganancia.pp.toFixed(2),
        porcentaje: `${(ganancia.ganacia ).toFixed(2)}%`,
        totalCosto: ganancia.total_costo.toFixed(2),
        totalPp: ganancia.total_pp.toFixed(2),
        history: ganancia.detalles.map((detalle) => ({
          presentacion: detalle.name,
          pp: detalle.pp.toFixed(2),
          ganancia: `${detalle.ganancia.toFixed(2)}%`,
          existencia: detalle.existencia,
        })),
      }));
      setRows(formattedRows);
    };

    fetchData();
  }, [getGanancias]);

  const columns: GridColDef<any>[] = [
    { field: 'no', headerName: 'No', width: 50 },
    {
      field: 'articulo',
      headerName: 'Artículo',
      width: 300,
      renderCell: (params) => <CollapsibleRow row={params.row} />,
    },
    { field: 'existencia', headerName: 'Existencia', type: 'number', width: 90 },
    { field: 'costo', headerName: 'Costo (Q)', type: 'number', width: 100 },
    { field: 'pp', headerName: 'PP (Q)', type: 'number', width: 80 },
    { field: 'porcentaje', headerName: 'Ganancia %', width: 100 },
    { field: 'totalCosto', headerName: 'Total Costo (Q)', type: 'number', width: 130 },
    { field: 'totalPp', headerName: 'Total PP (Q)', type: 'number', width: 100 },
  ];

  return (
    <DashboardContent>
      <Box
        sx={{
          height: 500,
          width: '100%',
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            color: 'blue',
            fontWeight: 'bold',
          },
        }}
      >
        <Typography variant="h4" flexGrow={1}>
          Ganancias del Producto
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
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
