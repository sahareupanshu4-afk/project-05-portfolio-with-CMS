'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogsAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogsAPI.getAll().then(res => setBlogs(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const [ref, inView] = useInView({ triggerOnce: true });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">My <span className="gradient-text">Blog</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Thoughts, tutorials, and insights about development and technology.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <motion.article key={blog.id} variants={fadeInUp} className="glass-card rounded-xl overflow-hidden group">
                {blog.cover_image_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(blog.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{blog.read_time} min read</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">{blog.title}</h2>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {blog.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-white/5 rounded text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <Link href={`/blog/${blog.slug}`} className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {blogs.length === 0 && (
            <motion.div variants={fadeInUp} className="text-center py-12 text-slate-400">No blog posts found.</motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}