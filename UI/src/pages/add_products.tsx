import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddProductsView } from 'src/sections/add_products';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Productos - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddProductsView />
    </>
  );
}
