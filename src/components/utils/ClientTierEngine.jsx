import { Lead } from "@/api/entities";

// Tier thresholds configuration
const TIER_THRESHOLDS = {
  elite: {
    minFlights: 10,
    minRevenue: 500000
  },
  retainer: {
    minFlights: 3,
    minRevenue: 100000
  }
  // Below retainer thresholds = "new"
};

export class ClientTierEngine {
  
  /**
   * Calculate the appropriate tier based on flights and revenue
   */
  static calculateTier(totalFlights, totalRevenue) {
    if (totalFlights >= TIER_THRESHOLDS.elite.minFlights || 
        totalRevenue >= TIER_THRESHOLDS.elite.minRevenue) {
      return 'elite';
    }
    
    if (totalFlights >= TIER_THRESHOLDS.retainer.minFlights || 
        totalRevenue >= TIER_THRESHOLDS.retainer.minRevenue) {
      return 'retainer';
    }
    
    return 'new';
  }

  /**
   * Aggregate client stats from all their leads
   */
  static aggregateClientStats(leads, clientEmail) {
    const clientLeads = leads.filter(lead => 
      lead.client?.email?.toLowerCase() === clientEmail?.toLowerCase()
    );
    
    const completedLeads = clientLeads.filter(lead => 
      lead.status === 'flown' || lead.status === 'booked'
    );
    
    const totalFlights = completedLeads.length;
    const totalRevenue = completedLeads.reduce((sum, lead) => 
      sum + (lead.client_closing_price || 0), 0
    );
    
    return { totalFlights, totalRevenue };
  }

  /**
   * Update tier for a single lead/client
   */
  static async updateLeadClientTier(lead, allLeads) {
    if (!lead.client?.email) return null;
    
    const stats = this.aggregateClientStats(allLeads, lead.client.email);
    const newTier = this.calculateTier(stats.totalFlights, stats.totalRevenue);
    
    const currentTier = lead.client?.client_tier || 'new';
    
    if (newTier !== currentTier) {
      await Lead.update(lead.id, {
        client: {
          ...lead.client,
          client_tier: newTier,
          total_flights: stats.totalFlights,
          total_revenue: stats.totalRevenue
        }
      });
      return { leadId: lead.id, oldTier: currentTier, newTier, stats };
    }
    
    return null;
  }

  /**
   * Recalculate tiers for all clients across all leads
   */
  static async recalculateAllTiers() {
    const allLeads = await Lead.list();
    const updates = [];
    const processedEmails = new Set();
    
    for (const lead of allLeads) {
      const email = lead.client?.email?.toLowerCase();
      if (!email || processedEmails.has(email)) continue;
      
      processedEmails.add(email);
      const stats = this.aggregateClientStats(allLeads, email);
      const newTier = this.calculateTier(stats.totalFlights, stats.totalRevenue);
      
      // Update all leads for this client
      const clientLeads = allLeads.filter(l => 
        l.client?.email?.toLowerCase() === email
      );
      
      for (const clientLead of clientLeads) {
        const currentTier = clientLead.client?.client_tier || 'new';
        if (newTier !== currentTier || 
            clientLead.client?.total_flights !== stats.totalFlights ||
            clientLead.client?.total_revenue !== stats.totalRevenue) {
          
          await Lead.update(clientLead.id, {
            client: {
              ...clientLead.client,
              client_tier: newTier,
              total_flights: stats.totalFlights,
              total_revenue: stats.totalRevenue
            }
          });
          
          updates.push({
            leadId: clientLead.id,
            email,
            oldTier: currentTier,
            newTier,
            stats
          });
        }
      }
    }
    
    return updates;
  }

  /**
   * Get tier thresholds (for display purposes)
   */
  static getThresholds() {
    return TIER_THRESHOLDS;
  }
}