
// Mock Data Store

// 1. Users Collection
const users = [
  { id: "user_admin", email: "admin@flyhouse.com", full_name: "Admin User", role: "admin" },
  { id: "user_broker1", email: "broker1@flyhouse.com", full_name: "Broker One", role: "agent" },
  { id: "user_broker2", email: "broker2@flyhouse.com", full_name: "Broker Two", role: "agent" }
];

// Initialize from localStorage if available, otherwise default to admin
const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('flyhouse_current_user_id') : null;
let currentUserId = storedUserId || "user_admin";

// 2. Demo Data Generator
const generateDemoData = () => {
  const generatedLeads = [];
  const statuses = ["new", "contacted", "qualified", "quoted", "pending_client", "booked", "flown", "lost"];
  const sources = ["web", "referral", "phone", "partner"];
  const priorities = ["low", "medium", "high", "hot"];
  const airports = ["VNY", "TEB", "LHR", "JFK", "MIA", "LAS", "DXB", "PAR", "NCE", "GVA", "VCE"];

  const firstNames = ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

  for (let i = 1; i <= 20; i++) {
    const isRoundTrip = Math.random() > 0.5;
    const numLegs = isRoundTrip ? 2 : 1;
    const legs = [];

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 30));

    for (let j = 0; j < numLegs; j++) {
      const legDate = new Date(baseDate);
      legDate.setDate(legDate.getDate() + (j * 3));
      legs.push({
        from_iata: airports[Math.floor(Math.random() * airports.length)],
        to_iata: airports[Math.floor(Math.random() * airports.length)],
        depart_iso: legDate.toISOString()
      });
    }

    // Randomly assign to a user (mostly brokers, sometimes admin)
    const owner = users[Math.floor(Math.random() * users.length)];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const phone = `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;

    generatedLeads.push({
      id: `lead_${i}`,
      created_date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      updated_date: new Date().toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      owner_user_id: owner.id,
      owner_email: owner.email,
      owner_name: owner.full_name,
      client: {
        full_name: fullName,
        email: email,
        phone_e164: phone,
        client_tier: ["new", "gold", "platinum", "elite"][Math.floor(Math.random() * 4)]
      },
      trip: {
        type: isRoundTrip ? "round_trip" : "one_way",
        pax: Math.floor(Math.random() * 8) + 1,
        legs: legs
      },
      estimate: {
        price_min: 20000 + Math.random() * 10000,
        price_max: 35000 + Math.random() * 20000
      },
      // Add some financial data for booked leads to make charts look good
      client_closing_price: statuses[i % statuses.length] === 'booked' || statuses[i % statuses.length] === 'flown' ? 45000 + Math.random() * 10000 : null,
      operator_closing_price: statuses[i % statuses.length] === 'booked' || statuses[i % statuses.length] === 'flown' ? 35000 + Math.random() * 10000 : null,
      notes: []
    });
  }
  return generatedLeads;
};

let leads = generateDemoData();

let priorityRules = [
  {
    id: "rule_1",
    active: true,
    priority: "hot",
    rule_type: "departure_time",
    conditions: {
      hours_before_departure: 48
    },
    order: 1
  }
];

// Mock Implementation
export const LocalStore = {
  Lead: {
    list: async (sort) => {
      // RBAC Logic
      const currentUser = users.find(u => u.id === currentUserId);
      let visibleLeads = leads;

      if (currentUser && currentUser.role !== 'admin') {
        // Brokers only see their own leads
        visibleLeads = leads.filter(l => l.owner_user_id === currentUser.id);
      }

      // Sort
      const sortedLeads = [...visibleLeads].sort((a, b) => {
        if (sort === '-created_date') {
          return new Date(b.created_date) - new Date(a.created_date);
        }
        return 0;
      });
      return Promise.resolve(sortedLeads);
    },
    update: async (id, data) => {
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        leads[index] = { ...leads[index], ...data, updated_date: new Date().toISOString() };
        return Promise.resolve(leads[index]);
      }
      return Promise.reject(new Error("Lead not found"));
    },
    create: async (data) => {
      const currentUser = users.find(u => u.id === currentUserId);
      const newLead = {
        ...data,
        id: `lead_${Date.now()}`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        owner_user_id: currentUser ? currentUser.id : null,
        owner_email: currentUser ? currentUser.email : null,
        owner_name: currentUser ? currentUser.full_name : null
      };
      leads.push(newLead);
      return Promise.resolve(newLead);
    },
    delete: async (id) => {
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        leads.splice(index, 1);
        return Promise.resolve({ success: true });
      }
      return Promise.reject(new Error("Lead not found"));
    }
  },
  PriorityRule: {
    list: async (sort) => {
      return Promise.resolve(priorityRules);
    }
  },
  EmptyLeg: {
    list: async () => Promise.resolve([])
  },
  EmailCampaign: {
    list: async () => Promise.resolve([])
  },
  User: {
    // Mocking base44.auth
    login: async (email) => {
      const user = users.find(u => u.email === email);
      if (user) {
        currentUserId = user.id;
        if (typeof window !== 'undefined') {
          localStorage.setItem('flyhouse_current_user_id', user.id);
        }
        return Promise.resolve({ user });
      }
      return Promise.reject(new Error("User not found"));
    },
    logout: async () => {
      // currentUserId = null; // Don't actually logout in mock, just stay as is or reset to default
      return Promise.resolve();
    },
    currentUser: async () => {
      const user = users.find(u => u.id === currentUserId);
      return Promise.resolve(user || users[0]);
    },
    getSession: async () => Promise.resolve({ access_token: "mock_token" }),
    list: async () => Promise.resolve(users)
  },
  Integrations: {
    UploadFile: async ({ file }) => {
      console.log("Mock uploading file:", file.name);
      return Promise.resolve({
        file_url: `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`
      });
    }
  }
};
