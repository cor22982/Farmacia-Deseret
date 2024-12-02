import Supplier from "./supplier.js";
import Schedule from "./schedule.js";
Supplier.hasMany(Schedule, { foreignKey: 'id_proveedor', as: 'horarios' });
Schedule.belongsTo(Supplier, { foreignKey: 'id_proveedor', as: 'proveedor' });

export { Supplier, Schedule };