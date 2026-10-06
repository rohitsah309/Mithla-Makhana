import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { contactAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Customer Query / Bulk Inquiry',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      error('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactAPI.sendMessage(formData);
      if (res.data.success) {
        setSubmitted(true);
        success('Thank you! Your message has been received by our family team.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Customer Query / Bulk Inquiry',
          message: ''
        });
      }
    } catch (err) {
      error('Failed to submit message. Please try again or reach out by phone.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="bg-hero-gradient rounded-3xl p-8 sm:p-14 border border-[#E8DEC9] text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-[#D99B26] font-bold">
          Get in Touch
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4A2E1B]">
          Contact Mithila Makhana
        </h1>
        <p className="text-sm text-[#6D4A32] max-w-xl mx-auto">
          Have a question about our harvest, family bulk orders, custom gifting, or dispatch status? We’d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Editable Business Information Placeholders */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#E8DEC9] shadow-soft space-y-8">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">
              Mithila Makhana
            </h3>
            <p className="text-xs text-[#8A6D56]">
              Authentic Makhana from Bihar • Family-Owned Business
            </p>
          </div>

          <div className="space-y-5 text-xs text-[#6D4A32]">
            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#D99B26] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#4A2E1B] block text-sm">Location / Origin</span>
                <p className="mt-0.5">Mithila Makhana Operations</p>
                <p>Bihar, India</p>
                <p className="text-[11px] text-[#8A6D56] italic mt-0.5">(Exact address details updated on invoices)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#2D5A27] flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#4A2E1B] block text-sm">Phone Assistance</span>
                <p className="mt-0.5">+91 98765 43210</p>
                <p className="text-[11px] text-[#8A6D56]">Mon – Sat, 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#D99B26] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#4A2E1B] block text-sm">Direct Email</span>
                <p className="mt-0.5">care@mithilamakhana.com</p>
                <p>orders@mithilamakhana.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#4A2E1B] flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#4A2E1B] block text-sm">Online Orders Dispatch</span>
                <p className="mt-0.5">Processed 6 days a week with rapid Indian express courier services.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DEC9] text-[11px] text-[#8A6D56] leading-relaxed">
            <span className="font-bold text-[#4A2E1B] block mb-1">Family & Festive Bulk Orders:</span>
            We gladly pack 5kg to 50kg bulk bags for community gatherings, weddings, and healthy corporate gifting boxes.
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#E8DEC9] shadow-soft space-y-6">
          <div className="border-b border-[#E8DEC9] pb-3">
            <h3 className="font-serif text-2xl font-bold text-[#4A2E1B]">
              Send Us a Message
            </h3>
            <p className="text-xs text-[#8A6D56] mt-0.5">
              Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-[#EAF3E7] border border-[#2D5A27]/20 flex items-center space-x-3 text-xs text-[#2D5A27]">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>Your message has been sent successfully! We look forward to connecting with you.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Anand Jha"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. anand@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98123 45678"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                >
                  <option value="Customer Query / Feedback">Customer Query / Feedback</option>
                  <option value="Family Bulk Order">Family Bulk Order</option>
                  <option value="Retail / Distribution Inquiry">Retail / Distribution Inquiry</option>
                  <option value="Packaging & Delivery Question">Packaging & Delivery Question</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2E1B] block mb-1">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="How can our family business assist you?"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF6F0] border border-[#E8DEC9] focus:outline-none focus:border-[#D99B26] text-[#4A2E1B]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#27170E] text-[#FAF6F0] font-bold text-xs shadow-soft transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
