import './App.css';
import Navbar from './components/Navbar/Navbar';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import ResetPassword from './Pages/ResetPassword';
import ChangePassword from './Pages/ChangePassword';
import UserProfile from './Pages/UserProfile';
import Categories from './Pages/Categories';
import ShopCat from './Pages/ShopCat';
import Listing from './Pages/Listing';
import TransactionHistory from './Payment/TransactionHistory';
import FAQ from './Pages/FAQ';
import Support from './Pages/Support';
import geo from './Pages/geo';
import user from './Pages/user';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import electronics_banner from './components/Images/banner_mens.png'
import services_banner from './components/Images/banner_women.png'
import supplies_banner from './components/Images/banner_kids.png'
import ListingDetail from './Pages/ListingDetail';
import ListOfOffers from './Pages/ListOfOffers';

function App() {
  return (
    <div >
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Categories />} />
          <Route path='/electronics' element={<ShopCat.EL banner={electronics_banner} />} />
          <Route path='/supplies' element={<ShopCat.SU banner={supplies_banner} />} />
          <Route path='/services' element={<ShopCat.SE banner={services_banner} />} />
          <Route path="/listing" element={<Listing />} />
          <Route path="/user/:user_id" element={<Listing />} />
          <Route path="/listing/:slug" element={<ListingDetail />} />
          <Route path='/cart' element={<cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/resetpassword' element={<ResetPassword />} />
          <Route path='/changepassword' element={<ChangePassword />} />
          <Route path='/FAQ' element={<FAQ />} />
          <Route path='/support' element={<Support />} />
          <Route path='/geo' element={<geo />} />
          <Route path='/user' element={<user />} />
          <Route path='/userprofile/:userId' element={<UserProfile />} />
          <Route path='/history' element={<TransactionHistory />} />
          <Route path='/offers' element={<ListOfOffers />} />
        </Routes>
        <Support />
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;