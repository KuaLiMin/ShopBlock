1. SHOPBLOCK (FRONTEND)

Table of Content

1. SHOPBLOCK FRONT END
2. Setup Instructions
3. Web Design
- 3.1 App Component Structure
- 3.2 Pages Folder
- 3.3 Components Folder
- 3.4 Routing and Dynamic Imports
- 3.5 Styling
- 3.6 Design approach
4. Tech Stack
5. Extenal APIS

2. Set up INstructions
1. In the /frontend directory, install the required node modules.
npm install
2. Start the application
npm start

You'll be ready to start the ShopBlock Frontend website, the application will run on http://localhost:3000/

Web Design
### Web Design Explanation for ShopBlock

The web design of the **ShopBlock** frontend, built using **React.js**, is organized around a modular and component-based structure. This approach promotes code reusability and improves maintainability by separating common UI elements and utilities. Here’s an in-depth breakdown of the design and structure based on the provided code and directory layout:

---

#### 1. **App Component Structure**
The `App.js` file serves as the central component of the application. It imports necessary components, pages, images, and utilities, and defines the routing for different pages of the application. Here’s a breakdown of how `App.js` functions:

- **Router Setup**: 
  - Uses `BrowserRouter`, `Routes`, and `Route` from `react-router-dom` to manage client-side routing.
  - Each route defines a URL path and its corresponding component (page) that should be rendered when the path is accessed.
  
- **Component Hierarchy**: 
  - `Navbar` and `Footer` are imported and displayed on every page since they’re placed outside the `<Routes>` component. This makes them persistent across the app, giving users easy navigation and footer access.

#### 2. **Pages Folder**
The **Pages** directory contains the main UI components that represent the full pages within the application, such as `Login`, `SignUp`, `Categories`, and `FAQ`. Each of these pages is mapped to a route in `App.js`, allowing users to navigate to them. Here’s a quick overview of key pages:

- **Categories**: Likely the home page, showcasing the main categories for navigation.
- **ShopCat**: Displays listings under specific categories (e.g., electronics, supplies, services).
  - Sub-routes under this include different banners that visually represent the categories.
- **Listing and ListingDetail**: Used to display a specific product/service listing in detail.
- **UserProfile**: Displays individual user profiles.
- **TransactionHistory** and **RenterTransactionHistory**: Provides pages where users can view transaction history.
  
The design ensures each page serves a specific function, making it easy for users to access different aspects of the application.

#### 3. **Components Folder**
The **Components** directory holds reusable elements that are shared across multiple pages. It contains both UI components and utility components, which are organized into subfolders for better structure:

- **Navbar**: The navigation bar, containing links to key sections like categories and user options.
- **Footer**: The footer, providing additional site navigation or information.
- **Filterbar**: A component that likely provides filtering functionality for listings.
- **Payment**: This folder might include components related to payment processes, such as payment buttons or transaction components.
  
These components provide flexibility and reusability. For instance, `Filterbar` could be used across various listing pages to refine search results, while `Navbar` and `Footer` are used consistently across the application.

#### 4. **Routing and Dynamic Imports**
The routing logic in `App.js` defines dynamic routes that load different pages based on the URL path. Here’s how it’s set up:

- **Dynamic Categories**:
  - Routes like `'/electronics/'`, `'/supplies/'`, and `'/services/'` dynamically load the **ShopCat** component with different category banners. This lets the same component render different content based on the category, streamlining code maintenance.
- **Dynamic User Profiles and Listings**:
  - Routes like `'/user/:user_id'` and `'/listing/:slug'` are set up to load user-specific profiles and individual listings based on the ID or slug in the URL. The slug format enables SEO-friendly URLs and user-friendly links.
  
#### 5. **Styling**
The `App.css` file is imported at the top of `App.js` to style the app globally. Each page and component may also have its own CSS file within its folder (e.g., **Pages** and **Components**), ensuring modular and isolated styles.

#### 6. **Image Management**
Images, like `electronics_banner`, `services_banner`, and `supplies_banner`, are imported and used in specific routes to provide relevant banners for different categories. Storing images within `components/Images` keeps them organized and easy to manage.

---

### Example Walkthrough of the ShopBlock Application Workflow

1. **Landing on the Categories Page**:
   - When a user navigates to the root path `'/'`, they’re directed to the `Categories` page. This page likely showcases the main categories (e.g., electronics, supplies, services) and serves as a gateway to other parts of the site.

2. **Browsing a Category**:
   - Clicking on a category like "Electronics" redirects the user to `'/electronics/'`, which loads `ShopCat.EL` with a banner specific to that category.
   - Within `ShopCat`, the user can view listings under the selected category, with options to filter results based on price, rate, or other criteria (using components like `Filterbar`).

3. **Viewing a Listing**:
   - Selecting a specific listing (e.g., an electronic item) navigates the user to a path like `'/listing/:slug'`, which opens the `ListingDetail` page.
   - This page shows detailed information about the listing, including description, price, location, and other specifics.

4. **User Profile and Transactions**:
   - Users can view profile information by accessing `'/user/:user_id'` (rendering `UserProfile`) or check transaction history on pages like `'/history/'` and `'/purchasereceived/'`.

5. **Authentication and Support**:
   - Users have access to login and sign-up pages (`Login` and `SignUp`), as well as password reset and change options.
   - For any questions, users can view `FAQ` or access support via `GetSupport`.

---

### Design Approach

This design is centered on creating a seamless user experience by:

- **Component Reusability**: With common UI elements in `components`, such as `Navbar` and `Footer`, the app maintains visual consistency across pages.
- **Efficient Routing**: Dynamic routes allow different pages to serve varied content based on user actions (e.g., viewing different categories and listings).
- **Modular File Structure**: The categorization of files and folders (e.g., `Pages`, `Components`, `Images`) provides easy navigation and maintainability for developers.
- **User-Friendly Navigation**: With clearly defined routes and intuitive paths (e.g., `'/user/:user_id'`, `'/listing/:slug'`), users can effortlessly navigate and interact with the platform.

Overall, **ShopBlock**’s web design prioritizes modularity, maintainability, and an organized, user-centered structure that enhances the browsing and transaction experience for users.
