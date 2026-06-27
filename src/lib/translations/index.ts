export type Language = 'en' | 'ha';

export interface TranslationDict {
  en: string;
  ha: string;
}

export const translations: Record<string, TranslationDict> = {
  // Navigation
  home: { en: "Home", ha: "Gida" },
  price_on_request: { en: "Price on request", ha: "Nemi Farashi" },
  our_story: { en: "Our Story", ha: "Tarihinmu" },
  worlds: { en: "Services", ha: "Ayyukanmu" },
  expeditions: { en: "Expeditions", ha: "Tafiye-tafiye" },
  films: { en: "Nature Media", ha: "Kafofin Yada Labaran Halitta" },
  map: { en: "Map", ha: "Taswira" },
  field_journal: { en: "Projects", ha: "Ayyukanmu" },
  plan_journey: { en: "Get In Touch", ha: "Tuntube Mu" },
  contact_us: { en: "Contact Us", ha: "Tuntube Mu" },

  // Hero Section
  hero_badge: { en: "DUNIYAR DABBOBIN DAJI", ha: "DUNIYAR DABBOBIN DAJI" },
  hero_title_1: { en: "Explore Majestic", ha: "Bincika Kyawawan" },
  hero_title_2: { en: "Creatures With Us", ha: "Halittu Tare da Mu" },
  hero_subtitle: {
    en: "Experience the untamed beauty of the wilderness. Join our premium guided safaris, witness exclusive wildlife documentaries, and become part of our conservation journey.",
    ha: "Kuyi amfani da damar ganin kyawun daji. Kasance tare da mu a shirin tafiya daji na musamman, kallon bidiyon dabbobin daji, kuma ku taimaka wajen kare su."
  },
  hero_location: { en: "Location", ha: "Wuri" },
  hero_location_placeholder: { en: "Where to next?", ha: "Ina za a gaba?" },
  hero_date: { en: "Date", ha: "Kwanan Wata" },
  hero_date_placeholder: { en: "Select dates", ha: "Zabi kwanan wata" },
  hero_find_safari: { en: "Find Safari", ha: "Nemi Safari" },

  // Mission Strip
  mission_conservation: { en: "Conservation", ha: "Kiyayewa" },
  mission_ecotourism: { en: "Eco-Tourism", ha: "Yawon Bude Ido na Halitta" },
  mission_media: { en: "Nature Media", ha: "Kafofin Yada Labaran Halitta" },
  mission_adventure: { en: "Adventure Recreation", ha: "Wasannin Kasada" },
  mission_education: { en: "Wildlife Education", ha: "Ilimin Dabbobin Daji" },

  // Worlds Section
  worlds_title: { en: "The Worlds of Wild Hausa", ha: "Sassan Wild Hausa" },
  worlds_subtitle: {
    en: "Discover our unique blend of nature filmmaking, eco-tourism, outdoor adventure, and conservation.",
    ha: "Gano hadin gwiwarmu na musamman na daukar fim din halitta, yawon bude ido na daji, wasannin kasada, da kiyaye muhalli."
  },
  film_the_wild: { en: "Film the Wild", ha: "Dauki Fim din Daji" },
  journey_the_wild: { en: "Journey the Wild", ha: "Tafiya Daji" },
  play_in_the_wild: { en: "Play in the Wild", ha: "Wasa a Daji" },
  protect_the_wild: { en: "Protect the Wild", ha: "Kare Daji" },
  teach_the_wild: { en: "Teach the Wild", ha: "Koyar da Daji" },
  film_desc: { en: "Cinematic storytelling bringing the untamed beauty of Northern Nigeria to the world.", ha: "Hada fina-finan musamman masu nuna kyawun halittar Arewacin Najeriya ga duniya." },
  journey_desc: { en: "Guided safaris and expeditions into the heart of the savanna and deep forests.", ha: "Ziyara ta musamman zuwa tsakiyar yankunan daji da manyan dazuzzuka." },
  play_desc: { en: "Outdoor recreation, nature trails, and challenges designed for all ages.", ha: "Wasannin motsa jiki a fili, hanyoyin yawo a daji, da kalubale ga kowane shekaru." },
  protect_desc: { en: "Active efforts to preserve habitats, protect wildlife, and educate communities.", ha: "Ayyukan kare muhalli, kare dabbobin daji, da ilimantar da al'ummomi." },
  teach_desc: { en: "We believe in empowering the next generation. Our educational programs take students into nature.", ha: "Muna goyon bayan matasa ta hanyar shirin ilimi wanda ke karkatar da su zuwa ga halitta." },

  // Worlds / Services page details
  services_hero_title: { en: "Our Wild Worlds", ha: "Duniya Daban-daban na Wild Hausa" },
  services_hero_subtitle: {
    en: "Wild Hausa operates across five distinct domains, all united by a single purpose: bringing people closer to nature.",
    ha: "Wild Hausa na gudanar da ayyukansa a fannoni biyar mabanbanta, wadanda ke da manufa daya: kusantar da mutane ga halitta."
  },
  services_explore_docs: { en: "Explore Our Documentaries", ha: "Kalli Fina-finanmu na Daji" },
  services_view_packages: { en: "View Safari Packages", ha: "Duba Shirye-shiryen Safari" },
  services_visit_park: { en: "Visit the Adventure Park", ha: "Ziyarci Wurin Kasada" },
  services_join_circle: { en: "Join the Conservation Circle", ha: "Shiga Masu Kare Daji" },
  services_plan_school: { en: "Plan a School Expedition", ha: "Shirya Ziyara ta Makarantu" },
  
  services_subtitle_1: { en: "Digital Media & Nature Filmmaking", ha: "Kafofin Yada Labaru da Fina-finai" },
  services_desc_1: { en: "We produce high-quality, cinematic nature documentaries and digital content that capture the breathtaking beauty and harsh realities of the African savanna. Our media team ventures deep into the wild to tell stories that inspire conservation and awe.", ha: "Muna samar da kyawawan fina-finan daji da bidiyoyi na musamman da ke nuna kyawun daji da kuma yadda rayuwar dabbobi take a daji na Arewacin Najeriya." },
  services_items_1_0: { en: 'Documentary Production', ha: 'Shirin Fina-finan Daji' },
  services_items_1_1: { en: 'Wildlife Photography', ha: 'Daukar Hoton Dabbobi' },
  services_items_1_2: { en: 'Field Media Training', ha: 'Horon Daukar Hoton Daji' },
  services_items_1_3: { en: 'Conservation Campaigns', ha: 'Yakin Neman Kare Muhalli' },
  
  services_subtitle_2: { en: "Eco-Tourism & Safaris", ha: "Yawon Bude Ido na Daji & Safaris" },
  services_desc_2: { en: "Experience the thrill of the African bush with our expertly guided safaris. We offer tailored expeditions that range from family-friendly tours to rugged, multi-day treks for seasoned adventurers and researchers.", ha: "Kuyi amfani da damar shiga daji tare da guides dinmu. Muna ba da shirin safari da ya dace da iyalai ko kwararrun masu kasada da bincike." },
  services_items_2_0: { en: 'Guided Safari Routes', ha: 'Hanyoyin Safari na Musamman' },
  services_items_2_1: { en: 'Custom Expeditions', ha: 'Shirye-shirye na Musamman' },
  services_items_2_2: { en: 'Photographic Safaris', ha: 'Safari na Masu Daukar Hoto' },
  services_items_2_3: { en: 'Cultural Excursions', ha: 'Yawon Bude Ido na Al\'ada' },
  
  services_subtitle_3: { en: "Adventure Parks & Recreation", ha: "Wuraren Kasada & Wasanni", },
  services_desc_3: { en: "For those seeking adrenaline and outdoor fun, our adventure parks offer a safe yet exhilarating environment. Perfect for family weekends, school trips, and corporate team building.", ha: "Ga masu son wasannin motsa jiki da na kasada, wuraren kasadanmu na ba da kyakkyawan yanayi mai aminci. Sun dace da iyalai, makarantu, da kamfanoni." },
  services_items_3_0: { en: 'Nature Trails', ha: 'Hanyoyin Tafiya a Halitta' },
  services_items_3_1: { en: 'Obstacle Courses', ha: 'Wasan Kalubale na Kasada' },
  services_items_3_2: { en: 'Camping Grounds', ha: 'Wuraren Kafa Tanti' },
  services_items_3_3: { en: 'Team Building Retreats', ha: 'Hadin Gwiwar Kamfani' },
  
  services_subtitle_4: { en: "Conservation & Zoological Facilities", ha: "Kiyaye Muhalli & Gidajen Dabbobi" },
  services_desc_4: { en: "Conservation is at the heart of what we do. We manage and partner with facilities dedicated to the protection of endangered species, habitat restoration, and anti-poaching initiatives.", ha: "Kiyayewa ita ce jigon aikinmu. Muna aiki tare da wuraren da ke da alhakin kare dabbobi masu hatsarin karewa da kama mafarauta." },
  services_items_4_0: { en: 'Wildlife Rescue', ha: 'Ceton Dabbobin Daji' },
  services_items_4_1: { en: 'Habitat Restoration', ha: 'Gyara Muhallin Halitta' },
  services_items_4_2: { en: 'Anti-Poaching Support', ha: 'Taimakawa Yaki da Mafarauta' },
  services_items_4_3: { en: 'Research Partnerships', ha: 'Hadin Gwiwar Bincike' },
  
  services_subtitle_5: { en: "Conservation Education", ha: "Ilimin Kare Muhalli" },
  services_desc_5: { en: "We believe in empowering the next generation. Our educational programs take students out of the classroom and into nature, fostering a lifelong respect for the environment.", ha: "Muna tallafa wa matasa don koyan kiyaye daji ta hanyar shirin ilimi da ke karkatar da su daga aji zuwa can tsakiyar daji." },
  services_items_5_0: { en: 'School Excursions', ha: 'Ziyarar Makarantu' },
  services_items_5_1: { en: 'Wildlife Workshops', ha: 'Horon Ilimin Dabbobi' },
  services_items_5_2: { en: 'Community Outreach', ha: 'Wayar da Kan Al\'umma' },
  services_items_5_3: { en: 'Field Guide Training', ha: 'Horon Masu Jagoranci' },

  // Featured Expeditions
  featured_title: { en: "Featured Expeditions", ha: "Fitattun Tafiye-tafiye" },
  featured_subtitle: { en: "Carefully crafted safari routes for families, schools, and adventurers.", ha: "Tafiyar daji na musamman da aka tsara don iyalai, makarantu, da masu kasada." },
  view_all_routes: { en: "View All Safari Routes", ha: "Duba Duk Hanyoyin Tafiya" },
  starting_from: { en: "Starting from", ha: "Fara daga" },
  explore_world: { en: "Explore World", ha: "Binciki Wannan Bangare" },
  view_safari_details: { en: "View Safari Details", ha: "Duba Cikakken Bayanin Safari" },

  // Stories From the Wild
  stories_title: { en: "Stories From the Wild", ha: "Labaran Daji" },
  stories_subtitle: {
    en: "Immerse yourself in our cinematic nature films documenting the hidden wonders of the Sahel and savanna.",
    ha: "Kalli fina-finanmu na cinematic masu nuna boyayyun abubuwan al'ajabi na Sahel da daji."
  },
  enter_doc_room: { en: "Enter Documentary Room", ha: "Shiga Dakin Fina-finai" },
  rec_badge: { en: "REC", ha: "DAUKAR HOTO" },
  field_recording: { en: "Field Recording", ha: "Dauka Daga Daji" },

  // Classroom
  classroom_badge: { en: "Field Notes", ha: "Bayanin Daji" },
  classroom_title: { en: "Conservation Classroom", ha: "Koyar da Kiyaye Muhalli" },
  classroom_p1: {
    en: "",
    ha: ""
  },
  classroom_p2: {
    en: "Join our educational programmes designed for schools, universities, and communities to learn about habitat preservation, wildlife conservation, and co-existence.",
    ha: "Shiga shirye-shiryenmu na ilimi da aka tsara don makarantu, jami'o'i, da al'ummomi don koyon kiyaye muhalli, kiyaye dabbobin daji, da kuma zama tare lafiya."
  },
  btn_school: { en: "School Programmes", ha: "Shirye-shiryen Makarantu" },
  btn_volunteer: { en: "Volunteer With Us", ha: "Taimaka Mana" },

  // Subscription Card
  subscribe_title: { en: "Join Our Newsletter", ha: "Yi rajista don samun labaranmu" },
  subscribe_subtitle: { en: "Receive field notes, stories, and exclusive reports.", ha: "Sami rahotannin daji, labarai, da kuma rahotanni na musamman." },
  email_placeholder: { en: "Your Email Address", ha: "Adireshin E-mail Dinku" },
  subscribe_btn: { en: "Subscribe to Field Notes", ha: "Yi Rajista Don Labaran Daji" },

  // Final CTA
  final_title: { en: "Your next journey can protect the wild.", ha: "Tafiyarku ta gaba na iya kare daji." },
  final_btn_plan: { en: "Plan an Expedition", ha: "Shirya Tafiya Daji" },
  final_btn_partner: { en: "Partner With Us", ha: "Hadin Gwiwa Da Mu" },

  // Newsletter
  subscribe_success: { en: "Subscribed successfully!", ha: "An yi rajista cikin nasara!" },
  subscribe_error: { en: "Failed to subscribe. Please try again.", ha: "An gaza yin rajista. Da fatan za a sake gwadawa." },
  wild_hausa: { en: "Wild Hausa", ha: "Wild Hausa" },


  // Footer
  footer_tagline: {
    en: "Bringing people closer to nature through filmmaking, eco-tourism, and active wildlife conservation.",
    ha: "Kusantar da mutane ga halitta ta hanyar shirya fina-finai, yawon bude ido, da kiyaye dabbobin daji."
  },
  footer_rights: { en: "© 2026 All Rights Reserve. Wild Hausa.", ha: "© 2026 Duk hakkoki mallaka ne. Wild Hausa." },
  designed_by: { en: "Designed by IBK Technologies", ha: "Tsarin IBK Technologies" },
  footer_quick_links: { en: "Quick Links", ha: "Hanyoyi Masu Sauri" },
  footer_legal: { en: "Legal", ha: "Shari'a" },
  footer_privacy: { en: "Privacy Policy", ha: "Tsarin Tsare Sirri" },
  footer_terms: { en: "Terms of Service", ha: "Sharuddan Amfani" },

  // About Page
  about_hero_title: { en: "The Wild Hausa Story", ha: "Tarihin Wild Hausa" },
  about_hero_subtitle: {
    en: "Born from a deep respect for Northern Nigeria's untamed landscapes, Wild Hausa exists to connect people with nature through authentic expeditions, compelling storytelling, and relentless conservation.",
    ha: "An haife shi daga babban girmamawa ga yankunan daji na Arewacin Najeriya. Wild Hausa ya kasance don kusantar da mutane ga halitta ta hanyar tafiye-tafiye na gaskiya."
  },
  about_mission_title: { en: "Our Mission", ha: "Manufarmu" },
  about_mission_subtitle: {
    en: "To inspire a global appreciation for African wildlife while actively protecting it for future generations.",
    ha: "Don zaburar da duniya don son dabbobin daji na Afirka yayin da muke kare su don al'ummomi masu zuwa."
  },
  about_mission_p1: {
    en: "We believe that you cannot protect what you do not love, and you cannot love what you do not know. Through our safaris, documentaries, and adventure parks, we aim to bridge the gap between humanity and the wild.",
    ha: "Mun yi amanna cewa ba za ka iya kare abin da ba ka so ba, kuma ba za ka iya son abin da ba ka sani ba. Muna son daidaita alaka tsakanin bil'adama da daji."
  },
  about_mission_p2: {
    en: "Every expedition we guide and every film we produce contributes directly to the conservation of habitats and the support of local communities who serve as the true guardians of the land.",
    ha: "Kowace tafiya da muke jagoranta da kowane fim da muke samarwa yana taimakawa kai tsaye wajen kiyaye muhalli da tallafawa al'ummar gari."
  },
  about_principles_title: { en: "Our Field Principles", ha: "Ka'idodin Aikinmu na Daji" },
  about_ready_join: { en: "Ready to join our journey?", ha: "Kun shirya shiga tafiyarmu?" },

  // Principle Cards
  principle_1_title: { en: "Protect the Habitat", ha: "Kare Muhallin" },
  principle_1_text: { en: "We leave no trace, ensuring that our presence preserves the natural balance of the ecosystems we visit.", ha: "Ba ma barin kowane datti, muna tabbatar da cewa kasancewarmu yana kiyaye daidaiton halitta." },
  principle_2_title: { en: "Respect the Wildlife", ha: "Girmama Dabbobin" },
  principle_2_text: { en: "We observe from a distance, prioritizing the safety and natural behavior of the animals over perfect photographs.", ha: "Muna kallo ne daga nesa, muna ba da fifiko ga lafiyar dabbobi fiye da daukar hoto." },
  principle_3_title: { en: "Guide With Safety", ha: "Jagora Tare da Tsaro" },
  principle_3_text: { en: "Our expeditions are led by seasoned experts who understand the terrain, the wildlife, and the importance of secure travel.", ha: "Kwararrun guides ne ke jagorantar tafiyarmu wadanda suka san yanayin daji da aminci." },
  principle_4_title: { en: "Teach Through Experience", ha: "Koyarwa Ta Hanyar Ziyara" },
  principle_4_text: { en: "We believe the best classroom is the wild itself. Our programs are designed to educate through immersion.", ha: "Mun yi imani dakin karatu mafi kyau shine daji da kansa. Shirye-shiryenmu suna ilimantarwa ne ta ziyara." },
  principle_5_title: { en: "Tell Authentic Stories", ha: "Fada Labaran Gaskiya" },
  principle_5_text: { en: "Our documentaries capture the raw, unscripted reality of nature, free from artificial dramatization.", ha: "Fina-finanmu suna nuna ainihin gaskiyar daji ne, ba tare da wani karya ba." },
  principle_6_title: { en: "Support Local Communities", ha: "Taimaka wa Al'ummar Gari", },
  principle_6_text: { en: "We partner with indigenous communities, ensuring that eco-tourism provides sustainable livelihoods.", ha: "Muna abota da al'ummar gari don tabbatar da cewa yawon bude ido na samar musu da hanyar dogaro da kai." },

  // Safaris page
  safaris_hero_title: { en: "Safari Routes & Expeditions", ha: "Shirye-shiryen Tafiya & Safari" },
  safaris_hero_subtitle: { en: "Find the perfect wild journey. From family day-trips to deep savanna treks.", ha: "Nemi cikakkiyar tafiya. Daga tafiyar iyali ta rana daya zuwa tafiya mai nisa a daji." },
  filter_routes: { en: "Filter Routes:", ha: "Tace Hanyoyin Tafiya:" },
  filter_all: { en: "All Expeditions", ha: "Duk Tafiye-tafiye" },
  filter_family: { en: "Family Friendly", ha: "Sauki da Iyalai" },
  filter_advanced: { en: "Advanced Trek", ha: "Tafiya Mai Nisa" },
  filter_photography: { en: "Photography", ha: "Daukar Hoto" },
  no_safaris_matching: { en: "No safaris matching this filter.", ha: "Babu safaris da suka dace da wannan tace." },
  safari_duration: { en: "Duration:", ha: "Tsawon Lokaci:" },
  safari_difficulty: { en: "Difficulty:", ha: "Wuyar Tafiya:" },
  safari_best_for: { en: "Best For:", ha: "Mafi Dace Da:" },

  // Safari Details page
  details_loading: { en: "Gathering expedition details...", ha: "Ana tattara bayanan tafiya..." },
  details_not_found: { en: "Expedition Not Found", ha: "Ba a Sami Wannan Tafiya Ba" },
  details_not_found_desc: { en: "We couldn't find the safari route you are looking for. It may have been updated or removed.", ha: "Ba mu sami hanyar safari da kuke nema ba. Wataƙila an sabunta ko an cire ta." },
  details_back_btn: { en: "Back to All Safaris", ha: "Koma Ga Duk Safaris" },
  details_overview: { en: "Expedition Overview", ha: "Bayanin Tafiya" },
  details_difficulty: { en: "Difficulty", ha: "Wuyar Tafiya" },
  details_group_size: { en: "Group Size", ha: "Adadin Mutane" },
  details_best_time: { en: "Best Time", ha: "Mafi Kyawun Lokaci" },
  details_starting_price: { en: "Starting Price", ha: "Farashin Farawa" },
  details_itinerary_title: { en: "Route & Itinerary", ha: "Shirye-shiryen Hanyar Tafiya" },
  details_safety_notes: { en: "Safety & Field Notes", ha: "Bayanin Tsaro da Aiki" },
  details_safety_p: {
    en: "This expedition requires adherence to park rules. All our groups are accompanied by armed park rangers and certified Wilderness First Responders where appropriate.",
    ha: "Wannan tafiya na bukatar bin dokokin gidan gandu. Dukkan rukunoninmu suna tare da kwararrun jami'an tsaro da masu ba da taimakon gaggawa."
  },
  details_incl_1: { en: "Ground transport included", ha: "Akwai motar sufuri" },
  details_incl_2: { en: "Guided tracking session", ha: "Jagorancin bin sawu" },
  details_incl_3: { en: "Park entrance fees covered", ha: "Kudin shiga gidan gandu" },
  details_incl_4: { en: "Professional local guide", ha: "Kwararren mai nuna hanya" },
  
  // Booking sidebar
  book_this_safari: { en: "Book This Safari", ha: "Yi Rajistar Wannan Safari" },
  book_desc: { en: "Select your dates to request a booking. Our expedition planners will contact you to confirm.", ha: "Zabi ranakun ku don neman rajista. Masu tsara tafiyarmu za su tuntube ku." },
  book_start_date: { en: "Start Date", ha: "Ranar Fara Tafiya" },
  book_guests: { en: "Number of Guests", ha: "Adadin Masu Ziyara" },
  book_guests_1: { en: "1 Explorer", ha: "Mai Ziyara 1" },
  book_guests_2: { en: "2 Explorers", ha: "Masu Ziyara 2" },
  book_guests_3_5: { en: "3 - 5 Explorers", ha: "Masu Ziyara 3 - 5" },
  book_guests_6: { en: "Group (6+)", ha: "Rukuni (6+)" },
  book_est_total: { en: "Estimated Total", ha: "Kiyasin Kudin Tafiya" },
  book_req_btn: { en: "Request Booking", ha: "Nemi Rajista" },
  book_no_payment: { en: "No payment required until confirmation.", ha: "Ba a bukatar biya har sai an tabbatar." },
  book_success_title: { en: "Booking Request Sent!", ha: "An Aika da Bukatar Rajista!" },
  book_success_p: { en: "We have received your request. We will contact you soon.", ha: "Mun sami bukatar ku. Za mu tuntube ku nan ba da jimawa ba." },
  book_modify_btn: { en: "Modify Request", ha: "Gyara Bukata" },
  book_custom_title: { en: "Need a custom route?", ha: "Kuna son tsarin tafiya na musamman?" },
  book_custom_p: { en: "We can tailor this expedition for researchers, film crews, or private groups.", ha: "Za mu iya tsara wannan tafiyar musamman ga masu bincike, masu daukar hoto, ko kungiyoyi." },
  book_contact_guides: { en: "Contact our guides", ha: "Tuntubi guides dinmu" },

  // Documentaries page
  docs_hero_title: { en: "Nature Media", ha: "Kafofin Yada Labaran Halitta" },
  docs_hero_subtitle: { en: "Explore our territories, track our expeditions, and discover the wild spaces.", ha: "Bincika yankunanmu, bi sahun tafiye-tafiyenmu, kuma gano filayen daji." },
  docs_categories: { en: "Categories:", ha: "Rukunoni:" },
  docs_all_films: { en: "All Media", ha: "Duk Kafofi" },
  docs_cat_wildlife: { en: "Wildlife", ha: "Dabbobin Daji" },
  docs_cat_conservation: { en: "Conservation", ha: "Kiyayewa" },
  docs_cat_culture: { en: "Culture", ha: "Al'ada" },
  docs_cat_tourism: { en: "Eco-Tourism", ha: "Yawon Bude Ido" },
  docs_loading: { en: "Loading documentaries...", ha: "Ana loda fina-finai..." },
  docs_no_found: { en: "No documentaries found in this category.", ha: "Ba a sami fina-finai a wannan rukunin ba." },

  // Expedition Map page
  map_badge: { en: "Interactive Map", ha: "Taswirar Daji" },
  map_title: { en: "The Digital Safari", ha: "Safari na Dijital" },
  map_subtitle: { en: "Explore our territories, track our expeditions, and discover the wild spaces of Northern Nigeria.", ha: "Bincika yankunanmu, bi sahun tafiyarmu, da gano kyawun daji na Arewacin Najeriya." },
  map_col1_title: { en: "Live Tracking", ha: "Bin Sawu a Rarayya" },
  map_col1_text: { en: "Our map will soon feature live tracking of our active safari expeditions and documentary film crews.", ha: "Taswirarmu za ta nuna bin sawun tafiyar safari da masu daukar fina-finanmu nan kusa." },
  map_col2_title: { en: "Conservation Zones", ha: "Yankunan Kiyaye Muhalli" },
  map_col2_text: { en: "Explore the critical habitats and protected areas we monitor as part of our core mission.", ha: "Bincika mahimman wurare da yankunan da muke kiyayewa a matsayin babban aikinmu." },
  map_col3_title: { en: "Ready to explore?", ha: "Kun shirya don bincike?" },
  map_col3_text: { en: "Every point on this map represents a real-world adventure. Find your next destination and book an expedition.", ha: "Kowane wuri a taswirar nan yana nuna kasadar gaske. Nemo inda kake son zuwa ka shirya tafiya." },
  map_col3_btn: { en: "View All Safaris", ha: "Duba Duk Safaris" },

  // Contact page
  contact_hero_title: { en: "Plan Your Wild Hausa Experience", ha: "Shirya Kasadarku ta Wild Hausa" },
  contact_hero_subtitle: { en: "Tell us what kind of wild experience you want to create.", ha: "Fada mana irin kasadar daji da kuke son fuskanta." },
  contact_get_in_touch: { en: "Get in Touch", ha: "Tuntube Mu" },
  contact_get_in_touch_desc: { en: "Whether you're planning a safari, looking to partner on a documentary, or booking a school trip, our team is ready to guide you.", ha: "Ko kuna shirin safari ne, ko hadin gwiwar fim, ko ziyarar makaranta, kungiyarmu a shirye take ta taimake ku." },
  contact_hq: { en: "Headquarters", ha: "Babban Ofis" },
  contact_hq_val: { en: "123 Savanna Way, Kano, Northern Nigeria", ha: "Lamba 123 Titin Savanna, Kano, Arewacin Najeriya" },
  contact_val: { en: "hello@wildhausa.com | +234 800 Wild Hausa", ha: "hello@wildhausa.com | +234 800 Wild Hausa" },
  contact_form_name: { en: "Full Name", ha: "Cikakken Suna" },
  contact_form_email: { en: "Email Address", ha: "Adireshin Email" },
  contact_form_phone: { en: "Phone Number", ha: "Lambar Waya" },
  contact_form_interest: { en: "Interest Type", ha: "Irin Abin da Kake Bukata" },
  contact_interest_safari: { en: "Safari Booking", ha: "Rajistar Safari" },
  contact_interest_doc: { en: "Documentary / Media", ha: "Fina-finai / Yada Labarai" },
  contact_interest_park: { en: "Adventure Park", ha: "Wurin Kasada" },
  contact_interest_school: { en: "School Programme", ha: "Ziyarar Makaranta" },
  contact_interest_partner: { en: "Partnership", ha: "Hadin Gwiwa" },
  contact_interest_general: { en: "General Enquiry", ha: "Tambayoyi na Gaba Daya" },
  contact_form_name_placeholder: { en: "Amina Bello", ha: "Amina Bello" },
  contact_form_message: { en: "Your Message", ha: "Sakwanka" },
  contact_form_placeholder: { en: "Tell us more about your plans...", ha: "Fada mana karin bayani game da shirye-shiryenku..." },
  contact_form_send: { en: "Send Enquiry", ha: "Aika da Sakon" },
  contact_error_fields: { en: "Please fill in all required fields.", ha: "Da fatan za a cika duk filayen da ake bukata." },
  contact_error_submit: { en: "Failed to submit enquiry. Please try again.", ha: "An gaza aika sakon. Da fatan za a sake gwadawa." },
  contact_success_another: { en: "Send another message", ha: "Aika wani sako" },

  // Adventure Park Page
  adventure_hero_title: { en: "Outdoor Adventure Ground", ha: "Wurin Wasannin Motsa Jiki na Kasada" },
  adventure_hero_subtitle: { en: "Unplug, challenge yourself, and play in the wild. Perfect for families, schools, and corporate teams.", ha: "Kashe wayoyi, kalubalanci kanku, kuma kuyi wasa a daji. Sun dace da iyalai, makarantu, da kungiyoyin kamfanoni." },
  adventure_loading: { en: "Loading adventure activities...", ha: "Ana loda wasannin kasada..." },
  adventure_safety_title: { en: "Adventure with safety. Explore with respect.", ha: "Yi kasada cikin tsaro. Bincika cikin girmamawa." },
  adventure_safety_desc: { en: "Our facilities are managed by trained professionals ensuring a safe environment that respects the surrounding wildlife.", ha: "Kwararrun ma'aikata ne ke lura da wurarenmu don tabbatar da aminci da kiyaye dabbobin da ke kusa." },
  adventure_book_btn: { en: "Book an Adventure", ha: "Aiko da Bukatar Wasa" },

  // Conservation Classroom Page
  cons_field_notes: { en: "Projects", ha: "Ayyukanmu" },
  cons_hero_title: { en: "Projects", ha: "Ayyukanmu" },
  cons_hero_subtitle: { en: "Explore our field logs, conservation updates, and wilderness journals.", ha: "Karanta rahotannin daji, labaran kiyaye muhalli, da sauran labarai." },
  cons_loading: { en: "Loading projects...", ha: "Ana loda ayyukanmu..." },
  back_to_blog: { en: "Back to Projects", ha: "Koma ga Ayyukanmu" },
  read_more: { en: "READ MORE", ha: "KARA KARANTAWA" },
  cons_school_title: { en: "School Programmes", ha: "Shirye-shiryen Makarantu" },
  cons_school_desc: { en: "We offer immersive educational modules for students of all ages. Bring your classroom into the wild or invite our conservation educators to your school for an interactive workshop.", ha: "Muna ba da kyawawan shirye-shiryen ilimi don dalibai na kowane shekaru. Ku kawo daliban ku zuwa daji ko ku gayyaci malamai zuwa makarantarku." },
  cons_school_btn_tour: { en: "Book a School Tour", ha: "Shirya Ziyarar Makaranta" },
  cons_school_btn_dl: { en: "Download Resources", ha: "Saukar da Kayan Aiki" },
  about_loading: { en: "Loading story...", ha: "Ana loda labarinmu..." },
  services_loading: { en: "Loading services...", ha: "Ana loda ayyukanmu..." },
  download_journal: { en: "Download Journal", ha: "Saukar da Littafin" },
  close_btn: { en: "Close", ha: "Rufe" },
};

// Dynamic Data Translation Mappers

export const safariTranslations: Record<string, any> = {
  "the-yankari-grand-tour": {
    title: "Gidan Gandun Yankari",
    location: "Bauchi State",
    duration: "Kwana 3, Dare 2",
    difficulty: "Ga Kowa da Iyalai",
    bestFor: "Iyalai da Masu Bude Ido",
    overview: "Venture into one of West Africa's most renowned reserves. Expect to encounter elephants, baboons, and a spectacular array of birdlife as you explore the savanna plains and natural warm springs.",
    itinerary: [
      { title: "Isa Sansani & Ziyara ta Yamma", description: "Isa sansanin daji, daidaita masauki, sannan ku fita don ganin dabbobi lokacin faduwar rana." },
      { title: "Tsakiyar Daji da Wikki Warm Springs", description: "Cikakken yini na binciken reserve din tare da guides, sannan yin wanka a magudanar ruwan dumin halitta na Wikki." },
      { title: "Tafiyar safe ta Karshe da Tashi", description: "Tafiyar kafa ta safe don gano sawun dabbobi da kokarin kiyayewa kafin komawa gida." }
    ]
  },
  "yankari-grand-tour": {
    title: "Gidan Gandun Yankari",
    location: "Bauchi State",
    duration: "Kwana 3, Dare 2",
    difficulty: "Ga Kowa da Iyalai",
    bestFor: "Iyalai da Masu Bude Ido",
    overview: "Venture into one of West Africa's most renowned reserves. Expect to encounter elephants, baboons, and a spectacular array of birdlife as you explore the savanna plains and natural warm springs.",
    itinerary: [
      { title: "Isa Sansani & Ziyara ta Yamma", description: "Isa sansanin daji, daidaita masauki, sannan ku fita don ganin dabbobi lokacin faduwar rana." },
      { title: "Tsakiyar Daji da Wikki Warm Springs", description: "Cikakken yini na binciken reserve din tare da guides, sannan yin wanka a magudanar ruwan dumin halitta na Wikki." },
      { title: "Tafiyar safe ta Karshe da Tashi", description: "Tafiyar kafa ta safe don gano sawun dabbobi da kokarin kiyayewa kafin komawa gida." }
    ]
  },
  "kamuku-wilderness-trek": {
    title: "Tafiyar Dajin Kamuku",
    location: "Kaduna State",
    duration: "Kwana 5, Dare 4",
    difficulty: "Tafiya Mai Nisa (Advanced)",
    bestFor: "Masu Kasada da Masu Bincike",
    overview: "A deep trek into the pristine woodlands of Kamuku. Spot rare hornbills, baboons, and explore our active conservation research stations.",
    itinerary: [
      { title: "Tafiyar Kafa zuwa Sansanin Daji", description: "Hawan kafa zuwa can tsakiyar daji domin kafa tantunan kwana." },
      { title: "Ziyartar Ofishin Bincike", description: "Shiga jami'anmu don duba cameras da aka ajiye don lura da dabbobi." },
      { title: "Kallon Tsuntsaye daga Dogayen Bishiyoyi", description: "Yini na musamman don kallon tsuntsaye da dabbobi daga hasumiyar kallo." },
      { title: "Safari na Dare da Kayan Survival", description: "Fita daji da daddare don ganin dabbobin dare da koyan dabarun rayuwa a daji." },
      { title: "Kwashe Tanti da Komawa", description: "Tattaunawa ta karshe, tattara tantuna, da komawa babban kofar shiga ta gidan gandun." }
    ]
  },
  "savanna-photographic-safari": {
    title: "Safari na Daukar Hoton Daji",
    location: "Wurare Daban-daban",
    duration: "Kwana 2, Dare 1",
    difficulty: "Tsaka-tsaki",
    bestFor: "Masu Daukar Hoto",
    overview: "Capture the raw essence of West African wildlife under the golden savanna sun. Led by award-winning wildlife photographers.",
    itinerary: [
      { title: "Lokacin Faduwar Rana (Golden Hour)", description: "Koyan dabarun daukar hoto cikin haske mara karfi and bin sawun dabbobi." },
      { title: "Hotunan Dabbobi Lokacin Alfijir", description: "Daukar hotunan dabbobi da sassafe sannan ku shiga dakin gyaran hoto don gyara hotuna." }
    ]
  },
  "gashaka-gumti-deep-forest": {
    title: "Dajin Gashaka Gumti",
    location: "Taraba State",
    duration: "Kwana 7, Dare 6",
    difficulty: "Kwararru Kaɗai",
    bestFor: "Kwararrun Masu Tafiyar Daji",
    overview: "Our ultimate challenge. Trek through the mountainous rain forests of Gashaka Gumti, home to chimpanzees and leopards.",
    itinerary: [
      { title: "Isa Gindin Dutse", description: "Duba kayan aiki, bayar da umarni, da kafa tantin kwana a gindin dutsen daji." },
      { title: "Hawa Dutsen Daji", description: "Tafiya mai wahala ta cikin dazuzzuka masu duhu, kuna sauraron sautin chimpanzees." }
    ]
  }
};

export const mediaTranslations: Record<string, any> = {
  "Shadows of the Savanna": {
    title: "Inuwar Savanna",
    category: "Dabbobin Daji",
    description: "Kalli rayuwar dare ta dabbobin daji a manyan wuraren kiyayewa na Arewacin Najeriya."
  },
  "The Last Giraffes": {
    title: "Ragowar Rakuman Daji",
    category: "Kiyayewa",
    description: "Nuna kokarin da ake yi don ceto Rakumin Dajin Yammacin Afirka daga gushewa gaba daya."
  },
  "Rangers on the Frontline": {
    title: "Jami'an Tsaron Daji",
    category: "Al'ada",
    description: "Yini guda a rayuwar jaruman da ke sadaukar da rayukansu don kare dabbobi daga mafarauta."
  },
  "Life in the Dry Season": {
    title: "Rayuwa a Lokacin Rani",
    category: "Dabbobin Daji",
    description: "Yadda dabbobi ke rayuwa lokacin rani yayin da suke neman ruwa a busasshen yankin Sahel."
  },
  "Into the Deep Forest": {
    title: "Cikin Dajin Taraba",
    category: "Yawon Bude Ido",
    description: "Binciken dazuzzukan Taraba da kuma al'ummomin da ke rayuwa da kare su."
  }
};

export const activityTranslations: Record<string, any> = {
  "Nature Trails": {
    title: "Hanyoyin Yawo a Halitta",
    text: "Hanyoyin yawo da guides ke jagoranta, tun daga masu sauki zuwa manyan hawa dutse."
  },
  "Camping Grounds": {
    title: "Wuraren Kafa Tanti",
    text: "Wuraren kwana a tantuna cikin aminci karkashin hasken taurari na sararin samaniyar Afirka."
  },
  "Team Building": {
    title: "Hadin Gwiwar Kungiya",
    text: "Wasanni da kalubale na musamman don karfafa hadin gwiwa tsakanin kungiyoyin kamfanoni."
  }
};

export const conservationNoteTranslations: Record<string, any> = {
  "Habitat Preservation": {
    title: "Kiyaye Muhallin Halitta",
    text: "Fahimtar daidaiton muhallin Sahel da kokarinmu na dawo da yankunan da suka lalace."
  },
  "Wildlife Facts": {
    title: "Gaskiya Game da Dabbobi",
    text: "Ko kun sani? Rakumin Dajin Yammacin Afirka ya kusa bacewa a duniya. Koyi game da farfadowarsu."
  },
  "Community Action": {
    title: "Aikin Al'umma",
    text: "Aikin kiyaye muhalli yana samun nasara ne kawai idan al'umma ke ci gaba. Koyi shirin yaki da farautar dabbobi na al'umma."
  }
};

export function translateSafari(safari: any, language: Language) {
  if (language === 'en') return safari;
  
  // Check if database contains dynamic Hausa overrides
  const hasDbOverrides = safari.title_ha || safari.overview_ha || safari.location_ha || safari.itinerary?.some((d: any) => d.title_ha || d.description_ha);
  if (hasDbOverrides) {
    return {
      ...safari,
      title: safari.title_ha || safari.title,
      location: safari.location_ha || safari.location,
      duration: safari.duration_ha || safari.duration,
      difficulty: safari.difficulty_ha || safari.difficulty,
      bestFor: safari.bestFor_ha || safari.bestFor,
      overview: safari.overview_ha || safari.overview,
      itinerary: safari.itinerary?.map((day: any) => ({
        ...day,
        title: day.title_ha || day.title,
        description: day.description_ha || day.description
      })) || safari.itinerary
    };
  }

  // Fallback to static mapping
  const tSafari = safariTranslations[safari.slug];
  if (!tSafari) return safari;
  return {
    ...safari,
    title: tSafari.title || safari.title,
    location: safari.location,
    duration: tSafari.duration || safari.duration,
    difficulty: tSafari.difficulty || safari.difficulty,
    bestFor: tSafari.bestFor || safari.bestFor,
    overview: tSafari.overview || safari.overview,
    itinerary: safari.itinerary?.map((day: any, idx: number) => {
      const tDay = tSafari.itinerary?.[idx];
      return {
        ...day,
        title: tDay?.title || day.title,
        description: tDay?.description || day.description
      };
    }) || safari.itinerary
  };
}

export function translateMediaItem(item: any, language: Language) {
  if (language === 'en') return item;
  
  if (item.title_ha || item.category_ha || item.description_ha) {
    return {
      ...item,
      title: item.title_ha || item.title,
      category: item.category_ha || item.category,
      description: item.description_ha || item.description
    };
  }

  const tMedia = mediaTranslations[item.title];
  if (!tMedia) return item;
  return {
    ...item,
    title: tMedia.title || item.title,
    category: tMedia.category || item.category,
    description: tMedia.description || item.description
  };
}

export function translateActivity(activity: any, language: Language) {
  if (language === 'en') return activity;
  
  if (activity.title_ha || activity.text_ha) {
    return {
      ...activity,
      title: activity.title_ha || activity.title,
      text: activity.text_ha || activity.text
    };
  }

  const tActivity = activityTranslations[activity.title];
  if (!tActivity) return activity;
  return {
    ...activity,
    title: tActivity.title || activity.title,
    text: tActivity.text || activity.text
  };
}

export function translateConservationNote(note: any, language: Language) {
  if (language === 'en') return note;
  
  if (note.title_ha || note.text_ha || note.category_ha || note.subtitle_ha) {
    return {
      ...note,
      title: note.title_ha || note.title,
      text: note.text_ha || note.text,
      category: note.category_ha || note.category,
      subtitle: note.subtitle_ha || note.subtitle
    };
  }

  const tNote = conservationNoteTranslations[note.title];
  if (!tNote) return note;
  return {
    ...note,
    title: tNote.title || note.title,
    text: tNote.text || note.text
  };
}

export function translateMapLocation(location: any, language: Language) {
  if (language === 'en') return location;

  return {
    ...location,
    title: location.title_ha || location.title,
    description: location.description_ha || location.description,
    category: location.category_ha || location.category,
    cta: location.cta_ha || location.cta
  };
}

export function translateAbout(content: any, language: Language) {
  if (language === 'en' || !content) return content;

  return {
    ...content,
    heroTitle: content.heroTitle_ha || content.heroTitle,
    heroSubtitle: content.heroSubtitle_ha || content.heroSubtitle,
    missionTitle: content.missionTitle_ha || content.missionTitle,
    missionSubtitle: content.missionSubtitle_ha || content.missionSubtitle,
    missionP1: content.missionP1_ha || content.missionP1,
    missionP2: content.missionP2_ha || content.missionP2,
    principlesTitle: content.principlesTitle_ha || content.principlesTitle,
    principles: content.principles?.map((p: any) => ({
      ...p,
      title: p.title_ha || p.title,
      text: p.text_ha || p.text
    }))
  };
}

export function translateServices(content: any, language: Language) {
  if (language === 'en' || !content) return content;

  return {
    ...content,
    heroTitle: content.heroTitle_ha || content.heroTitle,
    heroSubtitle: content.heroSubtitle_ha || content.heroSubtitle,
    services: content.services?.map((s: any) => ({
      ...s,
      title: s.title_ha || s.title,
      subtitle: s.subtitle_ha || s.subtitle,
      description: s.description_ha || s.description,
      items: s.items_ha || s.items,
      cta: s.cta_ha || s.cta
    }))
  };
}

export function parsePrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  const normalized = priceStr.toString().replace(/[^0-9.]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatSafariPrice(price: any, showPricing: boolean | undefined, language: Language): string {
  // By default, if showPricing is undefined or true, we show pricing.
  if (showPricing === false) {
    return language === 'en' ? 'Price on request' : 'Nemi Farashi';
  }
  
  const numPrice = parsePrice(price);
  if (numPrice === 0) {
    return language === 'en' ? 'Price on request' : 'Nemi Farashi';
  }

  // Format with NGN currency symbol (₦)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice);
}

export function calculateEstimatedTotal(price: any, guestsStr: string, language: Language): string {
  const priceNum = parsePrice(price);
  if (priceNum === 0) {
    return language === 'en' ? 'Price on request' : 'Nemi Farashi';
  }

  const format = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  if (guestsStr === '1 Explorer') {
    return format(priceNum);
  }
  if (guestsStr === '2 Explorers') {
    return format(priceNum * 2);
  }
  if (guestsStr === '3 - 5 Explorers') {
    return `${format(priceNum * 3)} - ${format(priceNum * 5)}`;
  }
  if (guestsStr === 'Group (6+)') {
    return `${language === 'en' ? 'From' : 'Daga'} ${format(priceNum * 6)}`;
  }
  
  return format(priceNum);
}
