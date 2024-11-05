------------------

# ShopBlock (Frontend)

This README assumes that you have already cloned the repository.

## Table of Contents

1. [ShopBlock Frontend](#shopblock-frontend)
2. [Setup Instructions](#setup-instructions)
3. [Web Design](#web-design)
   - [3.1 App Component Structure](#31-app-component-structure)
   - [3.2 Pages Folder](#32-pages-folder)
   - [3.3 Components Folder](#33-components-folder)
   - [3.4 Routing and Dynamic Imports](#34-routing-and-dynamic-imports)
   - [3.5 Styling](#35-styling)
   - [3.6 Design Approach](#36-design-approach)
4. [Tech Stack](#tech-stack)
5. [External APIs](#external-apis)

------------------

## 1. ShopBlock Frontend

**ShopBlock** is a platform designed for creating, browsing, and managing product or service listings. The frontend, built using **React.js**, offers users an interface to interact with various listings. Users can browse by category, make offers, filter listings, and complete transactions.

---

## 2. Setup Instructions

1. In the `/frontend` directory, install the required node modules:

   ```bash
   npm install
   ```

2. Start the application:

   ```bash
   npm start
   ```

You'll be ready to start the ShopBlock frontend application. The website will run on [http://localhost:3000](http://localhost:3000/).

------------------

## 3. Web Design

The frontend design of **ShopBlock** is organized around a modular, component-based architecture that promotes reusability and maintainability. Below is a detailed breakdown of each aspect of the web design:

### 3.1 App Component Structure

The `App.js` file serves as the main component, defining routes and importing core components and pages. Here’s a breakdown of its key functions:

- **Router Setup**:
  - Utilizes `BrowserRouter`, `Routes`, and `Route` from `react-router-dom` for client-side routing.
  - Maps each route to a specific page, ensuring a clean and user-friendly navigation experience.

- **Component Hierarchy**:
  - `Navbar` and `Footer` components are persistent across all pages, providing consistent navigation and footer options.

### 3.2 Pages Folder

The **Pages** folder contains primary UI components representing individual pages, such as `Login`, `SignUp`, `Categories`, and `FAQ`. Each page is linked to a specific route, enhancing accessibility and navigation.

### 3.3 Components Folder

The **Components** directory includes reusable elements, such as the navigation bar (`Navbar`), footer (`Footer`), and filtering options (`Filterbar`). These components are used across multiple pages, promoting reusability and modularity.

### 3.4 Routing and Dynamic Imports

The routing in `App.js` includes dynamic imports and routes based on user actions. Examples include:

- **Dynamic Category Routes**:
  - Routes like `'/electronics/'`, `'/supplies/'`, and `'/services/'` load specific categories, making navigation straightforward.

- **Dynamic User Profiles and Listings**:
  - Routes like `'/user/:user_id'` and `'/listing/:slug'` dynamically load content based on the user ID or listing slug.

### 3.5 Styling

The app's global styles are defined in `App.css`, with additional CSS files for specific pages and components. This modular approach keeps styles organized and maintains consistency.

### 3.6 Design Approach

The design approach for ShopBlock prioritizes:

- **Component Reusability**: Ensures visual consistency across pages.
- **Efficient Routing**: Provides a seamless user experience with clear navigation paths.
- **Modular Structure**: Organized files and folders aid in code maintenance.
- **User-Friendly Navigation**: Dynamic routes make it easy for users to interact with different parts of the application.

------------------

## 4. Tech Stack

The frontend of **ShopBlock** is built using the following technologies:

- **JavaScript**
- **Material UI**
- **React**
- **CSS**

------------------

## 5. External APIs

**ShopBlock** integrates the following external APIs to enhance its functionality:

1. **Singapore's OneMap API**  
   - Map service: [OneMap API Documentation](https://www.onemap.gov.sg/docs/maps/)

2. **PayPal API**  
   - For payment processing: [PayPal API (Sandbox) Documentation](https://sandbox.paypal.com)

------------------
