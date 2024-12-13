import { createBrowserRouter } from 'react-router-dom';

import Booking from './views/Booking';
import Confirmation from './views/Confirmation';

const router = createBrowserRouter([
    {
      path: '/Strajk-bowling/',
      element: <Booking />,
    },
    {
      path: '/Strajk-bowling/confirmation',
      element: <Confirmation />,
    }
]);

export default router;