import { supabase } from "@/lib/supabase";
import { inventoryService } from "./inventoryService";

export interface ColumnMapping {
  sku: string;
  name: string;
  cost: string;
  price: string;
  stock: string;
  min_stock: string;
  category_id?: string;
  brand?: string;
  category_name?: string; // For backward compatibility or alternative mapping
}

export const importService = {
  async processImport(records: any[], mapping: ColumnMapping) {
    // 1. Fetch available categories if we have category_name mapping instead of direct ID
    let categoryMap = new Map<string, string>();
    if (mapping.category_name) {
      const { data: categories } = await inventoryService.fetchCategories();
      if (categories) {
        categories.forEach((cat: any) => {
          categoryMap.set(cat.name.trim().toLowerCase(), cat.id);
        });
      }
    }

    // 2. Prepare the payload array
    const toInsert = records.map(record => {
      // Helper to clean pricing and stock
      const parseNumber = (val: any) => {
        if (val === undefined || val === null || val === "") return 0;
        const normalized = val.toString().replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ".");
        return parseFloat(normalized) || 0;
      };

      // Determine Category ID
      let categoryId = "00000000-0000-0000-0000-000000000000"; // Default (General)
      if (mapping.category_id && record[mapping.category_id]) {
        categoryId = record[mapping.category_id];
      } else if (mapping.category_name && record[mapping.category_name]) {
        const deptName = record[mapping.category_name].toString().trim().toLowerCase();
        categoryId = categoryMap.get(deptName) || "00000000-0000-0000-0000-000000000000";
      }

      return {
        sku: record[mapping.sku]?.toString().trim(),
        name: record[mapping.name]?.toString().trim(),
        cost: parseNumber(record[mapping.cost]),
        price: parseNumber(record[mapping.price]),
        stock: parseInt(record[mapping.stock]?.toString() || "0", 10),
        min_stock: parseInt(record[mapping.min_stock]?.toString() || "0", 10),
        brand: mapping.brand && record[mapping.brand] ? record[mapping.brand].toString() : "Generic",
        category_id: categoryId,
        taxable: true,
      };
    }).filter(item => item.name && item.sku); // Ensure basic validity

    if (toInsert.length === 0) {
      throw new Error("No valid records found to import.");
    }

    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from("products")
      .insert(toInsert);

    if (error) {
      console.error("Import error:", error);
      throw error;
    }

    return data;
  }
};
