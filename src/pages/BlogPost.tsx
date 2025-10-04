import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--luxury-gold))]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Post not found</h1>
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(240_10%_5%)] to-background flex flex-col">
      <Helmet>
        <title>{post.seo_title}</title>
        <meta name="description" content={post.seo_description} />
        <meta name="keywords" content={post.seo_keywords} />
        <meta property="og:title" content={post.seo_title} />
        <meta property="og:description" content={post.seo_description} />
        <meta property="og:image" content={post.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title} />
        <meta name="twitter:description" content={post.seo_description} />
        <meta name="twitter:image" content={post.image} />
      </Helmet>

      <Navbar />
      <ScrollArea className="flex-grow">
        <main className="max-w-5xl mx-auto px-6 py-12">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-secondary/50 group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Button>
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/50 shadow-[var(--shadow-elegant)]"
          >
            {/* Hero Image */}
            <div className="aspect-[21/9] relative overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            
            <div className="p-8 lg:p-12">
              {/* Metadata */}
              <div className="flex items-center gap-4 mb-8 text-muted-foreground">
                <time className="text-sm">
                  {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                </time>
                <span className="text-sm">•</span>
                <span className="text-sm">
                  {Math.ceil(post.content.split(' ').length / 200)} min read
                </span>
              </div>

              {/* Title & Excerpt */}
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed border-l-4 border-[hsl(var(--luxury-gold))] pl-6">
                {post.excerpt}
              </p>

              {/* Content */}
              <div 
                className="prose prose-lg prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[hsl(var(--luxury-gold))] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-blockquote:border-l-[hsl(var(--luxury-gold))] prose-blockquote:italic
                  prose-code:text-[hsl(var(--luxury-gold))] prose-code:bg-secondary/50 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </motion.article>
        </main>
      </ScrollArea>
      <Footer />
    </div>
  );
};

export default BlogPost;
