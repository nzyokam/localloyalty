// src/lib/supabase.js - Real Supabase connection
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real database helpers
export const dbHelpers = {
  // Check if customer exists by phone number
  async getCustomerByPhone(phoneNumber) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone_number", phoneNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Get customer error:", error);
      return { data: null, error };
    }
  },

  // Check if business exists by phone number
  async getBusinessByPhone(phoneNumber) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_phone", phoneNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Get business error:", error);
      return { data: null, error };
    }
  },

  // Create new customer
  async createCustomer(phoneNumber, name) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([{ phone_number: phoneNumber, name }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Create customer error:", error);
      return { data: null, error };
    }
  },

  // Create new business
  async createBusiness(phoneNumber, name, type) {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .insert([
          {
            owner_phone: phoneNumber,
            name,
            type,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Create business error:", error);
      return { data: null, error };
    }
  },

  // Get customer points using the view
  async getCustomerPoints(phoneNumber) {
    try {
      const { data, error } = await supabase
        .from("customer_points")
        .select("*")
        .eq("phone_number", phoneNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Get customer points error:", error);
      return { data: null, error };
    }
  },

  // Get business analytics using the view
  async getBusinessAnalytics(phoneNumber) {
    try {
      // First get the business
      const { data: business } = await this.getBusinessByPhone(phoneNumber);
      if (!business) return { data: null, error: null };

      // Then get analytics
      const { data, error } = await supabase
        .from("business_analytics")
        .select("*")
        .eq("business_id", business.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Get business analytics error:", error);
      return { data: null, error };
    }
  },

  // Get rewards for a business
  async getBusinessRewards(businessId) {
    try {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Get rewards error:", error);
      return { data: null, error };
    }
  },

  // Get all active rewards (for customers to browse)
  async getAllActiveRewards() {
    try {
      const { data, error } = await supabase
        .from("rewards")
        .select(
          `
          *,
          businesses (name, type)
        `
        )
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Get all rewards error:", error);
      return { data: null, error };
    }
  },
};

// Add these functions to your src/lib/supabase.js

// Add visit check-in functionality
export const visitHelpers = {
  // Business owner checks in a customer
  async checkInCustomer(customerPhone, businessId, pointsEarned = 10) {
    try {
      // First, get the customer by phone number
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', customerPhone)
        .single()
      
      if (customerError || !customer) {
        throw new Error('Customer not found. Please ask them to register first.')
      }

      // Create the visit record
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert([{
          customer_id: customer.id,
          business_id: businessId,
          points_earned: pointsEarned
        }])
        .select()
        .single()
      
      if (visitError) throw visitError

      // Also update/create customer_businesses relationship
      const { error: relationError } = await supabase
        .from('customer_businesses')
        .upsert({
          customer_id: customer.id,
          business_id: businessId,
          total_visits: 1, // This will be updated by a trigger or can be calculated
          total_points_earned: pointsEarned
        }, {
          onConflict: 'customer_id,business_id',
          ignoreDuplicates: false
        })

      if (relationError) throw relationError

      return { data: visit, error: null }
    } catch (error) {
      console.error('Check-in error:', error)
      return { data: null, error }
    }
  },

  // Get recent visits for a business
  async getRecentVisits(businessId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          customers (name, phone_number)
        `)
        .eq('business_id', businessId)
        .order('visit_date', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get recent visits error:', error)
      return { data: null, error }
    }
  },

  // Customer can view their visit history
  async getCustomerVisits(customerPhone) {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          businesses (name, type)
        `)
        .eq('customers.phone_number', customerPhone)
        .order('visit_date', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get customer visits error:', error)
      return { data: null, error }
    }
  }
}