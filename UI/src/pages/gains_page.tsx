import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { GainsView } from 'src/sections/gains';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Ganancias - ${CONFIG.appName}`}</title>
      </Helmet>

      <GainsView/>
    </>
  );
}
