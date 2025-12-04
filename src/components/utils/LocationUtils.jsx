
const areaCodeToRegion = {
  // USA - Major Cities/Regions
  '212': 'NYC', '646': 'NYC', '332': 'NYC', '917': 'NYC',
  '305': 'Miami', '786': 'Miami',
  '213': 'Los Angeles', '323': 'Los Angeles', '310': 'Los Angeles', '424': 'Los Angeles',
  '312': 'Chicago', '773': 'Chicago',
  '214': 'Dallas', '469': 'Dallas', '972': 'Dallas',
  '713': 'Houston', '281': 'Houston', '832': 'Houston',
  '415': 'San Francisco', '628': 'San Francisco',
  // More general US regions
  '201': 'New Jersey', '203': 'Connecticut', '205': 'Alabama',
  '480': 'Arizona', '602': 'Arizona', '623': 'Arizona',
  '909': 'California', '858': 'California', '949': 'California', '714': 'California',
  '303': 'Colorado', '720': 'Colorado',
  '954': 'Florida', '407': 'Florida', '813': 'Florida',
  '404': 'Georgia', '770': 'Georgia',
  '702': 'Nevada',
  '206': 'Washington',
};

const countryCodeToRegion = {
  '+44': 'United Kingdom',
  '+33': 'France',
  '+49': 'Germany',
  '+39': 'Italy',
  '+34': 'Spain',
  '+41': 'Switzerland',
  '+971': 'United Arab Emirates',
  '+52': 'Mexico',
  '+55': 'Brazil',
  '+81': 'Japan',
  '+86': 'China',
  '+7': 'Russia',
};

export const getRegionFromPhoneNumber = (phone_e164) => {
  if (!phone_e164) return 'Unknown';

  const phone = phone_e164.replace(/\D/g, '');

  if (phone.startsWith('1')) { // US Number
    const areaCode = phone.substring(1, 4);
    return areaCodeToRegion[areaCode] || 'USA (Other)';
  } else {
    for (const [code, region] of Object.entries(countryCodeToRegion)) {
      const formattedCode = code.replace('+', '');
      if (phone.startsWith(formattedCode)) {
        return region;
      }
    }
  }
  return 'International (Other)';
};

export const getAllRegions = (leads) => {
    const regions = new Set();
    leads.forEach(lead => {
        if (lead.client?.location_region) {
            regions.add(lead.client.location_region);
        }
    });
    return Array.from(regions).sort();
};

export const airportsByRegion = {
    'Miami': ['MIA', 'FLL', 'PBI', 'OPF'],
    'NYC': ['TEB', 'HPN', 'JFK', 'LGA'],
    'Los Angeles': ['VNY', 'LAX', 'BUR', 'SMO'],
    'United Kingdom': ['EGLC', 'EGLL', 'EGGW', 'FAB'],
    'France': ['LFPB', 'LFPG', 'LFMN'],
    'Switzerland': ['LSGG', 'LSZH'],
    'United Arab Emirates': ['OMDB', 'OMDW'],
    'USA (Other)': ['MDW', 'DAL', 'LAS', 'DEN'],
    'International (Other)': ['CYYZ', 'MMUN', 'MYNN']
};

export const aircraftTypes = ["Light Jet", "Midsize Jet", "Heavy Jet", "Ultra Long Range"];

export const priceRanges = {
    "Light Jet": { min: 4000, max: 8000 },
    "Midsize Jet": { min: 8000, max: 15000 },
    "Heavy Jet": { min: 15000, max: 30000 },
    "Ultra Long Range": { min: 30000, max: 70000 }
};

export const emailTemplates = {
    'standard': {
        subject: 'Exclusive Empty Leg Deals from FlyHouse',
        body: `
            <p>Hi {first_name},</p>
            <p>Don't miss out on these exclusive empty leg opportunities, perfect for your next getaway. These deals offer exceptional value on private jet travel.</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px;">
                <h3 style="margin-top: 0;">{departure_airport} to {arrival_airport}</h3>
                <p><strong>Date:</strong> {departure_date}</p>
                <p><strong>Aircraft:</strong> {aircraft_type}</p>
                <p><strong>Exclusive Price:</strong> ${'{price}'}</p>
            </div>

            <p>These flights are available on a first-come, first-served basis. Contact us today to book your seat.</p>
            <p>Best regards,<br>The FlyHouse Team</p>
        `
    }
};
