# **Daily Spark Frontend - Complete Development Plan**

## **🎯 Project Overview**
Create a React + TypeScript + Tailwind CSS frontend for your learning curriculum management system, using mock data with user ID "first-user" for rapid development and testing.

## **🏗️ Project Structure**
```
daily-spark-ui/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout/         # Header, Navigation, Footer
│   │   ├── Forms/          # Input fields, buttons, modals
│   │   ├── Cards/          # Curriculum cards, topic items
│   │   └── UI/             # Status badges, progress bars
│   ├── pages/              # Main page components
│   ├── services/           # Mock API service
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Helper functions
│   └── styles/             # Custom Tailwind overrides
```

## **📱 Pages & Features**

### **1. Authentication & Profile**
- **Login Page**: Simple user ID input form
- **Profile Creation**: Name, email, user ID (auto-generate or manual)
- **Profile Management**: Edit existing profile information

### **2. Dashboard & Navigation**
- **Main Dashboard**: Overview of user's curricula
- **Navigation**: Clean header with user info and menu
- **Breadcrumbs**: Clear page navigation

### **3. Curriculum Management**
- **Curriculum List**: View all curricula with status indicators
- **Create Curriculum**: Upload JSON + preview split screen
- **Edit Curriculum**: Drag & drop topic reordering
- **Delete Curriculum**: Confirmation dialogs

### **4. JSON Processing**
- **Upload Section**: File input with drag & drop support
- **Preview Section**: Beautiful rendering of curriculum structure
- **Validation**: Check JSON format and required fields
- **Create Button**: Process and save new curriculum

## **🎨 Design System (Following Your Brand)**
- **Primary Colors**: Blue (#2d6cdf, #1a4e8a)
- **Accent Colors**: Orange (#f7b84a) for highlights
- **Backgrounds**: Light blue (#eaf1fb), white (#fff), light gray (#f9f9f9)
- **Typography**: Clean, professional, educational feel
- **Cards**: Clean borders, proper spacing, status badges

## **📊 Mock Data Structure**

### **User Profile**
```typescript
{
  id: "first-user",
  name: "Demo User",
  email: "demo@example.com"
}
```

### **Sample Curriculum: "System Design Basics"**
1. **"What is System Design?"** - Status: Completed ✅
2. **"High-Level vs Low-Level Design"** - Status: In Progress 🔄
3. **"Scalability Patterns"** - Status: Not Started ⏳
4. **"Database Design Principles"** - Status: In Progress 🔄
5. **"System Architecture Best Practices"** - Status: Not Started ⏳

## **🔧 Technical Implementation**

### **Core Technologies**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **@dnd-kit/core** for drag & drop
- **React Context** for state management

### **Mock API Service**
```typescript
const mockApi = {
  getUser: (userId: string) => Promise.resolve(mockUser),
  getCurricula: (userId: string) => Promise.resolve(mockCurricula),
  createCurriculum: (data) => Promise.resolve(newCurriculum),
  updateCurriculum: (id, data) => Promise.resolve(updatedCurriculum),
  deleteCurriculum: (id) => Promise.resolve({ success: true })
}
```

### **State Management**
- **User Context**: Current user profile and authentication
- **Curriculum Context**: List and current editing state
- **Local Storage**: Persist user session and preferences

## **📋 Development Phases**

### **Phase 1: Project Setup**
- Create React app with TypeScript
- Install dependencies (Tailwind, Router, etc.)
- Set up project structure and mock data

### **Phase 2: Core Components**
- Build reusable UI components
- Implement layout and navigation
- Create form components

### **Phase 3: Pages & Features**
- Authentication and profile pages
- Dashboard and curriculum list
- Upload and preview functionality

### **Phase 4: Advanced Features**
- Drag & drop topic reordering
- Curriculum editor
- CRUD operations

### **Phase 5: Polish & Testing**
- Responsive design
- Error handling
- UI/UX refinements
- Mock data testing

## **🚀 Expected Outcome**
A fully functional, beautiful frontend that:
- ✅ Demonstrates complete user experience
- ✅ Follows your brand design system
- ✅ Has realistic mock data for testing
- ✅ Includes all CRUD operations
- ✅ Features smooth drag & drop
- ✅ Is ready for Azure Functions integration

## **🔮 Future Integration**
When ready to connect to your Azure Functions:
1. Replace mock API calls with real HTTP requests
2. Add proper error handling for network issues
3. Implement real authentication if needed
4. Add loading states and optimistic updates

## **📝 Notes**
- **User ID**: Fixed to "first-user" for mock data
- **Design**: Follows existing Daily Spark brand colors and styling
- **Functionality**: Complete CRUD operations with mock backend
- **Responsiveness**: Mobile-first design approach
- **Accessibility**: Built with accessibility best practices

---

*This plan outlines the complete frontend development for Daily Spark, focusing on rapid prototyping with mock data and a beautiful, functional user interface.*
