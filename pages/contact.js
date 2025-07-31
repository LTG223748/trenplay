// pages/contact.js
import Layout from '../components/Layout';

export default function ContactPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12 text-white">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">📞 Contact Us</h1>

        <p className="mb-8 text-gray-300">
          Got a question, issue, or just want to say what’s up? We’d love to hear from you.
          Drop us a message and our support team will get back to you within 24–48 hours.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block mb-1 font-bold text-sm">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg bg-[#1a0033] text-white border border-[#3a2a5d] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-[#1a0033] text-white border border-[#3a2a5d] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Message</label>
            <textarea
              placeholder="How can we help?"
              rows="5"
              className="w-full px-4 py-2 rounded-lg bg-[#1a0033] text-white border border-[#3a2a5d] focus:outline-none focus:ring-2 focus:ring-yellow-400"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full shadow-lg transition"
          >
            ✉️ Send Message
          </button>
        </form>

        <div className="mt-12 text-sm text-gray-400">
          Or email us directly: <span className="text-yellow-400">support@trenbet.gg</span>
        </div>
      </div>
    </Layout>
  );
}