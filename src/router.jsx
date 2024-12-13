import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';

import Booking from './views/Booking';
import Confirmation from './views/Confirmation';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route >
      <Route path='/' element={<Booking />} />
      <Route path='/confirmation' element={<Confirmation />} />
    </Route>
), {  basename: '/Strajk-bowling/'});

export default router;