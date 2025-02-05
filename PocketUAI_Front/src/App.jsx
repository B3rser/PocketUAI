import React from 'react'
import './App.css'
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/auth.context.jsx'

import { Home } from './pages/home'
import { NewPlan } from './pages/newplan'
import { Chatbot } from './pages/chatbot'
import { Plan } from './pages/plan'
import { InfoUser } from './pages/infouser'
import { Tracking } from './pages/tracking'
import { NavBar } from './components/navBar'
import { SignUp } from './pages/signUp'
import toast, { Toaster } from 'react-hot-toast'
import Login from './pages/login'
import History from './pages/history'
import { Test } from './pages/test'
import { NotFound } from './pages/not_found'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position='bottom-center'
      />
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path='/' element={<Navigate to="/home" />}></Route>
          <Route path='login' element={<Login />} />
          <Route path='/signUp' element={<SignUp />} />
          <Route path='/home' element={<Home />} />
          <Route path='/newplan' element={<NewPlan />} />
          <Route path='/chatbot' element={<Chatbot />} />
          <Route path='/plan' element={<Plan />} />
          <Route path='/infouser' element={<InfoUser />} />
          <Route path='/plan' element={<Plan />} />
          <Route path='/tracking' element={<Tracking />} />
          <Route path='/history' element={<History />} />
          <Route path='/test' element={<Test />} />
          <Route path='/notfound' element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider >

    </BrowserRouter>

  )
}

export default App
