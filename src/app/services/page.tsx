"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { WildCTA } from '@/components/ui/WildCTA';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getServicesContent } from '@/lib/firebase/services';
import { translateServices } from '@/lib/translations';

const FALLBACK_CONTENT = {
  heroTitle: "Services",
  heroTitle_ha: "Ayyukanmu",
  heroSubtitle: "What We Do",
  heroSubtitle_ha: "Abubuwan da Wild Hausa Ke Yi",
  services: [
    {
      title: "Digital Media & Nature Filmmaking",
      title_ha: "Kafofin Yada Labaru da Fina-finai",
      subtitle: "VISUAL STORYTELLING",
      subtitle_ha: "GUDANAR DA LABARI NA HOTO",
      description: "We create visually stunning multimedia assets that tell the story of our natural world.",
      description_ha: "Muna samar da kyawawan fina-finan daji da bidiyoyi na musamman da ke nuna kyawun halittar Arewacin Najeriya.",
      items: [
        "Nature & Wildlife Documentaries: Full-scale production of documentaries focusing on ecosystems, wildlife, and environmental conservation.", 
        "Digital Content Creation: Videos, animations, and graphics tailored for various platforms.", 
        "Conservation Videography: Highlighting sustainability efforts and raising awareness for biodiversity through compelling visual media."
      ],
      items_ha: [
        "Fina-finan Daji da Halitta: Shirya cikakkun fina-finai game da dabbobi da kiyaye muhalli.",
        "Samar da Kafofin Dijital: Bidiyoyi, hotuna, da zane-zane don shafuka daban-daban.",
        "Bidiyon Kiyaye Muhalli: Nuna ayyukan kiyaye dabbobi da wayar da kan al'umma."
      ],
      image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
      cta: "Explore Documentaries",
      cta_ha: "Kalli Fina-finanmu",
      link: "/documentaries"
    },
    {
      title: "Eco-Tourism & Safaris",
      title_ha: "Yawon Bude Ido na Daji & Safaris",
      subtitle: "IMMERSIVE EXPERIENCES",
      subtitle_ha: "YAWON BUDE IDO NA DAJI",
      description: "We provide responsible, guided travel experiences that immerse you in natural and cultural wonders.",
      description_ha: "Muna samar da tafiye-tafiye na yawon bude ido na daji masu aminci karkashin jagorancin kwararru.",
      items: [
        "Guided Safaris: Expert-led wildlife viewing expeditions.", 
        "Eco-Tourism Packages: Sustainable travel tours designed to support local communities and environmental conservation.", 
        "Cultural & Natural Expeditions: Curated trips to breathtaking, off-the-beaten-path destinations."
      ],
      items_ha: [
        "Jagorancin Safari: Tafiyar safari tare da kwararrun guides.",
        "Tsarin Yawon Bude Ido: Tafiye-tafiye masu dorewa don tallafa wa al'ummomin gari.",
        "Kasadar Al'ada da Halitta: Ziyarar wurare masu ban sha'awa da ke boye."
      ],
      image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200",
      cta: "View Safari Packages",
      cta_ha: "Duba Shirye-shiryen Safari",
      link: "/safaris"
    },
    {
      title: "Adventure Parks & Recreation",
      title_ha: "Wuraren Kasada & Wasanni",
      subtitle: "THRILL & LEISURE",
      subtitle_ha: "KASADA DA SHAKATAWA",
      description: "We build and manage facilities designed for thrill-seekers and nature lovers alike.",
      description_ha: "Muna gina da sarrafa wuraren wasanni da aka tsara don masu son kasada da halitta.",
      items: [
        "Adventure Park Operations: Safe, innovative, and eco-friendly outdoor recreation centers.", 
        "Outdoor Fitness & Leisure: Activities designed to promote physical well-being and a love for the outdoors."
      ],
      items_ha: [
        "Ayyukan Wurin Kasada: Wuraren wasannin kasada masu aminci a sararin samaniya.",
        "Motsa Jiki da Shakatawa: Ayyukan motsa jiki da ke inganta lafiya a cikin daji."
      ],
      image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200",
      cta: "Visit Adventure Park",
      cta_ha: "Ziyarci Wurin Kasada",
      link: "/adventure-park"
    },
    {
      title: "Zoological & Conservation Facilities",
      title_ha: "Kiyaye Muhalli & Gidajen Dabbobi",
      subtitle: "WILDLIFE PRESERVATION",
      subtitle_ha: "KIYAYE DABBOBIN DAJI",
      description: "We are committed to the protection and study of wildlife through hands-on facility management.",
      description_ha: "Muna sadaukar da kanmu don karewa da nazarin dabbobin daji ta hanyar lura da gidajen dabbobi.",
      items: [
        "Zoological Gardens: Establishing and operating animal parks that prioritize animal welfare and natural habitats.", 
        "Educational Conservation: Using our physical parks as educational hubs to teach the public about wildlife preservation."
      ],
      items_ha: [
        "Gidajen Dabbobi: Gina da lura da wuraren dabbobi da ke ba da fifiko ga jin dadinsu.",
        "Ilimin Kiyaye Daji: Amfani da wurarenmu don koya wa jama'a kiyaye dabbobi."
      ],
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200",
      cta: "Join the Conservation Circle",
      cta_ha: "Shiga Masu Kare Daji",
      link: "/conservation"
    }
  ]
};

export default function ServicesPage() {
  const { language, t } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getServicesContent();
        if (data && Object.keys(data).length > 0) {
          setContent(data);
        } else {
          setContent(FALLBACK_CONTENT);
        }
      } catch (error) {
        console.error('Failed to load services content:', error);
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
        <p className="text-wild-forest font-serif font-bold text-lg">{t('services_loading', 'Loading services...')}</p>
      </div>
    );
  }

  const translatedContent = translateServices(content, language) || FALLBACK_CONTENT;

  return (
    <div className="flex flex-col min-h-screen bg-wild-cream">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-wild-sand text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl text-wild-forest font-bold mb-6">{translatedContent.heroTitle}</h1>
          <p className="text-xl text-wild-muted font-sans leading-relaxed whitespace-pre-line">
            {translatedContent.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 px-6 lg:px-12 bg-wild-cream">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {translatedContent.services?.map((service: any, index: number) => (
              <ServiceCard 
                key={index}
                title={service.title}
                subtitle={service.subtitle}
                description={service.description}
                items={service.items || []}
                image={service.image}
                cta={service.cta}
                link={service.link}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ title, subtitle, description, items, image, cta, link }: any) {
  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-wild-forest/5 hover:border-wild-sunset/20 transition-all duration-500 transform hover:-translate-y-2">
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-wild-sand shrink-0">
        {image && (
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wild-forest/20 via-transparent to-transparent opacity-80" />
      </div>
      
      {/* Card Body */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Subtitle / Tagline */}
        <span className="text-[10px] tracking-wider font-bold font-sans uppercase text-wild-sunset mb-2 block">
          {subtitle}
        </span>
        
        {/* Title */}
        <h3 className="font-serif text-lg font-bold text-wild-forest mb-3 leading-tight group-hover:text-wild-sunset transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-wild-forest/75 text-sm leading-relaxed mb-5 font-sans">
          {description}
        </p>
        
        {/* Bullet items */}
        {items && items.length > 0 && (
          <ul className="space-y-3 mb-6 border-t border-wild-forest/5 pt-5">
            {items.map((item: string, idx: number) => {
              // Clean item if it has bold prefix or colon
              const parts = item.split(': ');
              const hasHeader = parts.length > 1;
              return (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-wild-forest/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-wild-sunset mt-1.5 shrink-0" />
                  <span className="leading-relaxed">
                    {hasHeader ? (
                      <>
                        <strong className="font-semibold text-wild-forest">{parts[0]}:</strong>{' '}
                        {parts.slice(1).join(': ')}
                      </>
                    ) : (
                      item
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        
        {/* CTA Button */}
        <div className="mt-auto pt-2">
          <WildCTA variant="primary" href={link} className="w-full text-center">
            {cta}
          </WildCTA>
        </div>
      </div>
    </div>
  );
}
