import { PriorityRule } from "@/api/entities";
import { Lead } from "@/api/entities";

export class PriorityEngine {
  static async evaluateLeadPriority(lead) {
    try {
      const rules = await PriorityRule.list('order');
      const activeRules = rules.filter(rule => rule.active);

      for (const rule of activeRules) {
        if (await this.ruleMatches(lead, rule)) {
          return rule.priority;
        }
      }

      // Default priority if no rules match
      return 'warm';
    } catch (error) {
      console.error('Error evaluating lead priority:', error);
      return 'warm';
    }
  }

  static async ruleMatches(lead, rule) {
    const { rule_type, conditions } = rule;

    switch (rule_type) {
      case 'departure_time':
        return this.checkDepartureTime(lead, conditions);
      
      case 'source':
        return this.checkSource(lead, conditions);
      
      case 'utm_campaign':
        return this.checkUtmCampaign(lead, conditions);
      
      case 'inactivity':
        return this.checkInactivity(lead, conditions);
      
      case 'price_range':
        return this.checkPriceRange(lead, conditions);
      
      default:
        return false;
    }
  }

  static checkDepartureTime(lead, conditions) {
    if (!lead.trip?.legs?.[0]?.depart_iso || !conditions.hours_before_departure) {
      return false;
    }

    const departureTime = new Date(lead.trip.legs[0].depart_iso);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    return hoursUntilDeparture <= conditions.hours_before_departure && hoursUntilDeparture > 0;
  }

  static checkSource(lead, conditions) {
    if (!conditions.source_values || !lead.source) {
      return false;
    }

    return conditions.source_values.includes(lead.source);
  }

  static checkUtmCampaign(lead, conditions) {
    const utmMatches = [];

    if (conditions.utm_campaign_values && lead.utm_campaign) {
      utmMatches.push(conditions.utm_campaign_values.includes(lead.utm_campaign));
    }

    if (conditions.utm_source_values && lead.utm_source) {
      utmMatches.push(conditions.utm_source_values.includes(lead.utm_source));
    }

    return utmMatches.length > 0 && utmMatches.every(match => match);
  }

  static checkInactivity(lead, conditions) {
    if (!conditions.hours_since_contact || lead.status === 'new') {
      return false;
    }

    // Check if lead has been contacted but no recent activity
    const lastContactTime = lead.notes?.length > 0 
      ? new Date(Math.max(...lead.notes.map(note => new Date(note.timestamp))))
      : new Date(lead.created_date);

    const now = new Date();
    const hoursSinceContact = (now - lastContactTime) / (1000 * 60 * 60);

    return hoursSinceContact >= conditions.hours_since_contact && 
           ['contacted', 'qualified'].includes(lead.status);
  }

  static checkPriceRange(lead, conditions) {
    if (!lead.estimate?.price_max) {
      return false;
    }

    const price = lead.estimate.price_max;
    const minPrice = conditions.min_price || 0;
    const maxPrice = conditions.max_price || Infinity;

    return price >= minPrice && price <= maxPrice;
  }

  // Method to update existing leads with new priorities
  static async updateExistingLeadsPriorities(leads) {
    const updatedLeads = [];

    for (const lead of leads) {
      const newPriority = await this.evaluateLeadPriority(lead);
      
      if (newPriority !== lead.priority) {
        try {
          await Lead.update(lead.id, { priority: newPriority });
          updatedLeads.push({ ...lead, priority: newPriority });
        } catch (error) {
          console.error(`Error updating priority for lead ${lead.id}:`, error);
        }
      }
    }

    return updatedLeads;
  }
}