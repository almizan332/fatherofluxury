-- Update chatbot settings to disable image search by default
UPDATE chatbot_settings 
SET image_search_enabled = false, 
    welcome_message = 'Hello! How can I help you today? I can assist you with product information, orders, and general inquiries.'
WHERE id = 'default';

-- Insert default settings if they don't exist
INSERT INTO chatbot_settings (id, enabled, welcome_message, theme_color, position, image_search_enabled)
VALUES ('default', true, 'Hello! How can I help you today? I can assist you with product information, orders, and general inquiries.', '#8B5CF6', 'bottom-right', false)
ON CONFLICT (id) DO UPDATE SET 
    image_search_enabled = false,
    welcome_message = 'Hello! How can I help you today? I can assist you with product information, orders, and general inquiries.';