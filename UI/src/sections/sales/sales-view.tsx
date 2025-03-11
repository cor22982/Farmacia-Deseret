import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, styled, Typography } from "@mui/material";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { Jornada, Presentacion, SaleProduct } from "src/_mock/sales";

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
const requestBody = {
  startDate: formatDate(primerDiaSemana),
  endDate: formatDate(ultimoDiaSemana),
};

export function SalesView() {
  const {llamado: getVentas } = useApi(`${source_link}/sales_this_week`);
  const [salesData, setSalesData] = useState<SaleProduct[]>([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchSales = async () => {
      const data =await  getVentas(requestBody, "POST");
      if (data.success) {
        setSalesData(data.sales);
      
      } else {
        console.error("Error en la respuesta del servidor:", data);
      }
    }
    fetchSales();
  }, [getVentas]);
  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" flexGrow={1}>
                Ventas
              </Typography>
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
          {salesData.map((product, rowIndex) => (
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



            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SalesView;