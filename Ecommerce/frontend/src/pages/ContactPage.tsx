import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold text-purple tracking-widest uppercase">
          Get in Touch
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
          We'd Love to Hear From You
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          Have queries about an order, product specifications, or partnership? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-3xl border border-line p-8 shadow-card space-y-6">
            <h3 className="font-heading font-extrabold text-xl text-ink">
              ThinkMart India Headquarters
            </h3>

            <div className="space-y-4 text-sm text-ink">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-ink">Location</strong>
                  <span className="text-muted">Tech Retail Hub, Amaravati Road, Guntur, Andhra Pradesh - 522508</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-ink">Customer Support Email</strong>
                  <span className="text-muted">support@thinkmart.in / admin@thinkmart.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-ink">Toll-Free Helpline</strong>
                  <span className="text-muted">+91 (800) 123-4567 • Mon-Sat, 9AM - 8PM</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-line text-xs text-muted">
              ⚡ Orders are processed and dispatched within 24 hours of placement.
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-surface rounded-3xl border border-line p-8 sm:p-10 shadow-card">
          <h3 className="font-heading font-extrabold text-xl text-ink mb-6">
            Send Us a Message
          </h3>

          {submitted ? (
            <div className="p-6 bg-green/10 border border-green/20 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-green mx-auto" />
              <h4 className="font-bold text-green text-base">Message Sent Successfully!</h4>
              <p className="text-xs text-muted">Thank you for reaching out. Our support team will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Your Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priyanshu Roy"
                    className="w-full px-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                    Email Address <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order enquiry, warranty, or feedback"
                  className="w-full px-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                  Your Message <span className="text-red">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you today?"
                  className="w-full px-4 py-2.5 bg-bg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-purple hover:bg-purple-dark text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

