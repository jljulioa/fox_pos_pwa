import { supabase } from "@/lib/supabase";

export const customerService = {
  async fetchCustomers() {
    return await supabase.from("customers").select("*").order("name");
  },

  async createCustomer(payload: any) {
    return await supabase.from("customers").insert(payload);
  },

  async updateCustomer(id: string, payload: any) {
    return await supabase.from("customers").update(payload).eq("id", id);
  },

  async deleteCustomer(id: string) {
    return await supabase.from("customers").delete().eq("id", id);
  }
};
