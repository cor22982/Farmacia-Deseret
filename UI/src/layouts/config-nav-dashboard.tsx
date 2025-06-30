import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Tienda Farmacia',
    path: '/products',
    icon: icon('ic-cart'),
    
  },  
  {
    title: 'Agregar Productos',
    path: '/agregarproducto',
    icon: icon('add-square'),
  },
];

export const navData_admin = [
  // {
  //   title: 'Ventas',
  //   path: '/',
  //   icon: icon('ic-sales'),
  // },
  // {
  //   title: 'Dashboard',
  //   path: '/dashboard',
  //   icon: icon('ic-analytics'),
  // },
  {
    title: 'Ventas',
    path: '/ventas',
    icon: icon('ic-sales'),
  },
  {
    title: 'Ganancias',
    path: '/ganancias',
    icon: icon('ic-money'),
  },
  {
    title: 'Productos',
    path: '/products_farmacia',
    icon: icon('ic-medicine')
  },
  {
    title: 'Presentaciones Productos',
    path: '/presentaciones',
    icon: icon('ic-packing'),
  },
  {
    title: 'Proveedores',
    path: '/proveedores',
    icon: icon('icon-park-outline--delivery'),
  },
  {
    title: 'Ubicaciones',
    path: '/ubicacion',
    icon: icon('ic--baseline-place'),
  },

  {
    title: 'Pedidos y Bodegas',
    path: '/agregarproducto',
    icon: icon('ic-bodega')
  },

   {
    title: 'Ofertas',
    path: '/products_farmacia',
    icon: icon('ic-medicine')
  },
  // {
  //   title: 'Productos No Sistema',
  //   path: '/blog',
  //   icon: icon('ic-disabled'),
  // },
  // {
  //   title: 'Pedidos Farmacia',
  //   path: '/farmacia',
  //   icon: icon('ic-order'),
  // }

];