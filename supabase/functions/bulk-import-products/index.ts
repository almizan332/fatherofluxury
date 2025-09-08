import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductRow {
  product_name: string;
  flylink: string | null;
  alibaba_url: string | null;
  dhgate_url: string | null;
  category: string;
  description: string | null;
  first_image: string;
  media_links: string[] | null;
}

interface ImportResult {
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ rowIndex: number; reason: string }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Set the auth context
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt)
    
    if (authError || !user) {
      throw new Error('Invalid authentication token')
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    const { products, dryRun = false }: { products: ProductRow[], dryRun: boolean } = await req.json()

    if (!Array.isArray(products)) {
      throw new Error('Products must be an array')
    }

    console.log(`Processing ${products.length} products (dry run: ${dryRun})`)

    const result: ImportResult = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    }

    if (dryRun) {
      // For dry run, just validate data
      products.forEach((product, index) => {
        if (!product.product_name?.trim()) {
          result.errors.push({ rowIndex: index, reason: 'Product name is required' })
          result.failed++
        } else if (!product.category?.trim()) {
          result.errors.push({ rowIndex: index, reason: 'Category is required' })
          result.failed++
        } else if (!product.first_image?.trim()) {
          result.errors.push({ rowIndex: index, reason: 'First image is required' })
          result.failed++
        }
      })

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      try {
        if (!product.product_name?.trim()) {
          result.errors.push({ rowIndex: i, reason: 'Product name is required' })
          result.failed++
          continue
        }

        if (!product.category?.trim()) {
          result.errors.push({ rowIndex: i, reason: 'Category is required' })
          result.failed++
          continue
        }

        if (!product.first_image?.trim()) {
          result.errors.push({ rowIndex: i, reason: 'First image is required' })
          result.failed++
          continue
        }

        // Check if product exists by product_name (we'll use this as unique identifier)
        const { data: existingProduct } = await supabaseClient
          .from('products')
          .select('id')
          .eq('product_name', product.product_name)
          .single()

        const productData = {
          product_name: product.product_name,
          flylink: product.flylink,
          alibaba_url: product.alibaba_url,
          dhgate_url: product.dhgate_url,
          category: product.category,
          description: product.description,
          first_image: product.first_image,
          media_links: product.media_links
        }

        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabaseClient
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)

          if (updateError) throw updateError
          result.updated++
        } else {
          // Create new product
          const { error: insertError } = await supabaseClient
            .from('products')
            .insert(productData)

          if (insertError) throw insertError
          result.created++
        }

        console.log(`Processed product ${i + 1}/${products.length}: ${product.product_name}`)

      } catch (error) {
        console.error(`Error processing product ${i}:`, error)
        result.errors.push({ 
          rowIndex: i, 
          reason: error instanceof Error ? error.message : 'Unknown error' 
        })
        result.failed++
      }
    }

    console.log('Import completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})