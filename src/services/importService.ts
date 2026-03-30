import { supabase } from "@/lib/supabase";
import { inventoryService } from "./inventoryService";

export interface ImportRecord {
  Codigo: string;
  Descripcion: string;
  "Precio Costo": string;
  "Precio Venta": string;
  "Precio Mayoreo": string;
  Inventario: string;
  "Inv. Minim": string;
  Departamento: string;
}

export const importService = {
  async processImport(records: ImportRecord[]) {
    // 1. Fetch available categories to map 'Departamento'
    const { data: categories } = await inventoryService.fetchCategories();
    const categoryMap = new Map<string, string>();
    if (categories) {
      categories.forEach((cat: any) => {
        categoryMap.set(cat.name.trim().toLowerCase(), cat.id);
      });
    }

    // 2. Prepare the payload array
    const toInsert = records.map(record => {
      const deptName = record.Departamento ? record.Departamento.trim().toLowerCase() : "";
      const categoryId = categoryMap.get(deptName) || null;

      // Clean pricing and stock (removing $ and ,)
      const parseNumber = (val: string) => {
        if (!val) return 0;
        const cleaned = val.toString().replace(/[$,.]/g, "");
        // If it was formatted as $200,00 it might become 20000. 
        // We should just use parseFloat after replacing $ and converting , to .
        const normalized = val.toString().replace(/\$/g, "").replace(/\./g, "").replace(/,/g, ".");
        return parseFloat(normalized) || 0;
      };

      return {
        sku: record.Codigo?.toString().trim(),
        name: record.Descripcion?.trim(),
        cost: parseNumber(record["Precio Costo"]),
        price: parseNumber(record["Precio Venta"]),
        stock: parseInt(record.Inventario?.toString() || "0", 10),
        min_stock: parseInt(record["Inv. Minim"]?.toString() || "0", 10),
        brand: "Generic", // Default brand
        category_id: categoryId,
        taxable: true,
      };
    }).filter(item => item.name && item.sku); // Ensure basic validity

    if (toInsert.length === 0) {
      throw new Error("No valid records found to import.");
    }

    // 3. Insert or Upsert into Supabase
    // We'll use insert. If they already exist and SKU is unique, it might fail unless we do an upsert. 
    // Assuming SKU is unique constraint in DB, we can use upsert on 'sku'.
    // However, if we don't know the exact unique constraint, standard insert is safer if we want to avoid overwriting or if there is no unique constraint on SKU.
    // Let's use standard insert for now.
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
