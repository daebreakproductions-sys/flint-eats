import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Leaf, ArrowRight, MapPin, Users, BookOpen, Star,
  CheckCircle2, Shield, Zap, ChevronLeft, Heart
} from "lucide-react";

const TESTIMONIALS = [
  { name: "Maria R.", role: "Flint Resident", quote: "Found a food pantry 2 blocks from my house I never knew about. This app changed everything.", avatar: "M" },
  { name: "James T.", role: "Volunteer", quote: "I use it every week to find distribution events. The community here is incredible.", avatar: "J" },
  { name: "Pastor Linda K.", role: "Partner Organization", quote: "We post our meal times here and get so many more families showing up now.", avatar: "L" },
];

const ROLE_OPTIONS = [
  { value: "resident", label: "Flint Resident", desc: "I'm looking for food resources near me", icon: "🏠" },
  { value: "volunteer", label: "Volunteer", desc: "I want to help support my community", icon: "🤝" },
  { value: "partner_org", label: "Organization / Church", desc: "We provide food resources or services", icon: "🏛️" },
  { value: "user", label: "Just Exploring", desc: "I'm curious about what Flint Eats offers", icon: "👀" },
];

const PERKS = [
  { icon: MapPin, text: "Interactive map of 50+ local food resources" },
  { icon: Users, text: "Connect with your neighbors & community" },
  { icon: BookOpen, text: "Guides on SNAP, WIC, and healthy eating" },
  { icon: Zap, text: "Real-time event alerts near you" },
];

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 transition-all duration-500">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-white">
          {t.avatar}
        </div>
        <div>
          <p className="text-white/90 text-sm leading-relaxed italic">"{t.quote}"</p>
          <div className="mt-2">
            <p className="text-white font-semibold text-sm">{t.name}</p>
            <p className="text-green-300 text-xs">{t.role}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3 justify-center">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

// Multi-step signup experience
function SignUpFlow({ onBack }) {
  const [step, setStep] = useState(0); // 0 = role select, 1 = ready
  const [selectedRole, setSelectedRole] = useState(null);

  const steps = ["Choose your role", "You're all set"];

  const handleContinue = () => {
    if (step === 0 && selectedRole) {
      setStep(1);
    } else if (step === 1) {
      base44.auth.redirectToLogin("/Feed");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex-1 flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-500 ${i <= step ? "bg-green-600" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 text-right">{step + 1} of {steps.length}</p>
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">What brings you here?</h2>
          <p className="text-gray-500 text-sm mb-6">We'll personalize your experience based on your role.</p>
          <div className="space-y-3">
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedRole(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedRole === opt.value
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
                {selectedRole === opt.value && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're ready to join! 🎉</h2>
          <p className="text-gray-500 mb-8 max-w-xs">
            Create your free account and start connecting with Flint's food community.
          </p>
          <div className="w-full space-y-2 text-left mb-6">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-green-700" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-4">
        <button
          onClick={handleContinue}
          disabled={step === 0 && !selectedRole}
          className="w-full py-3.5 rounded-2xl font-bold text-white bg-green-700 hover:bg-green-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {step === steps.length - 1 ? "Create My Account" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
        {step === 0 && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Already have an account?{" "}
            <button onClick={onBack} className="text-green-700 font-semibold hover:underline">
              Sign in instead
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthGateway() {
  const [mode, setMode] = useState("home"); // home | signin | signup

  const { data: resources = [] } = useQuery({
    queryKey: ["gateway-resources"],
    queryFn: () => base44.entities.FoodResource.filter({ is_active: true }, "-created_date", 5),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["gateway-posts"],
    queryFn: () => base44.entities.Post.filter({ is_published: true }, "-created_date", 5),
  });

  const memberCount = Math.max(posts.length * 3, 42); // estimated

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT — Brand Panel */}
      <div className="relative lg:w-1/2 bg-gradient-to-br from-green-700 via-emerald-800 to-green-900 text-white flex flex-col justify-between p-8 lg:p-12 overflow-hidden min-h-[300px] lg:min-h-screen">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-8 lg:mb-16">
            <span className="text-3xl">🌿</span>
            <span className="text-2xl font-extrabold tracking-tight">Flint Eats</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 text-xs mb-4">
              <Leaf className="w-3.5 h-3.5" /> Serving Flint & Genesee County
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
              Your community.<br />Your food.<br />Your voice.
            </h1>
            <p className="text-green-100 text-sm leading-relaxed max-w-sm">
              Join thousands of Flint residents connecting over food resources, recipes, and community support.
            </p>
          </div>

          {/* Live social proof */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {["A","B","C","D"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-green-700 flex items-center justify-center text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-green-200">
              <span className="text-white font-bold">{memberCount}+ members</span> and growing
            </p>
          </div>

          <div className="space-y-2.5 hidden lg:block">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-green-100">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative hidden lg:block mt-8">
          <TestimonialCarousel />
        </div>
      </div>

      {/* RIGHT — Auth Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">

          {/* HOME mode */}
          {mode === "home" && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back 👋</h2>
                <p className="text-gray-500">Sign in to your account or create a new one — it's free.</p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => base44.auth.redirectToLogin("/Feed")}
                  className="w-full py-3.5 rounded-2xl font-bold text-white bg-green-700 hover:bg-green-800 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className="w-full py-3.5 rounded-2xl font-bold text-green-800 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 transition flex items-center justify-center gap-2"
                >
                  Create Free Account
                </button>
              </div>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400 py-4 border-t border-gray-100">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure & Private</span>
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-green-500" /> Free Forever</span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-green-500" /> Community Owned</span>
              </div>

              {/* Feature highlights for mobile */}
              <div className="mt-6 lg:hidden space-y-2">
                {PERKS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5">
                    <Icon className="w-4 h-4 text-green-600 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Mobile testimonial */}
              <div className="mt-6 lg:hidden">
                <TestimonialCarousel />
              </div>
            </div>
          )}

          {/* SIGNUP mode */}
          {mode === "signup" && (
            <SignUpFlow onBack={() => setMode("home")} />
          )}
        </div>
      </div>
    </div>
  );
}