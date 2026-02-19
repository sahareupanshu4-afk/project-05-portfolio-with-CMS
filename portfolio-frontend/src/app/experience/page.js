'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { experienceAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    experienceAPI.getAll().then(res => setExperiences(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const [ref, inView] = useInView({ triggerOnce: true });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">My <span className="gradient-text">Experience</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto">My professional journey and work history.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-gradient-to-b from-primary-500 to-accent-500" />

            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <motion.div key={exp.id} variants={fadeInUp} className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-slate-900 z-10" />

                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className="glass-card rounded-xl p-6 ml-8 md:ml-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                          <h3 className="text-xl font-semibold">{exp.position}</h3>
                          <p className="text-primary-400">{exp.company}</p>
                        </div>
                      </div>
                      
                      <div className={`flex flex-wrap gap-4 text-sm text-slate-400 mb-4 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />
                          {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                          {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        {exp.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{exp.location}</span>}
                      </div>

                      <p className="text-slate-300 mb-4">{exp.description}</p>

                      {exp.technologies?.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                          {exp.technologies.map((tech, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-white/5 rounded text-slate-300">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>

          {experiences.length === 0 && (
            <motion.div variants={fadeInUp} className="text-center py-12 text-slate-400">No experience found.</motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}