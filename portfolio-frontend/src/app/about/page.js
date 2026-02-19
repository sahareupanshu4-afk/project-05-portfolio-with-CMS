'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Mail, Phone, Download, Github, Linkedin, Twitter } from 'lucide-react';
import { aboutAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aboutAPI.get().then(res => setAbout(res.data.data)).finally(() => setLoading(false));
  }, []);

  const [ref, inView] = useInView({ triggerOnce: true });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">About <span className="gradient-text">Me</span></h1>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-xl opacity-30" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                {about?.avatar_url ? (
                  <img src={about.avatar_url} alt={about.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-5xl font-bold gradient-text">
                    {about?.title?.charAt(0) || 'J'}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{about?.title}</h2>
              <p className="text-primary-400 text-lg mb-4">{about?.subtitle}</p>
              <p className="text-slate-300 max-w-lg">{about?.bio}</p>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {about?.location && <div className="flex items-center gap-3 text-slate-300"><MapPin className="w-5 h-5 text-primary-400" />{about.location}</div>}
              {about?.email && <a href={`mailto:${about.email}`} className="flex items-center gap-3 text-slate-300 hover:text-white"><Mail className="w-5 h-5 text-primary-400" />{about.email}</a>}
              {about?.phone && <a href={`tel:${about.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-white"><Phone className="w-5 h-5 text-primary-400" />{about.phone}</a>}
              {about?.resume_url && <a href={about.resume_url} target="_blank" className="flex items-center gap-3 text-slate-300 hover:text-white"><Download className="w-5 h-5 text-primary-400" />Download Resume</a>}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Connect With Me</h3>
            <div className="flex gap-4">
              {about?.social_links?.github && <a href={about.social_links.github} target="_blank" className="p-3 glass rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Github className="w-6 h-6" /></a>}
              {about?.social_links?.linkedin && <a href={about.social_links.linkedin} target="_blank" className="p-3 glass rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Linkedin className="w-6 h-6" /></a>}
              {about?.social_links?.twitter && <a href={about.social_links.twitter} target="_blank" className="p-3 glass rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"><Twitter className="w-6 h-6" /></a>}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}