import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
