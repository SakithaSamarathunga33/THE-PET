# 🐾 Pet Care Management System

<div align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D%2014.0.0-green.svg" />
  <img src="https://img.shields.io/badge/made%20with-love-red.svg" />
  <br />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Facebook_Prophet-0467DF?style=for-the-badge&logo=facebook&logoColor=white" />
</div>

<p align="center">
  <img src="https://images.unsplash.com/photo-1444212477490-ca407925329e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80" alt="Pet Care Banner" />
</p>

## 📋 Overview

A comprehensive pet care management system that connects pet owners with pet shops and services. This application helps users browse available pets, book appointments, manage their pet ownership journey, and allows administrators to manage inventory, appointments, and analytics. The newest version includes advanced AI-powered predictions for appointment trends.

## ✨ Features

### 🐕 For Customers
- **Pet Browsing**: Browse available pets by type, gender, and price range
- **Appointment Booking**: Schedule appointments to meet pets or get services
- **User Profiles**: Manage personal information and view appointment history
- **Responsive Design**: Fully responsive interface for mobile and desktop

### 👨‍💼 For Administrators
- **Pet Management**: Add, edit, and manage pet listings with default images for each type
- **Appointment Tracking**: View, update, and manage all customer appointments
- **Branch Management**: Track activities across multiple branches
- **Employee Management**: Manage employee records and assignments
- **Advanced Analytics**: Visualize sales, appointments, and popular pet types with AI predictions
- **Time Series Forecasting**: AI-powered predictions of future appointment trends by branch and pet type

## 🧠 AI Prediction System

### Features
- **Time Series Forecasting**: Uses Facebook Prophet to predict future appointment trends
- **Segmented Analysis**: Individual predictions for each branch and pet type combination
- **Intelligent Caching**: Stores predictions for faster retrieval in future sessions
- **Fallback Mechanism**: Provides estimated predictions if real-time predictions are unavailable
- **Visualization**: Interactive charts showing predicted appointment distribution by pet type and branch

### Implementation Details
- **Separate Models**: Individual prediction models for each branch/pet type combination
- **Parallel Processing**: Concurrent prediction generation for improved performance
- **Python Backend**: Python scripts for data processing and prediction generation
- **MongoDB Integration**: Stores and retrieves historical data and predictions
- **Asynchronous Loading**: Frontend handles loading states with adaptive timeouts

## 🛠️ Technologies

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Animation library for React
- **React Icons**: Icon library for React applications
- **Chart.js**: JavaScript charting library for analytics visualizations

### Backend
- **Node.js**: JavaScript runtime for building server-side applications
- **Express**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for authentication
- **Passport.js**: Authentication middleware for Node.js

### AI & Analytics
- **Python**: Programming language for data analysis and machine learning
- **Facebook Prophet**: Time series forecasting library for predictive analytics
- **NumPy/Pandas**: Data manipulation and analysis libraries
- **MongoDB Aggregation**: Advanced data processing for analytics

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for analytics)
- npm or yarn

### Backend Setup
```bash
# Clone the repository
git clone (https://github.com/SakithaSamarathunga33/THE-PET.git)

# Install backend dependencies
cd server
npm install

# Install Python dependencies for analytics
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Start the server
npm run dev
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd site

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application running!

## 📊 API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login

### Pets
- `GET /api/pets` - Get all pets (with filtering)
- `GET /api/pets/:id` - Get a single pet
- `POST /api/pets` - Add a new pet
- `PUT /api/pets/:id` - Update a pet
- `DELETE /api/pets/:id` - Delete a pet

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get a single appointment
- `POST /api/appointments` - Create an appointment
- `PUT /api/appointments/:id` - Update an appointment
- `DELETE /api/appointments/:id` - Delete an appointment
- `GET /api/appointments/branch/:branchName` - Get branch appointments
- `GET /api/appointments/public/clear` - Clear all appointments (testing)
- `GET /api/appointments/public/setup` - Generate sample appointments (testing)

### Analytics
- `GET /api/analytics/branch` - Get branch analytics and predictions
- `GET /api/analytics/pet-type-predictions` - Get AI-powered pet type predictions

## 👥 User Roles

- **Customer**: Browse pets, book appointments, view own appointments
- **Employee**: Manage appointments, view branch data
- **Admin**: Full access to all features including analytics, employee management

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication and supports:
- Traditional email/password login
- Google OAuth login (for customer accounts)
- Role-based access control for protected routes

## 🔮 Future Features

- **Pet Health Records**: Track pet vaccinations and medical history
- **E-commerce Integration**: Purchase pet supplies online
- **Pet Adoption Process**: Streamline the pet adoption paperwork
- **Push Notifications**: Send reminders for appointments
- **Social Sharing**: Share pet listings on social media
- **Enhanced AI Analytics**: Deeper insights into seasonal trends and customer behaviors

---

<p align="center">Made with ❤️ for pets and their owners</p> 
