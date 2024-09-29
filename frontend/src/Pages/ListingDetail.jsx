// src/Pages/ListingDetail.jsx
import { useParams } from 'react-router-dom';

const ListingDetail = () => {
  const { ListingID } = useParams(); // Get the ListingID from the URL

  return (
    <div>
      <h1>Listing ID: {ListingID}</h1>
      <p>This is the detail page for the listing.</p>
      {/* You can add additional elements here later for editing the listing */}
    </div>
  );
};

export default ListingDetail;
