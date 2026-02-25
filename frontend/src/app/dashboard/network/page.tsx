'use client';

import { ShieldCheck, Mail, Phone, Calendar, Star, MapPin, Award } from 'lucide-react';
import Image from 'next/image';

const advisors = [
    {
        id: 1,
        name: "Dr. Ananya Sharma",
        role: "Medical Auditor (Cardiology)",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
        rating: 4.9,
        reviews: 124,
        location: "Mumbai, MH",
        experience: "12 Years",
        expertise: ["Overcharging in Surgery", "ICU Billing Scrutiny", "Implant Costing"],
        status: "Available"
    },
    {
        id: 2,
        name: "Adv. Rajesh Kumar",
        role: "Consumer Rights Advocate",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&q=80",
        rating: 4.8,
        reviews: 89,
        location: "Delhi, NCR",
        experience: "15 Years",
        expertise: ["Medical Negligence", "Insurance Denial", "Consumer Court Petitions"],
        status: "Busy"
    },
    {
        id: 3,
        name: "Dr. Siddharth Menon",
        role: "Healthcare Billing Specialist",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
        rating: 5.0,
        reviews: 210,
        location: "Bangalore, KA",
        experience: "8 Years",
        expertise: ["Pharmacy Marks-ups", "Consumables Audit", "Negotiation"],
        status: "Available"
    }
];

export default function ProfessionalNetworkPage() {
    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black mb-2">Advisor Network</h1>
                    <p className="text-gray-600">Connect with verified Medical Auditors and Consumer Lawyers to escalate your dispute.</p>
                </div>
                <div className="flex items-center gap-2 bg-brand-blue/10 px-4 py-2 rounded-xl border border-brand-blue/20">
                    <ShieldCheck className="w-5 h-5 text-black" />
                    <span className="text-sm font-medium text-black">100% Verified Professionals</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {advisors.map((advisor) => (
                    <div key={advisor.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 border border-gray-200 hover:border-brand-blue/30 transition-colors group">

                        {/* Avatar Column */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-3 border-2 border-gray-200 group-hover:border-brand-blue transition-colors shadow-lg">
                                {/* Use unoptimized for external unsplash images in demo to prevent next/image build issues if domains aren't configured */}
                                <Image src={advisor.image} alt={advisor.name} fill className="object-cover" unoptimized />
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${advisor.status === 'Available'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                }`}>
                                {advisor.status}
                            </div>
                        </div>

                        {/* Details Column */}
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h3 className="text-xl font-bold text-black flex items-center gap-2">
                                        {advisor.name}
                                        <Award className="w-4 h-4 text-black" />
                                    </h3>
                                    <p className="text-gray-600 text-sm">{advisor.role}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-500">{advisor.rating}</span>
                                    <span className="text-xs text-gray-600 ml-1">({advisor.reviews})</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 mt-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-600/60" />
                                    {advisor.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Award className="w-4 h-4 text-gray-600/60" />
                                    {advisor.experience} Exp.
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {advisor.expertise.map((skill, idx) => (
                                        <span key={idx} className="text-xs font-medium text-black bg-brand-blue/10 px-2 py-1 rounded-md border border-brand-blue/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" /> Book Consult
                                </button>
                                <button className="btn-secondary px-4">
                                    <Mail className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="mt-1 bg-brand-blue/20 p-2 rounded-full hidden md:block">
                    <InfoIcon />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-black mb-1">Why do I need a professional?</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        While our AI-generated Dispute Letters are designed to be highly effective, some hospitals may still refuse to negotiate heavily padded bills. In these scenarios, escalating the matter to a verified Consumer Court advocate or bringing in a Medical Auditor to speak directly to the hospital's billing department dramatically increases your chances of a successful refund.
                    </p>
                </div>
            </div>
        </div>
    );
}

function InfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
        </svg>
    )
}
