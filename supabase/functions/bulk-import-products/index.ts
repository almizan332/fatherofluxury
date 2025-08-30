import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductRow {
  title: string;
  slug: string;
  description: string;
  affiliate_link: string | null;
  status: 'draft' | 'published';
  images: string[];
  thumbnail: string | null;
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
        if (!product.title?.trim()) {
          result.errors.push({ rowIndex: index, reason: 'Title is required' })
          result.failed++
        } else if (!product.slug?.trim()) {
          result.errors.push({ rowIndex: index, reason: 'Slug generation failed' })
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
        if (!product.title?.trim()) {
          result.errors.push({ rowIndex: i, reason: 'Title is required' })
          result.failed++
          continue
        }

        if (!product.slug?.trim()) {
          result.errors.push({ rowIndex: i, reason: 'Slug generation failed' })
          result.failed++
          continue
        }

        // Check if product exists by slug
        const { data: existingProduct } = await supabaseClient
          .from('products')
          .select('id')
          .eq('slug', product.slug)
          .single()

        const productData = {
          title: product.title,
          slug: product.slug,
          description: product.description || '',
          affiliate_link: product.affiliate_link,
          thumbnail: product.thumbnail,
          status: product.status
        }

        let productId: string

        if (existingProduct) {
          // Update existing product
          const { data: updatedProduct, error: updateError } = await supabaseClient
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id)
            .select('id')
            .single()

          if (updateError) throw updateError
          
          productId = updatedProduct.id
          result.updated++
          
          // Delete existing images
          await supabaseClient
            .from('product_images')
            .delete()
            .eq('product_id', productId)

        } else {
          // Create new product
          const { data: newProduct, error: insertError } = await supabaseClient
            .from('products')
            .insert(productData)
            .select('id')
            .single()

          if (insertError) throw insertError
          
          productId = newProduct.id
          result.created++
        }

        // Insert images
        if (product.images && product.images.length > 0) {
          const imageRecords = product.images.map((url, position) => ({
            product_id: productId,
            url: url.trim(),
            position
          }))

          const { error: imagesError } = await supabaseClient
            .from('product_images')
            .insert(imageRecords)

          if (imagesError) throw imagesError
        }

        console.log(`Processed product ${i + 1}/${products.length}: ${product.title}`)

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