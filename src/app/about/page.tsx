"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildSectionHeader } from '@/components/ui/WildSectionHeader';
import { WildCTA } from '@/components/ui/WildCTA';
import { SafariRingBadge } from '@/components/ui/SafariRingBadge';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getAboutContent } from '@/lib/firebase/services';
import { translateAbout } from '@/lib/translations';

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
  ]
};

export default function AboutPage() {
  const { language, t } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          backgroundImage: `url("${translatedContent.heroImage || FALLBACK_CONTENT.heroImage}")`,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {translatedContent.principles?.map((principle: any, idx: number) => (
              <PrincipleCard key={idx} title={principle.title} text={principle.text} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <h2 className="font-serif text-4xl text-wild-forest font-bold mb-6">{t('about_ready_join')}</h2>
        <WildCTA variant="primary" href="/contact">{t('final_btn_partner')}</WildCTA>
      </section>
    </div>
  );
}

function PrincipleCard({ title, text }: { title: string, text: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-wild-sand/50 hover:shadow-md transition-shadow h-full">
      <div className="w-12 h-12 rounded-full border-2 border-wild-sunset flex items-center justify-center mb-6">
        <div className="w-2 h-2 rounded-full bg-wild-sunset" />
      </div>
      <h3 className="font-serif text-2xl text-wild-forest font-bold mb-3">{title}</h3>
      <p className="text-wild-muted leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  );
}
