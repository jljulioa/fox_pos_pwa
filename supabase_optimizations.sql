-- Supabase Optimizations based on Postgres Best Practices
-- Applied to project: esxdycycrqadrmgrqdbo

-------------------------------------------------------------------------------
-- 1. get_dashboard_stats()
-- Aggregates the total revenue, order count, product count, avg ticket,
-- stock alerts, recent sales, and weekly cash flow on the database side.
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_order_count INT;
  v_product_count INT;
  v_avg_ticket NUMERIC;
  v_stock_alerts JSON;
  v_recent_sales JSON;
  v_cash_flow_data JSON;
BEGIN
  -- Total Revenue and Order Count
  SELECT 
    COALESCE(SUM(total_amount), 0), 
    COUNT(id)
  INTO v_total_revenue, v_order_count
  FROM sales
  WHERE status = 'closed';

  -- Product Count
  SELECT COUNT(id) INTO v_product_count FROM products;

  -- Avg Ticket
  IF v_order_count > 0 THEN
    v_avg_ticket := round((v_total_revenue / v_order_count)::numeric, 2);
  ELSE
    v_avg_ticket := 0;
  END IF;

  -- Stock Alerts
  SELECT COALESCE(json_agg(p), '[]'::json)
  INTO v_stock_alerts
  FROM (
    SELECT id, name, stock, min_stock, cost 
    FROM products 
    WHERE stock <= min_stock 
    LIMIT 5
  ) p;

  -- Recent Sales
  SELECT COALESCE(json_agg(s), '[]'::json)
  INTO v_recent_sales
  FROM (
    SELECT s.total_amount, s.date, c.name as customer_name
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.status = 'closed'
    ORDER BY s.date DESC
    LIMIT 5
  ) s;

  -- Cash Flow (Last 7 days)
  SELECT COALESCE(json_agg(cf), '[]'::json)
  INTO v_cash_flow_data
  FROM (
    WITH last_7_days AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS d
    )
    SELECT 
      to_char(l.d, 'Dy') as name,
      l.d::text as date,
      COALESCE((
        SELECT SUM(s.total_amount)
        FROM sales s
        WHERE s.date::date = l.d AND s.status = 'closed'
      ), 0) as income,
      COALESCE((
        SELECT SUM(p.total_amount) 
        FROM purchases p 
        WHERE p.created_at::date = l.d
      ), 0) as expense
    FROM last_7_days l
    ORDER BY l.d ASC
  ) cf;
  
  RETURN json_build_object(
    'totalRevenue', v_total_revenue,
    'orderCount', v_order_count,
    'productCount', v_product_count,
    'avgTicket', v_avg_ticket,
    'stockAlerts', v_stock_alerts,
    'recentSales', v_recent_sales,
    'cashFlowData', v_cash_flow_data
  );
END;
$$;


-------------------------------------------------------------------------------
-- 2. get_sales_stats(p_start_date, p_end_date, p_search_term)
-- Calculates total units and revenue in the DB, rather than fetching all rows.
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_sales_stats(
  p_start_date TIMESTAMP DEFAULT NULL, 
  p_end_date TIMESTAMP DEFAULT NULL, 
  p_search_term TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue NUMERIC := 0;
  v_total_units NUMERIC := 0;
BEGIN
  SELECT 
    COALESCE(SUM(s.total_amount), 0),
    COALESCE(SUM((
        SELECT COALESCE(SUM(si.quantity), 0)
        FROM sale_items si 
        WHERE si.sale_id = s.id
    )), 0)
  INTO v_total_revenue, v_total_units
  FROM sales s
  WHERE s.status = 'closed'
    AND (p_start_date IS NULL OR s.date >= p_start_date)
    AND (p_end_date IS NULL OR s.date <= p_end_date)
    AND (p_search_term IS NULL OR p_search_term = '' OR s.sale_ref ILIKE '%' || p_search_term || '%');

  RETURN json_build_object(
    'totalRevenue', v_total_revenue,
    'totalUnits', v_total_units
  );
END;
$$;


-------------------------------------------------------------------------------
-- 3. process_sale_return(p_sale_item_id, p_sale_id, p_product_id, p_returning_qty, p_sale_ref)
-- Atomic function to handle sale item returns, update stock, and log audit.
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_sale_return(
  p_sale_item_id UUID,
  p_sale_id UUID,
  p_product_id UUID,
  p_returning_qty INT,
  p_sale_ref TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_unit_price NUMERIC;
  v_tax_amount NUMERIC;
  v_current_qty INT;
  v_new_qty INT;
  v_tax_per_unit NUMERIC;
  v_returning_tax NUMERIC;
  v_returning_total_with_tax NUMERIC;
  v_product_stock INT;
  v_product_name TEXT;
  v_new_total_amount NUMERIC;
BEGIN
  -- 1. Get Sale Item details
  SELECT unit_price, tax_amount, quantity 
  INTO v_unit_price, v_tax_amount, v_current_qty
  FROM sale_items
  WHERE id = p_sale_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale item not found';
  END IF;

  v_tax_per_unit := v_tax_amount / v_current_qty;
  v_returning_tax := v_tax_per_unit * p_returning_qty;
  v_returning_total_with_tax := (v_unit_price * p_returning_qty) + v_returning_tax;

  -- 2. Update Sale Item
  IF v_current_qty <= p_returning_qty THEN
    DELETE FROM sale_items WHERE id = p_sale_item_id;
  ELSE
    v_new_qty := v_current_qty - p_returning_qty;
    UPDATE sale_items
    SET 
      quantity = v_new_qty,
      total_price = v_unit_price * v_new_qty,
      tax_amount = v_tax_per_unit * v_new_qty
    WHERE id = p_sale_item_id;
  END IF;

  -- 3. Update Product Stock
  SELECT stock, name INTO v_product_stock, v_product_name
  FROM products
  WHERE id = p_product_id;

  UPDATE products SET stock = stock + p_returning_qty WHERE id = p_product_id;

  -- 4. Log Inventory Transaction
  INSERT INTO inventory_transactions (
    product_id,
    product_name,
    transaction_type,
    quantity_change,
    stock_before,
    stock_after,
    related_document_id,
    notes
  ) VALUES (
    p_product_id,
    v_product_name,
    'return',
    p_returning_qty,
    v_product_stock,
    v_product_stock + p_returning_qty,
    p_sale_ref,
    'Customer return from ' || p_sale_ref
  );

  -- 5. Update Sale total_amount
  UPDATE sales
  SET total_amount = total_amount - v_returning_total_with_tax
  WHERE id = p_sale_id
  RETURNING total_amount INTO v_new_total_amount;

  RETURN v_new_total_amount;
END;
$$;
