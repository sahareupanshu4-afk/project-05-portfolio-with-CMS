'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactAPI, aboutAPI } from '@/lib/api';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [about, setAbout] = useState(null);

  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    aboutAPI.get().then(res => setAbout(res.data.data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      toast.success('Message sent successfully!');
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={ref} initial="initial" animate={inView ? "animate" : "initial"} className="space-y-12">
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get In <span className="gradient-text">Touch</span></h1>
            <p className="text-slate-400 max-w-2xl mx-auto">Have a project in mind or want to collaborate? Feel free to reach out!</p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {about?.email && (
                    <a href={`mailto:${about.email}`} className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <p>{about.email}</p>
                      </div>
                    </a>
                  )}
                  {about?.phone && (
                    <a href={`tel:${about.phone}`} className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Phone</p>
                        <p>{about.phone}</p>
                      </div>
                    </a>
                  )}
                  {about?.location && (
                    <div className="flex items-center gap-4 text-slate-300">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Location</p>
                        <p>{about.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-3">
              <div className="glass-card rounded-xl p-6">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-slate-400">Thank you for reaching out. I'll get back to you soon.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder="Upanshu Sahare" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                          placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Project Inquiry" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Message *</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows={5}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Tell me about your project..." />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}