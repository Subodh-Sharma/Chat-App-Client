// import { Button } from '@chakra-ui/react';
import { Routes,Route } from 'react-router-dom';
import './App.css';
import Homepage from './Pages/Homepage';
import Chatpage from './Pages/Chatpage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Homepage/>}/>
        <Route exact path="/chats" element={<Chatpage/>}/>
      </Routes>
    </div>
  );
}

export default App;
