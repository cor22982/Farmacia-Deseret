import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AddPlaceView } from 'src/sections/add_place';

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Ubicaciones - ${CONFIG.appName}`}</title>
      </Helmet>

      <AddPlaceView/>
    </>
  );
}
