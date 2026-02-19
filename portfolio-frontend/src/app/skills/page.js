'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { skillsAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    skillsAPI.getAll().then(res => setSkills(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const [ref, inView] = useInView({ triggerOnce: true });
  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">My <span className="gradient-text">Skills</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Technologies and tools I work with to build amazing applications.</p>
          </motion.div>

          {categories.length > 0 ? categories.map((category) => (
            <motion.div key={category} variants={fadeInUp}>
              <h2 className="text-2xl font-semibold mb-6">{category}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {skills.filter(s => s.category === category).map((skill) => (
                  <div key={skill.id} className="glass-card rounded-xl p-4 text-center">
                    {skill.icon_url ? (
                      <img src={skill.icon_url} alt={skill.name} className="w-12 h-12 mx-auto mb-3" />
                    ) : (
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {skill.name.charAt(0)}
                      </div>
                    )}
                    <p className="font-medium mb-2">{skill.name}</p>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{skill.proficiency}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills.map((skill) => (
                <motion.div key={skill.id} variants={fadeInUp} className="glass-card rounded-xl p-4 text-center">
                  {skill.icon_url ? (
                    <img src={skill.icon_url} alt={skill.name} className="w-12 h-12 mx-auto mb-3" />
                  ) : (
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {skill.name.charAt(0)}
                    </div>
                  )}
                  <p className="font-medium mb-2">{skill.name}</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${skill.proficiency}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{skill.proficiency}%</p>
                </motion.div>
              ))}
            </div>
          )}

          {skills.length === 0 && (
            <motion.div variants={fadeInUp} className="text-center py-12 text-slate-400">No skills found.</motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}