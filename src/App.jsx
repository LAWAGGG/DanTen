import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Food from './pages/Food'
import FoodDetail from './pages/FoodDetail'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Food></Food>}/>
        <Route path='/food/:id' element={<FoodDetail></FoodDetail>}/>
      </Routes>
    </>
  )
}

export default App
