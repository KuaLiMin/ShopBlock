import './App.css';
import Navbar from './components/Navbar/Navbar';



import Login from './components/UserAccountManagement/Login';
import Profile from './components/UserAccountManagement/Profile';


import Browse from './components/Listing/Browse';
import Listing from './components/Listing/Listing';


import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div >
      <BrowserRouter>
      <Navbar/>
      <div style={{ padding: '20px' }}>
      <Routes>
        <Route path='' element={<Login />}/>
        <Route path='/browse' element={<Browse />}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/listing/:id' element={<Listing/>}/>
      </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;