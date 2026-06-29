"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { SafariRingBadge } from '@/components/ui/SafariRingBadge';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getAboutContent } from '@/lib/firebase/services';
import { translateAbout } from '@/lib/translations';

import { Footprints, Users, Binoculars, BookOpen, Sprout, FlaskConical, Leaf, X } from 'lucide-react';

const FALLBACK_CONTENT = {
  heroTitle: "About Us",
  heroSubtitle: "Wild Hausa is a dynamic, multi-disciplinary company dedicated to celebrating and preserving the natural world. We bridge the gap between immersive outdoor experiences and captivating digital storytelling.",
  heroImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=2000",
  missionTitle: "Our Mission",
  missionSubtitle: "A PURPOSE-DRIVEN EXPEDITION",
  missionP1: "Our mission is to promote environmental conservation, biodiversity, and sustainable living through high-quality nature documentaries, responsible eco-tourism, and engaging outdoor recreation facilities.",
  missionP2: "Whether we are capturing the breathtaking beauty of wildlife on camera or guiding adventurers through unforgettable safaris, Wild Hausa brings people closer to nature.",
  missionImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000",
  principlesTitle: "Our Field Principles",
  principles: [
    { title: "Leave No Trace", text: "We strictly adhere to zero-impact eco-tourism standards." },
    { title: "Community First", text: "Local communities are our primary conservation partners." },
    { title: "Ethical Wildlife Viewing", text: "We prioritize animal welfare over photo opportunities." },
    { title: "Deep Education", text: "Every expedition is a moving classroom about ecology." },
    { title: "Sustainable Logistics", text: "From solar-powered camps to minimal plastic use." },
    { title: "Scientific Support", text: "A percentage of our revenue funds ecological research." },
  ],
  foundersTitle: "Meet the Founders",
  founders: [
    {
      name: "Founder Name",
      role: "Co-Founder & Director",
      bio: "Founder biography goes here detailing their background, passion, and role at Wild Hausa.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

const getPrincipleIcon = (index: number) => {
  const icons = [
    <Footprints key="0" size={20} />,
    <Users key="1" size={20} />,
    <Binoculars key="2" size={20} />,
    <BookOpen key="3" size={20} />,
    <Sprout key="4" size={20} />,
    <FlaskConical key="5" size={20} />,
  ];
  return icons[index] || <Leaf key="fallback" size={20} />;
};

export default function AboutPage() {
  const { language, t, settings } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFounder, setActiveFounder] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAboutContent();
        if (data && Object.keys(data).length > 0) {
          setContent(data);
        } else {
          setContent(FALLBACK_CONTENT);
        }
      } catch (error) {
        console.error('Failed to load about content:', error);
        setContent(FALLBACK_CONTENT);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-wild-cream items-center justify-center">
        <div className="w-12 h-12 border-4 border-wild-sunset border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-wild-forest font-serif font-bold text-lg">{t('about_loading', 'Loading story...')}</p>
      </div>
    );
  }

  const translatedContent = translateAbout(content, language) || FALLBACK_CONTENT;

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-wild-deep-forest text-wild-cream overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("${settings?.hero_images?.about || translatedContent.heroImage || FALLBACK_CONTENT.heroImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative z-10 container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6">{translatedContent.heroTitle}</h1>
            <p className="text-xl text-wild-sand/90 font-sans leading-relaxed whitespace-pre-line">
              {translatedContent.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <WildSectionHeader title={translatedContent.missionTitle} subtitle={translatedContent.missionSubtitle} />
            <p className="text-wild-forest/80 text-lg mb-6 leading-relaxed whitespace-pre-line">
              {translatedContent.missionP1}
            </p>
            {translatedContent.missionP2 && (
              <p className="text-wild-forest/80 text-lg leading-relaxed whitespace-pre-line">
                {translatedContent.missionP2}
              </p>
            )}
          </div>
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image src={translatedContent.missionImage || FALLBACK_CONTENT.missionImage} alt={translatedContent.missionTitle} fill className="object-cover" />
            <div className="absolute inset-0 bg-wild-forest/10" />
            <SafariRingBadge size="md" className="absolute -bottom-6 -left-6 border-wild-sunset bg-wild-cream" />
          </div>
        </div>
      </section>

      {/* Field Principles */}
      <section className="py-24 bg-wild-sand">
        <div className="container mx-auto px-6 lg:px-12">
          <WildSectionHeader title={translatedContent.principlesTitle} centered />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
            {translatedContent.principles?.map((principle: any, idx: number) => (
              <PrincipleCard 
                key={idx} 
                title={principle.title} 
                text={principle.text} 
                icon={getPrincipleIcon(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      {translatedContent.founders && translatedContent.founders.length > 0 && (
        <section className="py-24 container mx-auto px-6 lg:px-12">
          <WildSectionHeader 
            title={translatedContent.foundersTitle || t('about_founders_title', 'Meet the Founders')} 
            centered 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16 max-w-6xl mx-auto justify-center">
            {translatedContent.founders.map((founder: any, idx: number) => {
              const bioLimit = 160;
              const isLongBio = founder.bio && founder.bio.length > bioLimit;
              const displayBio = isLongBio ? `${founder.bio.substring(0, bioLimit)}...` : founder.bio;

              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-wild-cream hover:border-wild-sunset/20 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
                >
                  {founder.image && (
                    <div className="relative h-[320px] w-full overflow-hidden shrink-0">
                      <Image 
                        src={founder.image} 
                        alt={founder.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-wild-forest/40 via-transparent to-transparent opacity-80" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <span className="text-wild-sunset font-sans font-bold text-xs uppercase tracking-widest mb-1">
                      {founder.role}
                    </span>
                    <h3 className="font-serif text-2xl text-wild-forest font-bold mb-4">
                      {founder.name}
                    </h3>
                    <p className="text-wild-muted text-sm leading-relaxed whitespace-pre-line flex-1">
                      {displayBio}
                    </p>
                    {isLongBio && (
                      <button 
                        onClick={() => setActiveFounder(founder)} 
                        className="text-wild-sunset font-sans font-bold text-xs uppercase tracking-wider mt-4 hover:text-[#FF8C42] cursor-pointer text-left block w-fit"
                      >
                        {t('read_more', 'Read More →')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Founder Full Bio Modal/Overlay */}
      {activeFounder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-wild-forest/80 backdrop-blur-md transition-opacity duration-300">
          <div className="relative w-full max-w-4xl bg-wild-cream rounded-3xl overflow-hidden shadow-2xl border border-wild-cream flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
            <button 
              onClick={() => setActiveFounder(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-wild-forest hover:text-wild-sunset flex items-center justify-center transition-all shadow-md cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Photo Column */}
            {activeFounder.image && (
              <div className="relative h-[250px] md:h-auto md:w-2/5 shrink-0 overflow-hidden">
                <Image 
                  src={activeFounder.image} 
                  alt={activeFounder.name} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-wild-forest/20 via-transparent to-transparent" />
              </div>
            )}

            {/* Biography Details Column */}
            <div className="p-8 md:p-12 flex flex-col flex-1 overflow-hidden">
              <span className="text-wild-sunset font-sans font-bold text-xs uppercase tracking-widest mb-1 shrink-0">
                {activeFounder.role}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-wild-forest font-bold mb-6 shrink-0">
                {activeFounder.name}
              </h3>
              <div className="text-wild-forest/80 text-base leading-relaxed whitespace-pre-line overflow-y-auto pr-2">
                {activeFounder.bio}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-4xl text-wild-forest font-bold mb-6">{t('about_ready_join')}</h2>
        <WildCTA variant="primary" href="/contact">{t('final_btn_partner')}</WildCTA>
      </section>
    </div>
  );
}

function PrincipleCard({ title, text, icon }: { title: string, text: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-wild-cream hover:shadow-md hover:border-wild-sunset/20 transition-all duration-300 h-full flex flex-col justify-start">
      <div className="w-10 h-10 rounded-xl bg-wild-sunset/10 flex items-center justify-center mb-4 text-wild-sunset shrink-0">
        {icon}
      </div>
      <h3 className="font-serif text-lg md:text-xl text-wild-forest font-bold mb-2">{title}</h3>
      <p className="text-wild-muted text-sm leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}
