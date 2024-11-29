import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Productos',
    path: '/products',
    icon: icon('ic-cart'),
    
  },  
  {
    title: 'Agregar Productos',
    path: '/blog',
    icon: icon('add-square'),
  },
];

export const navData_admin = [
  {
    title: 'Ventas',
    path: '/',
    icon: icon('ic-sales'),
  },
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Ganancias',
    path: '/adsfsd',
    icon: icon('ic-money'),
  },
  {
    title: 'Productos',
    path: '/products',
    icon: icon('ic-medicine')
  },
  {
    title: 'Productos No Sistema',
    path: '/blog',
    icon: icon('ic-disabled'),
  },
  {
    title: 'Pedidos Farmacia',
    path: '/farmacia',
    icon: icon('ic-order'),
  }
];