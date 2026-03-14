import { supabase } from "@/lib/supabase";

export const userService = {
  async fetchUsers() {
    return await supabase.from("users").select("*");
  }
};
