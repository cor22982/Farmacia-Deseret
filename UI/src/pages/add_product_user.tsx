import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddProductUserView } from 'src/sections/add_product_user/add_product_user';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Agregar Productos - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddProductUserView />
    </>
  );
}
