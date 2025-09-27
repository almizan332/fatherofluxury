-- Function to update category product counts
CREATE OR REPLACE FUNCTION update_category_product_counts() 
RETURNS void 
LANGUAGE plpgsql 
AS $$
BEGIN
  -- Update product_count for all categories based on actual products
  UPDATE categories 
  SET product_count = (
    SELECT COUNT(*)
    FROM products 
    WHERE products.category = categories.name
  );
  
  -- Set count to 0 for categories with no products
  UPDATE categories 
  SET product_count = 0 
  WHERE product_count IS NULL;
END;
$$;

-- Create trigger function to update category counts when products change
CREATE OR REPLACE FUNCTION trigger_update_category_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update counts for affected categories
  IF TG_OP = 'INSERT' THEN
    -- Update count for new product's category
    UPDATE categories 
    SET product_count = (
      SELECT COUNT(*) 
      FROM products 
      WHERE products.category = NEW.category
    ) 
    WHERE name = NEW.category;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update count for deleted product's category
    UPDATE categories 
    SET product_count = (
      SELECT COUNT(*) 
      FROM products 
      WHERE products.category = OLD.category
    ) 
    WHERE name = OLD.category;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update counts for both old and new categories if category changed
    IF OLD.category != NEW.category THEN
      UPDATE categories 
      SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE products.category = OLD.category
      ) 
      WHERE name = OLD.category;
      
      UPDATE categories 
      SET product_count = (
        SELECT COUNT(*) 
        FROM products 
        WHERE products.category = NEW.category
      ) 
      WHERE name = NEW.category;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger on products table to automatically update category counts
DROP TRIGGER IF EXISTS products_category_count_trigger ON products;
CREATE TRIGGER products_category_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_category_counts();

-- Initial update of all category product counts
SELECT update_category_product_counts();