import  Navbar  from "./components/Navbar";
import './assets/global.css';
import { Routes, Route } from "react-router-dom";
// import { ApolloProvider } from "@apollo/client";
// import { client } from './graphql/queries';
import Home from "./pages/Home";



function App() {
  return (

    <div className="App">
      {/* <ApolloProvider client={client}> */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      {/* </ApolloProvider> */}

      
      
     
    </div>
  );
}

export default App;
