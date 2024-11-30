import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddSourcerView } from 'src/sections/add_sourcer';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Proveedores - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddSourcerView />
    </>
  );
}
