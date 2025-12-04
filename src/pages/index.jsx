import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Kanban from "./Kanban";

import Leads from "./Leads";

import Team from "./Team";

import Settings from "./Settings";

import UpcomingFlights from "./UpcomingFlights";

import TripDetail from "./TripDetail";

import EmailDistribution from "./EmailDistribution";

import AdminDashboard from "./AdminDashboard";

import Analytics from "./Analytics";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Kanban: Kanban,
    
    Leads: Leads,
    
    Team: Team,
    
    Settings: Settings,
    
    UpcomingFlights: UpcomingFlights,
    
    TripDetail: TripDetail,
    
    EmailDistribution: EmailDistribution,
    
    AdminDashboard: AdminDashboard,
    
    Analytics: Analytics,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Kanban" element={<Kanban />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Team" element={<Team />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/UpcomingFlights" element={<UpcomingFlights />} />
                
                <Route path="/TripDetail" element={<TripDetail />} />
                
                <Route path="/EmailDistribution" element={<EmailDistribution />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}