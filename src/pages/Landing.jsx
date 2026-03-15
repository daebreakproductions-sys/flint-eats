import { base44 } from "@/api/base44Client";
import { Leaf, MapPin, Users, BookOpen, ArrowRight, Heart } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Find Food Near You",
    desc: "Interactive map of food pantries, farmers markets, mobile markets, and more across Genesee County.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: Users,
    title: "Community Feed",
    desc: "Share recipes, tips, and local resources with neighbors who care about food access.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: BookOpen,
    title: "Learn & Grow",
    desc: "Access guides on nutrition, SNAP/EBT benefits, cooking on a budget, and more.",
    color: "bg-teal-100 text-teal-700",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-white font-bold text-xl">Flint Eats</span>
        </div>
        <button
          onClick={() => base44.auth.redirectToLogin("/Feed")}
          className="text-sm font-medium text-white border border-white/40 rounded-full px-4 py-1.5 hover:bg-white/10 transition"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-700 via-emerald-800 to-green-900 text-white px-6 py-24 text-center overflow-hidden">
        {/* background circles */}
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-white/5 rounded-full" />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Leaf className="w-4 h-4" />
            Serving Flint &amp; Genesee County
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Nourishing Our Community,<br />Together.
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
            Flint Eats connects residents with local food resources, community knowledge, and the programs that make healthy eating possible for everyone.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin("/Feed")}
            className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-green-50 transition text-base"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-green-200 text-sm mt-4">Free to join · No cost, ever</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="text-center">
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Mission banner */}
      <section className="bg-green-50 border-y border-green-100 px-6 py-12 text-center">
        <Heart className="w-8 h-8 text-green-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Mission</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Food security is a community issue. Flint Eats was built to make it easier for Flint residents to find fresh food, share what they know, and support one another — neighborhood by neighborhood.
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to join the community?</h2>
        <p className="text-gray-500 mb-6">Create a free account and start exploring resources today.</p>
        <button
          onClick={() => base44.auth.redirectToLogin("/Feed")}
          className="inline-flex items-center gap-2 bg-green-700 text-white font-semibold px-8 py-3 rounded-full hover:bg-green-800 transition"
        >
          Join Flint Eats <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400 px-6 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">🌿</span>
          <span className="text-white font-semibold">Flint Eats</span>
        </div>
        <p>Connecting Flint &amp; Genesee County to the food they deserve.</p>
        <p className="mt-1 text-gray-600">© {new Date().getFullYear()} Flint Eats. All rights reserved.</p>
      </footer>
    </div>
  );
}