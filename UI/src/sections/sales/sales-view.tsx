import React, { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, Typography, Button, Box, Select, MenuItem } from "@mui/material";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import LinearProgress from '@mui/material/LinearProgress';


import { Jornada, Presentacion, SaleProduct } from "src/_mock/sales";
import { Supplier, useGetProveedores } from "src/_mock/supplier";
import { ProductSearchItem } from "../add_products/components/products_search";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,
  textAlign: "center",
  whiteSpace: "nowrap",
  writingMode: "vertical-rl",
  
 
  padding: "10px 5px",
  fontSize: 12,
  border: "1px solid #ccc",
}));

const StyledTableCell4 = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.black,
  textAlign: "center",
  whiteSpace: "nowrap",
  writingMode: "vertical-lr",
  
 
  padding: "10px 5px",
  fontSize: 12,
  border: "1px solid #ccc",
}));


const StyledTableCell3 = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,

  
 

  fontSize: 12,
  border: "1px solid #ccc",
}));





const StyledTableCell2 = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.black,
  textAlign: "center",
 
  

 
 
  fontSize: 12,
  border: "1px solid #ccc",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '& td, &:last-child td, &:last-child th': {
    borderBottom: "1px solid #ccc", // Asegura que la última fila tenga borde inferior
  },
}));


const headers = [
  { label: "LUNES AM", color: "#7313c2" },
  { label: "LUNES PM", color: "#1388c2" },
  { label: "MARTES AM", color: "#7313c2" },
  { label: "MARTES PM", color: "#1388c2" },
  { label: "MIERCOLES AM", color: "#7313c2" },
  { label: "MIERCOLES PM", color: "#1388c2" },
  { label: "JUEVES AM", color: "#7313c2" },
  { label: "JUEVES PM", color: "#1388c2" },
  { label: "VIERNES AM", color: "#7313c2" },
  { label: "VIERNES PM", color: "#1388c2" },
  { label: "SABADO", color: "#b86b07" },
 
];

const rows = [
  [5, 2, 2, 4, 4, 122, 28, 2, 3, 4,5],
  [5, 2, 2, 4, 4, 122, 28, 2, 3, 4,5],
  [5, 2, 2, 4, 4, 122, 28, 2, 3, 4,5],
  [5, 2, 2, 4, 4, 122, 28, 2, 3, 4,5],
];

 
const getFirstDaysOfWeeks = (year: number, month: number) => {
  const firstDays = [];
  const date = new Date(year, month, 1); // Primer día del mes

  while (date.getMonth() === month) {
    firstDays.push(new Date(date)); // Guardamos el primer día de la semana
    date.setDate(date.getDate() + (7 - date.getDay())); // Avanzamos a la próxima semana
  }

  return firstDays;
};

const getMondaysOfMonth = (year: number, month: number) => {
  const mondays = [];
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Encontrar el primer lunes del mes
  const firstMonday = new Date(firstDayOfMonth);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }

  // Obtener exactamente 4 semanas completas
  for (let i = 0; i < 4; i+=1) {
    mondays.push(firstMonday.getDate());
    firstMonday.setDate(firstMonday.getDate() + 7);
  }

  return mondays;
};

// Obtener el mes actual
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // Enero = 0, Febrero = 1...
const monthName = today.toLocaleString("es-ES", { month: "long" });
const weekDays = getMondaysOfMonth(year, month);

const fechaObjetivo = new Date("2025-03-11"); // Fecha a verificar

const fechaActual = new Date();
const diaSemanaActual = fechaActual.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
const formatDate = (date: Date) => date.toISOString().split("T")[0];
// Calcular el primer día de la semana (lunes)
const primerDiaSemana = new Date(fechaActual);
primerDiaSemana.setDate(fechaActual.getDate() - ((diaSemanaActual + 6) % 7)); // Retrocede hasta el lunes
primerDiaSemana.setHours(0, 0, 0, 0); // Normalizar hora

// Calcular el último día de la semana (sábado)
const ultimoDiaSemana = new Date(primerDiaSemana);
ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 5); // Avanza 5 días desde el lunes
ultimoDiaSemana.setHours(23, 59, 59, 999); // Normalizar hora

// Verificar si la fecha está en el rango de lunes a sábado
const estaEnLaSemana = fechaObjetivo >= primerDiaSemana && fechaObjetivo <= ultimoDiaSemana;

console.log("Primer día de la semana (Lunes):", primerDiaSemana.toLocaleDateString("es-ES"));
console.log("Último día de la semana (Sábado):", ultimoDiaSemana.toLocaleDateString("es-ES"));
console.log("¿La fecha está en esta semana?", estaEnLaSemana);


export const getWeeksOfMonth = (anio: number, mes: number) => {
  const weeks = [];
  const date = new Date(anio, mes, 1);

  // Ajustar al primer lunes del mes
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }

  // Generar semanas hasta que el mes termine
  while (date.getMonth() === mes) {
    const startOfWeek = new Date(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

    weeks.push({
      start: startOfWeek.toISOString().split("T")[0],
      end: endOfWeek.toISOString().split("T")[0],
    });

    // Avanzar a la siguiente semana
    date.setDate(date.getDate() + 7);
  }

  return weeks;
};





export function SalesView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
 
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 200;
  
  const [suppliers, setSupliers] = useState<Supplier[]>([]);
  const { getProvedor_ById } = useGetProveedores();
  const {llamado: getVentas } = useApi(`${source_link}/sales_this_week`);
  const [salesData, setSalesData] = useState<SaleProduct[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [hasMore, setHasMore] = useState(true);

  

 
  const [value_suplier, setValueSupplier] = useState(100000); 







  const [buscar, setBuscar_valor] = useState('')


  const [cargando, setCargando] = useState(true)





  const on_search_supplier = async(n: string) => {
    
    setBuscar_valor(n)
    setValueSupplier(Number(n))

  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
     const fetchSupplier = async () => {
        try {
          const fetchedSuppliers = await getProvedor_ById();
          setSupliers(fetchedSuppliers)
          
        
        } catch (error_t) {
          console.error("Error fetching places:", error_t);
        }
      };

    fetchSupplier();
    const fetchSales = async () => {

      setIsRendering(true)


      try{            
        const requestBody = {
            startDate: formatDate(primerDiaSemana),
            endDate: formatDate(ultimoDiaSemana),
            offset,
            limit,
            search: buscar
          };
        const data =await  getVentas(requestBody, "POST");


        if (data.success) {

        
          setSalesData(data.sales.sales);

        // console.log(data.sales.sales)

          
        
        } else {
          console.error("Error en la respuesta del servidor:", data);
        }
        setLoading(false);
        

      }catch (error) {
        console.error("Error fetching places:", error);
      }finally {
        setIsRendering(false); // Termina el renderizado cuando los productos se cargan
      }

    }
    fetchSales();

    setCargando(false)
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, offset]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
  };

  


  const on_Search_demand = async() => {
    
    setBuscar_valor(searchValue)


  }


  // Escuchar scroll para detectar fondo
  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const [isRendering, setIsRendering] = useState(true);


   
  

  return (
    <TableContainer component={Paper}>
      
      <Typography variant="h4" flexGrow={1}>
                Ventas
              </Typography>

              <div style={{display: 'flex', gap: '2rem'}}>
                <ProductSearchItem   
                  onSearch={handleSearch}
                  onEnter={on_Search_demand}
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
              </div>
               
              {!loading && (
                <Box display="flex" justifyContent="center" p={2} gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                    disabled={offset === 0 || loading}
                  >
                    Atrás
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOffset((prev) => prev + limit)}
                    disabled={!hasMore || loading}
                  >
                    Siguiente
                  </Button>
                </Box>
              )}

      {
        isRendering? (
                  <LinearProgress />  // Muestra el CircularProgress mientras los productos se cargan
                ) : (
      <Table sx={{ minWidth: 800 }} aria-label="customized table">
        <TableHead>
          <TableRow>
          <StyledTableCell2  sx={{ backgroundColor: "##ffffff" }}>
                NOMBRE
              </StyledTableCell2>
          <StyledTableCell2  sx={{ backgroundColor: "##ffffff" }}>
                EXIS
              </StyledTableCell2>
            {headers.map((header, index) => (
              <StyledTableCell key={index} sx={{ backgroundColor: header.color }}>
                {header.label}
              </StyledTableCell>
            ))}
            <StyledTableCell2  sx={{ backgroundColor: "##ffffff" }}>
               NVA EXIS
              </StyledTableCell2>
              <StyledTableCell2  sx={{ backgroundColor: "#ffffff" }}>
               PEDI EXIS
              </StyledTableCell2>
              <StyledTableCell2  sx={{ backgroundColor: "#f09b86" }}>
               pp
              </StyledTableCell2>
              <StyledTableCell2  sx={{ backgroundColor: "#ffffff" }}>
               OBSERVACIONES
              </StyledTableCell2>
              <StyledTableCell2  sx={{ backgroundColor: "#5cd93b" }}>
               FECHA VENCIMIENTO
              </StyledTableCell2>
              <StyledTableCell4  sx={{ backgroundColor: "#71d3e3" }}>
               BODEGA
              </StyledTableCell4>
              <StyledTableCell  sx={{ backgroundColor: "#826f30" }}>
               COMPRAS
              </StyledTableCell>
              <StyledTableCell3  sx={{ backgroundColor: "#b86b07" }}>
               FECHA COMPRA
              </StyledTableCell3>
              
              {weekDays.map((day, index) => (
              <StyledTableCell key={index} sx={{ backgroundColor: "#368024" }}>
                SEMANA  {day} {monthName}
              </StyledTableCell>
            ))}
            <StyledTableCell sx={{ backgroundColor: "#368024" }}>
               TOTAL
              </StyledTableCell>
              <StyledTableCell sx={{ backgroundColor: "#368024" }}>
               PROMEDIO
              </StyledTableCell>
              <StyledTableCell sx={{ backgroundColor: "#368024" }}>
               1 MES
              </StyledTableCell>
              <StyledTableCell sx={{ backgroundColor: "#368024" }}>
               2 MES
              </StyledTableCell>
              

          </TableRow>
        </TableHead>
        <TableBody>

          {salesData.map((product, rowIndex)=>(
            <StyledTableRow key={rowIndex}>
              <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {product.producto}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
  {
    product.presentacionCantidad > 0
      ? (
          (product.existencias + product.ventasPorDia.reduce((acc: any, venta: any) => acc + venta, 0)) /
          product.presentacionCantidad
        ).toFixed(0)
      : 0
  }
</TableCell>


                      {product.ventasPorDia.map((venta: number, index: React.Key | null | undefined) => {
                        const cantidad = product.presentacionCantidad ?? 1; // fallback in case presentacionCantidad is undefined
                        const result = typeof venta === 'number' ? venta / cantidad : 0;
                        return (
                          <TableCell key={index} align="center" sx={{ border: "1px solid #ccc" }}>
                            {result.toFixed(0)} {/* Muestra 0 si no es un número */}
                          </TableCell>
                        );
                      })}




                 <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
  {
    product.presentacionCantidad > 0
      ? (product.existencias / product.presentacionCantidad).toFixed(2)
      : 0
  }
</TableCell>



                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  0
                </TableCell>

                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  { product.presentacion}
                </TableCell>

                <TableCell align="center" sx={{ border: "1px solid #ccc" }}/>
                    

                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                 {product.fecha_vencimiento}
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  0
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  0
                </TableCell>

                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                 {product.fecha_compra}
                </TableCell>

                {product.ventasPorSemana.map((venta: any, index: React.Key | null | undefined) => {
                  const result = Number(venta) / product.presentacionCantidad;
                  return (
                    <TableCell key={index} align="center" sx={{ border: "1px solid #ccc" }}>
                      {Number.isNaN(result) ? 0 : result.toFixed(0)}
                    </TableCell>
                  );
                })}


                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  {
                    Number.isNaN(
                      product.ventasPorSemana.reduce((acc: any, venta: any) => acc + venta, 0) / product.presentacionCantidad
                    )
                      ? 0
                      : (
                          product.ventasPorSemana.reduce((acc: any, venta: any) => acc + venta, 0) / product.presentacionCantidad
                        ).toFixed(0)
                  }
                </TableCell>

                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                {(() => {
                  const ventasNoNulas = product.ventasPorSemana.filter((venta: number) => venta !== 0);
                  const sumaVentas = ventasNoNulas.reduce((acc: number, venta: number) => acc + venta, 0);
                  const cantidadVentas = ventasNoNulas.length || 1; // Evita división por 0
                  const result = (sumaVentas / cantidadVentas) / product.presentacionCantidad;
                  return Number.isNaN(result) ? 0 : result.toFixed(0);
                })()}
              </TableCell>


              <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
  {(() => {
    const totalVentas = product.ventasPorSemana.reduce((acc: any, venta: any) => acc + venta, 0);
    const result = totalVentas / product.presentacionCantidad;
    return Number.isNaN(result) ? 0 : result.toFixed(0);
  })()}
</TableCell>

<TableCell align="center" sx={{ border: "1px solid #ccc" }}>
  {(() => {
    const totalVentas = product.ventasPorSemana.reduce((acc: any, venta: any) => acc + venta, 0);
    const result = (2 * totalVentas) / product.presentacionCantidad;
    return Number.isNaN(result) ? 0 : result.toFixed(0);
  })()}
</TableCell>

            </StyledTableRow>

          ))}
          {/* {salesData.map((product, rowIndex) => (
            <StyledTableRow key={rowIndex}>
              
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {product.producto}
                </TableCell>
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {(product.presentaciones[0].jornadas.reduce((sum, jornada) => sum + jornada.totalCantidad, 0) + product.existencias) /product.presentaciones[0].presentacionCantidad }
                </TableCell>
               
                 

                {[
                  "LUNES-AM", "LUNES-PM",
                  "MARTES-AM", "MARTES-PM",
                  "MIERCOLES-AM", "MIERCOLES-PM",
                  "JUEVES-AM", "JUEVES-PM",
                  "VIERNES-AM", "VIERNES-PM",
                  "SABADO"
                ].map((jornadaLabel, jindex) => {
                  const jornadaData = product.presentaciones[0].jornadas.find(j => j.jornada === jornadaLabel);
                  return (
                    <TableCell key={jindex} align="center" sx={{ border: "1px solid #ccc" }}>
                      {jornadaData ? (jornadaData.totalCantidad / product.presentaciones[0].presentacionCantidad) : ""}
                    </TableCell>
                  );
                })}
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {product.existencias /product.presentaciones[0].presentacionCantidad }
                </TableCell>
                <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                  0
                </TableCell>
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  Q{product.presentaciones[0].presentacion }
                </TableCell>

                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}/>
                  
                
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {product.presentaciones[0].fecha_vencimiento}
                </TableCell>
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}/>
                  
                
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}/>
                  
              
                <TableCell key={rowIndex} align="center" sx={{ border: "1px solid #ccc" }}>
                  {product.presentaciones[0].fecha_compra}
                </TableCell>
                
                {monthlySales.map((weekData, index) => {
                  // Sumar todas las cantidades de la semana
                  const totalCantidadSemana = weekData.sales.reduce(
                    (total: any, sale: { totalCantidad: any; }) => total + (sale.totalCantidad || 0), // Evitar valores undefined
                    0
                  );

                  return (
                    <TableCell key={index} align="center" sx={{ border: "1px solid #ccc" }}>
                      {totalCantidadSemana /product.presentaciones[0].presentacionCantidad}
                    </TableCell>
                  );
                })}

                



            </StyledTableRow>
          ))} */}
        </TableBody>
      </Table>


                  
                )
      }


  
    </TableContainer>
  );
}

export default SalesView;