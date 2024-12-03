import Supplier from "./supplier.js";
import Schedule from "./schedule.js";
Supplier.hasMany(Schedule, { foreignKey: 'id_proveedor', as: 'horarios' });
Supplier.belongsTo(Supplier, {
  foreignKey: 'proveedor_alternativo', // Llave foránea que conecta con la misma tabla
  as: 'alternativo',                  // Alias para la relación
});
Schedule.belongsTo(Supplier, { foreignKey: 'id_proveedor', as: 'proveedor' });

export { Supplier, Schedule };