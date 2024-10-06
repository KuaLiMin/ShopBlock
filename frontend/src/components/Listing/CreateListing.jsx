import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Listing.css'; // Make sure to create this CSS file
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
  } from '@mui/material';


const CreateListing = ({ isModalOpen, toggleModal }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    unit: 'day',
    category: 'electronics',
    description: '',
  });

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
};

const handleSubmit = (e) => {
    e.preventDefault();
    
};


return (
    <Dialog open={isModalOpen} onClose={toggleModal} maxWidth="md" fullWidth>
      <DialogTitle>Create Listing</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Left side - Title, Price, Unit, Category, Add Photo */}
            <Grid item xs={12} sm={6}>
              {/* Title */}
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              
              {/* Price and Unit */}
              <Grid container spacing={2} style={{ marginTop: '16px' }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="day">Day</MenuItem>
                      <MenuItem value="hour">Hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Category */}
              <FormControl fullWidth style={{ marginTop: '16px' }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="services">Services</MenuItem>
                  <MenuItem value="supplies">Supplies</MenuItem>
                </Select>
              </FormControl>

              {/* Add Photo */}
              <Button variant="contained" component="label" style={{ marginTop: '16px' }}>
                📷 Add Photo
                <input type="file" hidden />
              </Button>
            </Grid>

            {/* Right side - Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={toggleModal} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
  
//   return (
//     isModalOpen && (
//       <div className="modal-overlay" onClick={toggleModal}>
//         <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//           <div className="modal-header">
//             <h2>Create Listing</h2>
//             <button className="close-btn" onClick={toggleModal}>✖</button>
//           </div>
//           <form className="listing-form" onSubmit={handleSubmit}>
//             <div className="form-left">
//               <div className="form-group">
//                 <label>Title</label>
//                 <input type="text" name="title" placeholder="Enter title" value={formData.title} onChange={handleChange} required />
//               </div>
//               <div className="form-row">
//                 <div className="form-group half-width">
//                   <label>Price</label>
//                   <input type="number" name="price" placeholder="Enter price" value={formData.price} onChange={handleChange} required />
//                 </div>
//                 <div className="form-group half-width">
//                   <label>Unit</label>
//                   <select name="unit" value={formData.unit} onChange={handleChange} required>
//                     <option value="day">Day</option>
//                     <option value="hour">Hour</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label>Category</label>
//                 <select name="category" value={formData.category} onChange={handleChange} required>
//                   <option value="electronics">Electronics</option>
//                   <option value="services">Services</option>
//                   <option value="supplies">Supplies</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Add Photo</label>
//                 <button type="button" className="add-photo-btn">📷 Add photo</button>
//               </div>
//             </div>
//             <div className="form-right">
//               <div className="form-group">
//                 <label>Description</label>
//                 <textarea name="description" placeholder="Enter description" value={formData.description} onChange={handleChange} required></textarea>
//               </div>
//             </div>
//             <button type="submit" className="submit-btn">Submit</button>
//           </form>
//         </div>
//       </div>
//     )
//   );


};

export default CreateListing;