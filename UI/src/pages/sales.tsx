import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { SalesView } from 'src/sections/sales';

import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Ventas - ${CONFIG.appName}`}</title>
      </Helmet>

      <SalesView />
    </>
  );
}
