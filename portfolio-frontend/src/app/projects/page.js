'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Github } from 'lucide-react';
import { projectsAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.getAll().then(res => setProjects(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const [ref, inView] = useInView({ triggerOnce: true });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">My <span className="gradient-text">Projects</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto">A collection of projects I've worked on, showcasing my skills and experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div key={project.id} variants={fadeInUp} className="glass-card rounded-xl overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20" />
                  )}
                  {project.featured && <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-black text-xs font-medium rounded">Featured</span>}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{project.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{project.status}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.map((tech, j) => (
                      <span key={j} className="px-2 py-1 text-xs bg-white/5 rounded text-slate-300">{tech}</span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm"><ExternalLink className="w-4 h-4" /> Live</a>}
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><Github className="w-4 h-4" /> Code</a>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {projects.length === 0 && (
            <motion.div variants={fadeInUp} className="text-center py-12 text-slate-400">No projects found.</motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}