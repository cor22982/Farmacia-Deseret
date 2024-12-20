import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddPresentacionesView } from 'src/sections/add_presentaciones';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Presentaciones - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddPresentacionesView />
    </>
  );
}
