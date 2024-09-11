import './App.css';
import JsonDisplay from './components/JsonDisplay';
import Navbar from './components/Navbar/Navbar';
import Login from './Pages/Login';
import Categories from './Pages/Categories';
import ShopCat from './Pages/ShopCat';
import Listing from './Pages/Listing';
import FAQ from './Pages/FAQ';
import geo from './Pages/geo';
import user from './Pages/user';
import search from './Pages/search';
import LandingPage from './UserAcccountManagent/LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/'element={<Categories/>}/>
        <Route path='/Electronics'element={<ShopCat category = "Electronics"/>}/>
        <Route path='/Services'element={<ShopCat category = "Services"/>}/>
        <Route path='/Supplies'element={<ShopCat category = "Supplies"/>}/>
        <Route path="/Listing" element={<Listing/>}>
          <Route path=':ListingID' element={<Listing/>}/>
        </Route>
        <Route path='/cart' element={<cart/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/FAQ' element={<FAQ/>}/>
        <Route path='/geo' element={<geo/>}/>
        <Route path='/user' element={<user/>}/>
        <Route path='/search' element={<search/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
  
}

export default App;