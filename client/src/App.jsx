import { BrowserRouter, Routes, Route} from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
function App() {
    return (
        <BrowserRouter>
            {/*Authentication and Nav components not yet mentioned*/}
            <Routes>
                <Route path='/' element={<DashboardPage />} />
                {/* Mention the earlier routes here*/}
            </Routes>
        </BrowserRouter>
    );
}
export default App;