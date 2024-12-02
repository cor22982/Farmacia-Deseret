type DiaDeLaSemana = "domingo" | "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado";
 
export const diasDeLaSemana: Record<DiaDeLaSemana, number> = {
  "domingo": 0,
  "lunes": 1,
  "martes": 2,
  "miércoles": 3,
  "jueves": 4,
  "viernes": 5,
  "sábado": 6,
};

export function obtenerNumeroDelDia(dia: string) {
  const diaLowerCase = dia.toLowerCase() as DiaDeLaSemana; // Aseguramos que el string es una clave válida
  return diasDeLaSemana[diaLowerCase] ?? "Día no válido";
}

export function obtenerDiaDeLaSemana(numero: number): string {
  const diasDeLaSemanaArray: DiaDeLaSemana[] = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  
  if (numero >= 0 && numero <= 6) {
    return diasDeLaSemanaArray[numero];
  }
  return "Número no válido";
}
