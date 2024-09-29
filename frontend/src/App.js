import './App.css';
import JsonDisplay from './components/JsonDisplay';
import Navbar from './components/Navbar/Navbar';
import Login from './Pages/Login';
import Categories from './Pages/Categories';
import ShopCat from './Pages/ShopCat';
import Listing from './Pages/Listing';
import TransactionHistory from './Payment/TransactionHistory';
import FAQ from './Pages/FAQ';
import geo from './Pages/geo';
import user from './Pages/user';
import search from './Pages/search';
import LandingPage from './UserAcccountManagent/LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import electronics_banner from './components/Images/banner_mens.png'
import services_banner from './components/Images/banner_women.png'
import supplies_banner from './components/Images/banner_kids.png'
import ListingDetail from './Pages/ListingDetail';

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path='/'element={<Categories/>}/>
        <Route path='/electronics'element={<ShopCat banner ={electronics_banner} category = "electronics"/>}/>
        <Route path='/services'element={<ShopCat banner = {services_banner} category = "services"/>}/>
        <Route path='/supplies'element={<ShopCat banner = {supplies_banner} category = "supplies"/>}/>
        <Route path="/Listing" element={<Listing/>}>
            <Route path=':ListingID' element={<Listing />} />
        </Route>
        <Route path='/cart' element={<cart/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/FAQ' element={<FAQ/>}/>
        <Route path='/geo' element={<geo/>}/>
        <Route path='/user' element={<user/>}/>
        <Route path='/search' element={<search/>}/>
        <Route path='/history' element={<TransactionHistory/>}/>
      </Routes>
      <Footer/>
      </BrowserRouter>
    </div>
  );
  
}

export default App;