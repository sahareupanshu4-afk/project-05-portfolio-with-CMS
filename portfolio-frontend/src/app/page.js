'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, ExternalLink } from 'lucide-react';
import { aboutAPI, projectsAPI, skillsAPI, testimonialsAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const [about, setAbout] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aboutRes, projectsRes, skillsRes, testimonialsRes] = await Promise.all([
        aboutAPI.get(), projectsAPI.getFeatured(), skillsAPI.getAll(), testimonialsAPI.getAll()
      ]);
      setAbout(aboutRes.data.data);
      setProjects(projectsRes.data.data || []);
      setSkills(skillsRes.data.data || []);
      setTestimonials(testimonialsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [heroRef, heroInView] = useInView({ triggerOnce: true });
  const [projectsRef, projectsInView] = useInView({ triggerOnce: true });
  const [skillsRef, skillsInView] = useInView({ triggerOnce: true });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="initial"
        animate={heroInView ? "animate" : "initial"}
        variants={stagger}
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse animation-delay-200" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <motion.div variants={fadeInUp}>
                <span className="px-4 py-2 glass rounded-full text-sm text-primary-400">
                  👋 Welcome to my portfolio
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Hi, I'm{' '}
                <span className="gradient-text">{about?.title || 'Upanshu Sahare'}</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-slate-400">
                {about?.subtitle || 'Full Stack Developer'}
              </motion.p>
              
              <motion.p variants={fadeInUp} className="text-slate-300 max-w-lg">
                {about?.description || 'I build exceptional digital experiences with modern technologies.'}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Link href="/projects" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                  View Projects <ArrowRight className="w-4 h-4" />
                </Link>
                {about?.resume_url && (
                  <a href={about.resume_url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 glass rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Resume
                  </a>
                )}
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4">
                {about?.social_links?.github && <a href={about.social_links.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Github className="w-6 h-6" /></a>}
                {about?.social_links?.linkedin && <a href={about.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>}
                {about?.email && <a href={`mailto:${about.email}`} className="text-slate-400 hover:text-white transition-colors"><Mail className="w-6 h-6" /></a>}
                {about?.location && <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-4 h-4" />{about.location}</span>}
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="relative flex justify-center">
              <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                  {about?.avatar_url ? (
                    <img src={about.avatar_url} alt={about.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-6xl font-bold gradient-text">
                      {about?.title?.charAt(0) || 'J'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Projects */}
      <motion.section
        ref={projectsRef}
        initial="initial"
        animate={projectsInView ? "animate" : "initial"}
        variants={stagger}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured <span className="gradient-text">Projects</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Some of my recent work that showcases my skills and passion for development.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project, i) => (
              <motion.div key={project.id} variants={fadeInUp} className="glass-card rounded-xl overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.slice(0, 3).map((tech, j) => (
                      <span key={j} className="px-2 py-1 text-xs bg-white/5 rounded text-slate-300">{tech}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm"><ExternalLink className="w-4 h-4" /> Live</a>}
                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><Github className="w-4 h-4" /> Code</a>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="text-center mt-8">
            <Link href="/projects" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
              View all projects <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Skills */}
      <motion.section
        ref={skillsRef}
        initial="initial"
        animate={skillsInView ? "animate" : "initial"}
        variants={stagger}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">My <span className="gradient-text">Skills</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Technologies and tools I work with.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {skills.slice(0, 12).map((skill, i) => (
              <motion.div key={skill.id} variants={fadeInUp} className="glass-card rounded-xl p-4 text-center">
                {skill.icon_url ? (
                  <img src={skill.icon_url} alt={skill.name} className="w-10 h-10 mx-auto mb-2" />
                ) : (
                  <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {skill.name.charAt(0)}
                  </div>
                )}
                <p className="text-sm font-medium">{skill.name}</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${skill.proficiency}%` }} />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="text-center mt-8">
            <Link href="/skills" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
              View all skills <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Let's Work <span className="gradient-text">Together</span></h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Have a project in mind? Let's create something amazing together.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Get In Touch <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}