import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { DashboardContent } from 'src/layouts/dashboard';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Collapse, IconButton, MenuItem, Paper, Select } from '@mui/material';
import { ModalPresentacionProduct } from 'src/components/ModalForms/ModalPresentacionProduct';
import { Iconify } from 'src/components/iconify';
import { ModalStepper } from 'src/components/Stepper/Add_Cantidades_Presentaciones';
import { useGetGanancias } from 'src/_mock/ganancia'; // Importa tu hook personalizado
import { Supplier, useGetProveedores } from 'src/_mock/supplier';
import { ProductSearchItem } from '../add_products/components/products_search';


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
  const [call1, setCall1] = useState(0);
  const [openm2, setOpenM2] = useState(false);
  const [valueProduct, setValueProduct] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [value_suplier, setValueSupplier] = useState(100000); 
  const { getProvedor_ById } = useGetProveedores();

  const [buscar, setBuscar_valor] = useState('')

  const openProduct = (id:number) => {
    setValueProduct(id);
    setOpenM2(true);
  };

  useEffect(() => {

    const fetchSupplier = async () => {
        try {
          const fetchedSuppliers = await getProvedor_ById();
          setSupliers(fetchedSuppliers)
          
        
        } catch (error_t) {
          console.error("Error fetching places:", error_t);
        }
      };
    const fetchData = async () => {
      const ganancias = await getGanancias('200', '0', buscar);
      const formattedRows = ganancias.map((ganancia, index) => ({
        id: ganancia.id,
        no: index + 1,
        articulo: ganancia.articulo,
        existencia: ganancia.existencia,
        costo: ganancia.costo.toFixed(2),
        pp: ganancia.pp.toFixed(2),
        porcentaje: `${(ganancia.ganacia).toFixed(2)}%`,
        totalCosto: ganancia.total_costo.toFixed(2),
        totalPp: ganancia.total_pp.toFixed(2),
        history: ganancia.detalles.map((detalle) => ({
          presentacion: `${detalle.name} X ${detalle.cantidad_presentacion}`,
          pp: detalle.pp.toFixed(2),
          ganancia: `${detalle.ganancia.toFixed(2)}%`,
          existencia: detalle.existencia,
        })),
      }));
      setRows(formattedRows);
    };

    fetchData();
    fetchSupplier();
  }, [buscar, getGanancias , getProvedor_ById]);

  // Calcular resumen
  const totalCosto = rows.reduce((acc, row) => acc + parseFloat(row.totalCosto), 0);
  const totalPp = rows.reduce((acc, row) => acc + parseFloat(row.totalPp), 0);
  const averageGanancia = rows.reduce((acc, row) => acc + parseFloat(row.porcentaje.replace('%', '')), 0) / rows.length;
   const [suppliers, setSupliers] = useState<Supplier[]>([]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
  };

  const on_Search_Demand = async() => {
    setBuscar_valor(searchValue)


  }

   const on_search_supplier = async(n: string) => {
     setValueSupplier(Number(n))
    //  const ganancias = await getGanancias('200', '0', n);
    //  const formattedRows = ganancias.map((ganancia, index) => ({
    //     id: ganancia.id,
    //     no: index + 1,
    //     articulo: ganancia.articulo,
    //     existencia: ganancia.existencia,
    //     costo: ganancia.costo.toFixed(2),
    //     pp: ganancia.pp.toFixed(2),
    //     porcentaje: `${(ganancia.ganacia).toFixed(2)}%`,
    //     totalCosto: ganancia.total_costo.toFixed(2),
    //     totalPp: ganancia.total_pp.toFixed(2),
    //     history: ganancia.detalles.map((detalle) => ({
    //       presentacion: `${detalle.name} X ${detalle.cantidad_presentacion}`,
    //       pp: detalle.pp.toFixed(2),
    //       ganancia: `${detalle.ganancia.toFixed(2)}%`,
    //       existencia: detalle.existencia,
    //     })),
    //   }));
    //   setRows(formattedRows);

    setBuscar_valor(n)

    
  }
  

  const columns: GridColDef<any>[] = [
    { field: '', headerName: '', width: 50,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => { openProduct(params.row.id); }}>
          <Iconify icon="mdi:pencil" width={20} />
        </IconButton>
      )
     },
    { field: 'no', headerName: 'No', width: 50 },
    {
      field: 'articulo',
      headerName: 'Artículo',
      width: 250,
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
      <ModalStepper
        setCall={setCall1}
        id_product={valueProduct}
        open={openm2}
        handleClick={() => {}}
        handleClose={() => setOpenM2(false)}
      />
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

        <Box display="flex" gap="1rem" marginBottom="1rem">
          <ProductSearchItem
                
                onSearch={handleSearch}
                onEnter={on_Search_Demand}
                products={[]}/>

        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        sx={{
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#919191',
                            },
                            '&:hover fieldset': {
                              borderColor: '#262626',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#050505',
                              borderWidth: 2,
                            },
                          },
                        }}
                        value={value_suplier}
                        onChange={(e) => on_search_supplier(String(e.target.value))}
                      >
                        <MenuItem value={100000}>
                          <em>Proveedor</em>
                        </MenuItem>
                        {suppliers.map((suplie) => (
                          <MenuItem value={suplie.id}>
                            <em>{suplie.nombre}</em>
                          </MenuItem>
                        ))}
                  </Select>

        </Box>
        
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

      {/* Resumen */}
      <Box sx={{ marginTop: 2 }}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <br/>
          <br/>
          <br/>
          <Typography variant="h6" gutterBottom>
            Resumen
          </Typography>
          <Typography variant="body1">
            Promedio de Ganancia: {averageGanancia.toFixed(2)}%
          </Typography>
          <Typography variant="body1">
            Sumatoria Total de Costo: Q{totalCosto.toFixed(2)}
          </Typography>
          <Typography variant="body1">
            Sumatoria Total de PP: Q{totalPp.toFixed(2)}
          </Typography>
        </Paper>
      </Box>
    </DashboardContent>
  );
}
