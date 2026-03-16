
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        createdAt: new Date()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('Error adding document: ', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="pt-32 pb-24 px-6 lg:px-24 bg-beige min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl serif">Connect With Us</h1>
          <p className="text-gray-500 font-light italic max-w-2xl mx-auto">
            Whether you're planning a bespoke private tour or seeking assistance with your reservation, our luxury concierge team is at your service.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl serif">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-6 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email Us</p>
                    <p className="serif text-lg">concierge@yala360.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Call Us</p>
                    <p className="serif text-lg">+94 (0) 77 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shadow-sm">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Park HQ</p>
                    <p className="serif text-lg">Main Entrance, Tissamaharama, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl serif">Frequently Asked</h2>
              <div className="space-y-4">
                <details className="group bg-white p-6 border border-gray-100 cursor-pointer">
                  <summary className="font-bold serif flex justify-between items-center list-none">
                    Best time for sightings?
                    <span className="text-gold group-open:rotate-180 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 font-light leading-relaxed">Early mornings (6:00 AM) are statistically the best for leopard and sloth bear activity.</p>
                </details>
                <details className="group bg-white p-6 border border-gray-100 cursor-pointer">
                  <summary className="font-bold serif flex justify-between items-center list-none">
                    What is the "Crowd-Aware" feature?
                    <span className="text-gold group-open:rotate-180 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-gray-500 font-light leading-relaxed">It's our live tracking system that shows how many jeeps are booked for each time slot, helping you choose quieter periods.</p>
                </details>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 shadow-2xl border-t-4 border-gold space-y-8">
            <h2 className="text-3xl serif">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="bg-green-50 text-green-600 p-4 flex items-center space-x-2 text-sm border border-green-200">
                  <CheckCircle size={16} />
                  <span>Message sent successfully! We will get back to you shortly.</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 text-sm font-light border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Full Name" 
                  className="p-4 border border-beige bg-beige/10 focus:border-gold outline-none w-full" 
                />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address" 
                  className="p-4 border border-beige bg-beige/10 focus:border-gold outline-none w-full" 
                />
              </div>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your Message" 
                rows={6} 
                className="p-4 border border-beige bg-beige/10 focus:border-gold outline-none w-full resize-none"
              ></textarea>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gold text-white uppercase tracking-widest text-xs font-bold hover:bg-black transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
