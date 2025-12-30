import { motion } from "framer-motion";
import { Quote, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Monthly Donor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "Fun Charity made giving so joyful! I can see exactly where my donations go, and the updates I receive warm my heart every time.",
    rating: 5,
    type: "donor",
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Beneficiary",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    quote: "Thanks to the kind donors here, my children can now go to school with proper supplies. This platform changed our lives forever.",
    rating: 5,
    type: "beneficiary",
  },
  {
    id: 3,
    name: "David Chen",
    role: "Volunteer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "Being part of Fun Charity's volunteer community is incredible. The transparency and genuine care for people is what sets them apart.",
    rating: 5,
    type: "volunteer",
  },
  {
    id: 4,
    name: "Emily Thompson",
    role: "Campaign Creator",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "I raised funds for my community garden project in just weeks! The support from this loving community exceeded all my expectations.",
    rating: 5,
    type: "creator",
  },
  {
    id: 5,
    name: "James Wilson",
    role: "Corporate Partner",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "Our company partners with Fun Charity for CSR initiatives. Their professionalism and impact tracking are outstanding.",
    rating: 5,
    type: "partner",
  },
  {
    id: 6,
    name: "Aisha Rahman",
    role: "Beneficiary Family",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    quote: "The medical support we received during my father's treatment saved his life. We are forever grateful to every donor.",
    rating: 5,
    type: "beneficiary",
  },
];

const typeColors = {
  donor: "from-rose-400 to-pink-500",
  beneficiary: "from-amber-400 to-orange-500",
  volunteer: "from-emerald-400 to-teal-500",
  creator: "from-violet-400 to-purple-500",
  partner: "from-blue-400 to-indigo-500",
};

const typeBgColors = {
  donor: "bg-rose-100 text-rose-700",
  beneficiary: "bg-amber-100 text-amber-700",
  volunteer: "bg-emerald-100 text-emerald-700",
  creator: "bg-violet-100 text-violet-700",
  partner: "bg-blue-100 text-blue-700",
};

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-rose-50/30 to-amber-50/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-tl from-amber-200/20 to-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Quote className="w-5 h-5 text-rose-500" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Testimonials</span>
            <Quote className="w-5 h-5 text-rose-500 rotate-180" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Stories of <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Love & Impact</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real voices from our community of donors, beneficiaries, and volunteers sharing their heartfelt experiences
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-100/50 h-full flex flex-col">
                {/* Quote icon */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[testimonial.type as keyof typeof typeColors]} flex items-center justify-center shadow-lg`}>
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-foreground/80 leading-relaxed mb-6 flex-grow italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-rose-100/50">
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeBgColors[testimonial.type as keyof typeof typeBgColors]}`}>
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 flex-wrap justify-center bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-rose-100/50">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-foreground font-semibold">10,000+</span>
              <span className="text-muted-foreground">Happy Donors</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-foreground font-semibold">4.9/5</span>
              <span className="text-muted-foreground">Rating</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-pink-500" />
              <span className="text-foreground font-semibold">500+</span>
              <span className="text-muted-foreground">Success Stories</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
