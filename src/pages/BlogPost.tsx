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
  slug: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

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

              {/* Content with proper HTML rendering from ReactQuill */}
              <style>{`
                .blog-content h1 {
                  font-size: 2.25rem;
                  font-weight: 700;
                  margin-top: 4rem;
                  margin-bottom: 2rem;
                  line-height: 1.2;
                  color: hsl(var(--foreground));
                }
                .blog-content h2 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  margin-top: 3rem;
                  margin-bottom: 1.5rem;
                  line-height: 1.3;
                  color: hsl(var(--foreground));
                }
                .blog-content h3 {
                  font-size: 1.5rem;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.4;
                  color: hsl(var(--foreground));
                }
                .blog-content h4 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  color: hsl(var(--foreground));
                }
                .blog-content p {
                  font-size: 1.125rem;
                  line-height: 1.8;
                  margin-bottom: 1.5rem;
                  color: hsl(var(--foreground) / 0.9);
                }
                .blog-content a {
                  color: hsl(var(--luxury-gold));
                  text-decoration: none;
                  font-weight: 500;
                }
                .blog-content a:hover {
                  text-decoration: underline;
                }
                .blog-content strong {
                  font-weight: 600;
                  color: hsl(var(--foreground));
                }
                .blog-content em {
                  font-style: italic;
                  color: hsl(var(--foreground) / 0.9);
                }
                .blog-content ul, .blog-content ol {
                  margin: 1.5rem 0;
                  padding-left: 1.5rem;
                }
                .blog-content ul {
                  list-style-type: disc;
                }
                .blog-content ol {
                  list-style-type: decimal;
                }
                .blog-content li {
                  font-size: 1.125rem;
                  line-height: 1.8;
                  margin-bottom: 0.5rem;
                  color: hsl(var(--foreground) / 0.9);
                }
                .blog-content blockquote {
                  border-left: 4px solid hsl(var(--luxury-gold));
                  padding-left: 1.5rem;
                  padding-top: 0.25rem;
                  padding-bottom: 0.25rem;
                  font-style: italic;
                  color: hsl(var(--foreground) / 0.8);
                  margin: 1.5rem 0;
                }
                .blog-content img {
                  border-radius: 0.5rem;
                  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
                  margin: 2rem 0;
                  max-width: 100%;
                  height: auto;
                }
              `}</style>
              <div 
                className="blog-content"
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
