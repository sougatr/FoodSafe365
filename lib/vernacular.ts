'use client';
import { useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export const LANGUAGE_OPTIONS: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' }
];

export const VERNACULAR_STORAGE_KEY = 'foodsafe_language';

export const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', hi: 'होम', mr: 'मुख्यपृष्ठ' },
  'nav.checks': { en: 'Checks', hi: 'दैनिक जांच', mr: 'दैनिक तपासणी' },
  'nav.manager': { en: 'Manager', hi: 'प्रबंधक', mr: 'व्यवस्थापक' },
  'nav.aiTrends': { en: 'AI Trends', hi: 'AI ट्रेंड्स', mr: 'AI ट्रेंड्स' },
  'nav.aiCopilot': { en: 'AI Copilot', hi: 'AI सहायक', mr: 'AI सहाय्यक' },
  'nav.actions': { en: 'Actions', hi: 'कार्रवाई', mr: 'कृती' },
  'nav.records': { en: 'Records', hi: 'रिकॉर्ड्स', mr: 'नोंदी' },
  'nav.providers': { en: 'Providers', hi: 'सेवा प्रदाता', mr: 'सेवा पुरवठादार' },
  'nav.showcase': { en: 'Verified Badge', hi: 'सत्यापित बैज', mr: 'प्रमाणित बॅज' },
  'nav.fssaiLive': { en: '● FSSAI Live', hi: '● FSSAI लाइव', mr: '● FSSAI थेट' },
  'nav.backHome': { en: 'Back to Home', hi: 'होम पर वापस जाएं', mr: 'मुख्यपृष्ठावर परत जा' },
  'nav.backChecks': { en: 'Back to Checks', hi: 'जांच सूची पर वापस जाएं', mr: 'तपासणी सूचीवर परत जा' },

  // General Actions
  'action.save': { en: 'Save', hi: 'सहेजें', mr: 'जतन करा' },
  'action.submit': { en: 'Submit Check', hi: 'जांच जमा करें', mr: 'तपासणी सादर करा' },
  'action.startToday': { en: 'Start Today’s Checks', hi: 'आज की जांच शुरू करें', mr: 'आजची तपासणी सुरू करा' },
  'action.managerReview': { en: 'Manager Review', hi: 'प्रबंधक समीक्षा', mr: 'व्यवस्थापक पुनरावलोकन' },
  'action.viewBadge': { en: 'View FoodSafetyGreen Badge', hi: 'FoodSafetyGreen बैज देखें', mr: 'FoodSafetyGreen बॅज पहा' },
  'action.shareWhatsApp': { en: 'Share on WhatsApp', hi: 'व्हाट्सएप पर शेयर करें', mr: 'व्हॉट्सॲपवर शेअर करा' },
  'action.printStandee': { en: 'Print Table Standee / Decal', hi: 'टेबल स्टैंडी / स्टिकर प्रिंट करें', mr: 'टेबल स्टॅन्डी / स्टिकर प्रिंट करा' },
  'action.filterAll': { en: 'All 29 Checks', hi: 'सभी 29 जांच', mr: 'सर्व 29 तपासण्या' },
  'action.filterKitchen': { en: 'Core Kitchen (23)', hi: 'मुख्य रसोई (23)', mr: 'मुख्य स्वयंपाकघर (23)' },
  'action.filterBar': { en: 'Bar & Brewery (2)', hi: 'बार और ब्रूअरी (2)', mr: 'बार आणि ब्रुअरी (2)' },
  'action.filterCloud': { en: 'Cloud Kitchen (2)', hi: 'क्लाउड किचन (2)', mr: 'क्लाउड किचन (2)' },
  'action.filterCatering': { en: 'Catering (2)', hi: 'केटरिंग (2)', mr: 'केटरिंग (2)' },

  // Rating Scale
  'rating.5.title': { en: '5★ Excellent', hi: '5★ उत्कृष्ट', mr: '5★ उत्कृष्ट' },
  'rating.5.desc': {
    en: 'Fully compliant with standard; clean, optimal control in place',
    hi: 'मानक के पूर्णतः अनुरूप; स्वच्छ एवं सर्वोत्तम नियंत्रण',
    mr: 'मानकांचे पूर्ण पालन; स्वच्छ आणि सर्वोत्तम नियंत्रण'
  },
  'rating.4.title': { en: '4★ Good', hi: '4★ अच्छा / स्वीकार्य', mr: '4★ समाधानकारक' },
  'rating.4.desc': {
    en: 'Standard met; acceptable condition with minor non-safety remark only',
    hi: 'मानक पूरा हुआ; स्वीकार्य स्थिति, कोई सुरक्षा जोखिम नहीं',
    mr: 'मानक पूर्ण; स्वीकार्य स्थिती, कोणताही सुरक्षितता धोका नाही'
  },
  'rating.3.title': { en: '3★ Needs Attention', hi: '3★ ध्यान दें', mr: '3★ लक्ष द्या' },
  'rating.3.desc': {
    en: 'Needs attention; control partially compromised, corrective action recommended',
    hi: 'सुधार की आवश्यकता; सुधारात्मक कार्रवाई अनुशंसित',
    mr: 'सुधारणेची गरज; सुधारात्मक कारवाईची शिफारस'
  },
  'rating.2.title': { en: '2★ Unsatisfactory', hi: '2★ असंतोषजनक', mr: '2★ असमाधानकारक' },
  'rating.2.desc': {
    en: 'Standard not met; clear deviation requiring immediate correction',
    hi: 'मानक पूरा नहीं हुआ; तत्काल सुधार आवश्यक',
    mr: 'मानक पूर्ण नाही; त्वरित दुरुस्ती आवश्यक'
  },
  'rating.1.title': { en: '1★ Critical Hazard', hi: '1★ गंभीर जोखिम', mr: '1★ गंभीर धोका' },
  'rating.1.desc': {
    en: 'Severe failure or direct contamination risk; immediate action required',
    hi: 'गंभीर विफलता या सीधा संदूषण जोखिम; तत्काल रोकें',
    mr: 'गंभीर त्रुटी किंवा थेट संसर्ग धोका; त्वरित थांबवा'
  },
  'rating.na.title': { en: 'N/A Not Applicable', hi: 'लागू नहीं (N/A)', mr: 'लागू नाही (N/A)' },
  'rating.na.desc': {
    en: 'Control or equipment is not applicable to this facility, shift, or operational setup',
    hi: 'यह नियंत्रण या उपकरण इस रसोई, शिफ्ट या सेटअप के लिए लागू नहीं है',
    mr: 'हे नियंत्रण किंवा उपकरण या स्वयंपाकघर, शिफ्ट किंवा सेटअपसाठी लागू नाही'
  },

  // Badge Status & Showcase
  'badge.verified': { en: 'FoodSafetyGreen™ Verified', hi: 'FoodSafetyGreen™ प्रमाणित', mr: 'FoodSafetyGreen™ प्रमाणित' },
  'badge.tagline': {
    en: 'Daily Clean Kitchen & Hygiene Compliance Audit',
    hi: 'दैनिक स्वच्छ रसोई और हाइजीन अनुपालन ऑडिट',
    mr: 'दैनिक स्वच्छ स्वयंपाकघर आणि स्वच्छता अनुपालन ऑडिट'
  },
  'badge.safeDining': {
    en: 'Safe Dining Certified by FoodSafe365',
    hi: 'FoodSafe365 द्वारा प्रमाणित सुरक्षित डाइनिंग',
    mr: 'FoodSafe365 द्वारे प्रमाणित सुरक्षित भोजन'
  },
  'badge.inspectionStatus': {
    en: 'All 29 Critical Safeguards Inspected Today',
    hi: 'आज सभी 29 महत्वपूर्ण सुरक्षा जांच पूरी हुईं',
    mr: 'आज सर्व 29 महत्त्वपूर्ण सुरक्षा तपासण्या पूर्ण झाल्या'
  },
  'badge.scanPrompt': {
    en: 'Scan to view live inspection proof & food safety dossier',
    hi: 'लाइव निरीक्षण प्रमाण और खाद्य सुरक्षा रिपोर्ट देखने के लिए स्कैन करें',
    mr: 'थेट तपासणी पुरावा आणि अन्न सुरक्षा अहवाल पाहण्यासाठी स्कॅन करा'
  },
  'badge.shiftCompleted': { en: 'Shift Checks Completed', hi: 'शिफ्ट जांच पूर्ण', mr: 'शिफ्ट तपासणी पूर्ण' },
  'badge.openAlerts': { en: 'Open Alerts', hi: 'सक्रिय चेतावनियां', mr: 'सक्रिय सतर्कता' },
  'badge.dateVerified': { en: 'Audit Date', hi: 'ऑडिट तिथि', mr: 'ऑडिट तारीख' },
  'badge.location': { en: 'Kitchen Facility', hi: 'किचन यूनिट', mr: 'किचन युनिट' },

  // Hero Headlines
  'hero.title1': { en: 'Clean Kitchens', hi: 'साफ-सुथरी रसोई', mr: 'स्वच्छ स्वयंपाकघर' },
  'hero.title2': { en: 'Don’t Get Shut Down.', hi: 'कभी सील नहीं होती।', mr: 'कधी बंद पडत नाही.' },
  'hero.subtitle': {
    en: 'Keep your kitchen spotless, your cold chain unbroken, and FDA inspectors off your back.',
    hi: 'अपनी रसोई को बेदाग रखें, कोल्ड चेन बरकरार रखें और FDA निरीक्षण में 100% सुरक्षित रहें।',
    mr: 'आपले स्वयंपाकघर स्वच्छ ठेवा, कोल्ड चेन अखंड ठेवा आणि FDA तपासणीत १००% सुरक्षित राहा.'
  },
  'hero.dailyStatus': { en: 'DAILY VERIFIED STATUS', hi: 'दैनिक सत्यापित स्थिति', mr: 'दैनिक प्रमाणित स्थिती' }
};

export interface SafeguardTranslation {
  title: string;
  why?: string;
  action?: string;
}

export const SAFEGUARD_TRANSLATIONS: Record<string, Record<Language, SafeguardTranslation>> = {
  'FS28-01': {
    en: {
      title: 'Food preparation areas, kitchen counters, and floors are clean and orderly',
      why: 'Clean food preparation zones, counters, and floors prevent physical and microbial cross-contamination.',
      action: 'Halt preparation on affected counters; thoroughly sweep, wash, sanitize, and verify surfaces.'
    },
    hi: {
      title: 'भोजन तैयारी क्षेत्र, किचन काउंटर और फर्श साफ और व्यवस्थित हैं',
      why: 'साफ तैयारी क्षेत्र और फर्श तैयार भोजन में बैक्टीरिया और गंदगी के प्रसार को रोकते हैं।',
      action: 'प्रभावित काउंटरों पर तैयारी रोकें; अच्छी तरह धोएं, सैनिटाइज करें और फिर से जांचें।'
    },
    mr: {
      title: 'अन्न तयार करण्याचे क्षेत्र, किचन काउंटर आणि मजला स्वच्छ व नीटनेटका आहे',
      why: 'स्वच्छ कामाचे ओटे आणि मजला तयार अन्नामध्ये जंतू आणि कचरा पसरण्यापासून रोखतात.',
      action: 'बाधित काउंटरवर काम थांबवा; व्यवस्थित धुवा, सॅनिटाईज करा आणि खात्री करा.'
    }
  },
  'FS28-03': {
    en: {
      title: 'Kitchen drains are clean, functioning, and free of grease accumulation or blockage',
      why: 'Blocked or dirty drains cause standing water, foul odors, and cockroach breeding.',
      action: 'Clear strainer baskets immediately; flush and degrease drains.'
    },
    hi: {
      title: 'किचन की नालियां साफ, चालू और ग्रीस या रुकावट से मुक्त हैं',
      why: 'जाम या गंदी नालियां दुर्गंध, गंदा पानी और तिलचट्टों के पनपने का कारण बनती हैं।',
      action: 'तुरंत जाली साफ करें; नालियों में डीग्रीजर डालकर तेज पानी से फ्लश करें।'
    },
    mr: {
      title: 'स्वयंपाकघरातील ड्रेनेज/नाल्या स्वच्छ, कार्यरत आणि चरबी किंवा अडथळ्यांशिवाय आहेत',
      why: 'तुंबलेल्या नाल्या दुर्गंधी, घाण पाणी आणि झुरळांच्या वाढीस कारणीभूत ठरतात.',
      action: 'जाळी त्वरित स्वच्छ करा; नाल्या गरम पाणी व डिग्रेसरने स्वच्छ करा.'
    }
  },
  'FS28-04': {
    en: {
      title: 'Doors, windows, insect screens, and physical barriers prevent pest entry',
      why: 'Intact physical barriers keep pests, rodents, and flies from entering food zones.',
      action: 'Close doors immediately; log repair request for damaged screens or sweeps.'
    },
    hi: {
      title: 'दरवाजे, खिड़कियां, कीट जालियां और भौतिक बाधाएं कीटों का प्रवेश रोकती हैं',
      why: 'मजबूत जालियां और बंद दरवाजे चूहों और मक्खियों को रसोई में घुसने नहीं देते।',
      action: 'दरवाजे तुरंत बंद करें; क्षतिग्रस्त जाली को तुरंत बदलने का कार्य-आदेश दें।'
    },
    mr: {
      title: 'दरवाजे, खिडक्या, कीटक जाळ्या आणि अडथळे कीटकांपासून बचाव करतात',
      why: 'अखंड जाळ्या आणि बंद दरवाजे उंदीर, माश्या यांना अन्न क्षेत्रात येण्यापासून रोखतात.',
      action: 'दरवाजे त्वरित बंद करा; फाटलेल्या जाळ्या दुरुस्त करण्यासाठी नोंद करा.'
    }
  },
  'FS28-05': {
    en: {
      title: 'Hands are washed before handling food, after breaks, and between tasks',
      why: 'Unwashed hands are the primary transmission vector of pathogens to food.',
      action: 'Instruct handler to stop, wash hands with soap for 20 seconds, and discard touched RTE food.'
    },
    hi: {
      title: 'खाना छूने से पहले, ब्रेक के बाद और कामों के बीच हाथ धोए जाते हैं',
      why: 'गंदे हाथ भोजन में रोगाणुओं (बैक्टीरिया) के प्रसार का सबसे मुख्य कारण हैं।',
      action: 'कर्मचारी को तुरंत रोकें, 20 सेकंड तक साबुन से हाथ धुलवाएं और असुरक्षित भोजन हटाएं।'
    },
    mr: {
      title: 'अन्न हाताळण्यापूर्वी, ब्रेकनंतर आणि कामांच्या दरम्यान हात धुतले जातात',
      why: 'अस्वच्छ हात अन्नामध्ये रोगजंतू पसरण्याचे मुख्य कारण आहेत.',
      action: 'कर्मचाऱ्याला त्वरित थांबवा, साबणाने २० सेकंद हात धुण्यास सांगा.'
    }
  },
  'FS28-06': {
    en: {
      title: 'Dedicated hand-washing stations are fully equipped with water, soap, and clean towels',
      why: 'Staff skip handwashing if sinks lack running water or soap.',
      action: 'Restock liquid soap and paper towels immediately; unblock sink access.'
    },
    hi: {
      title: 'हाथ धोने के बेसिन पानी, साबुन और साफ तौलिये से पूरी तरह सुसज्जित हैं',
      why: 'यदि बेसिन में साबुन या पानी नहीं होगा तो कर्मचारी हाथ धोने में लापरवाही करेंगे।',
      action: 'लिक्विड सोप और पेपर टॉवल तुरंत भरें; बेसिन का रास्ता साफ रखें।'
    },
    mr: {
      title: 'हात धुण्यासाठीचे वॉशबेसिन पाणी, साबण आणि स्वच्छ टॉवेलने सुसज्ज आहेत',
      why: 'बेसिनमध्ये पाणी किंवा साबण नसल्यास कर्मचारी हात धुणे टाळतात.',
      action: 'लिक्विड सोप आणि टॉवेल त्वरित ठेवा; वॉशबेसिन मोकळे करा.'
    }
  },
  'FS28-07': {
    en: {
      title: 'Clean protective clothing, aprons, and head coverings are worn by all kitchen staff',
      why: 'Street clothes and uncovered hair shed bacteria and foreign matter into dishes.',
      action: 'Provide clean apron/head net immediately; require staff to remove jewelry.'
    },
    hi: {
      title: 'सभी किचन स्टाफ द्वारा साफ एप्रन, वर्दी और हेयर कैप (सिर ढकना) पहने गए हैं',
      why: 'बाल और गंदे कपड़े खाने में गिरकर भोजन को दूषित कर सकते हैं।',
      action: 'स्टाफ को तुरंत साफ हेयर नेट और एप्रन पहनाएं; अंगूठियां और घड़ियां उतरवाएं।'
    },
    mr: {
      title: 'सर्व कर्मचाऱ्यांनी स्वच्छ ॲप्रन, गणवेश आणि डोक्यावर कॅप/जाळी घातली आहे',
      why: 'केस आणि कपड्यांची घाण अन्नात पडून ते दूषित होऊ शकते.',
      action: 'कर्मचाऱ्यास त्वरित स्वच्छ हेअर नेट आणि ॲप्रन द्या; दागिने काढण्यास सांगा.'
    }
  },
  'FS28-08': {
    en: {
      title: 'Food safety training: FoSTaC certified supervisor and staff food-hygiene training',
      why: 'Untrained staff commit critical cross-contamination and cooking errors.',
      action: 'Enrol untrained supervisors and staff in accredited FoSTaC training programs.'
    },
    hi: {
      title: 'खाद्य सुरक्षा प्रशिक्षण: FoSTaC प्रमाणित सुपरवाइजर और स्टाफ हाइजीन प्रशिक्षण',
      why: 'बिना ट्रेनिंग वाला स्टाफ अनजाने में खाने को दूषित करने की गंभीर गलतियां करता है।',
      action: 'सुपरवाइजर को FSSAI FoSTaC प्रशिक्षण में नामांकित करें और सुरक्षा नियम समझाएं।'
    },
    mr: {
      title: 'अन्न सुरक्षा प्रशिक्षण: FoSTaC प्रमाणित सुपरवायझर आणि कर्मचाऱ्यांचे स्वच्छता प्रशिक्षण',
      why: 'प्रशिक्षण नसलेले कर्मचारी अजाणतेपणी सुरक्षिततेच्या गंभीर चुका करतात.',
      action: 'कर्मचाऱ्यांना FoSTaC प्रशिक्षण वर्गासाठी नोंदवा आणि नियम समजावून सांगा.'
    }
  },
  'FS28-09': {
    en: {
      title: 'Staff medical check-up: 6-monthly stool tests, Form 1A certificates, and vaccinations',
      why: 'Carriers of typhoid or hepatitis can silently infect hundreds of diners.',
      action: 'Exclude symptomatic staff; book medical check-up camp via providers.'
    },
    hi: {
      title: 'स्टाफ मेडिकल जांच: 6-मासिक मल परीक्षण, फॉर्म 1A प्रमाणपत्र और टीके (टाइफाइड/हेप ए)',
      why: 'टाइफाइड या पीलिया से पीड़ित कर्मचारी ग्राहकों में गंभीर बीमारी फैला सकते हैं।',
      action: 'अस्वस्थ कर्मचारियों को किचन से हटाएं; अधिकृत लैब से मेडिकल कैंप बुक करें।'
    },
    mr: {
      title: 'कर्मचारी वैद्यकीय तपासणी: ६ महिन्यांचे स्टूल टेस्ट, फॉर्म 1A प्रमाणपत्र आणि लसीकरण',
      why: 'टायफॉइड किंवा काविळीचे रुग्ण कर्मचारी ग्राहकांमध्ये आजार पसरवू शकतात.',
      action: 'आजारी कर्मचाऱ्यास तात्काळ बाजूला करा; लॅबकडून मेडिकल कॅम्प आयोजित करा.'
    }
  },
  'FS28-10': {
    en: {
      title: 'Incoming raw materials and food deliveries are inspected before acceptance',
      why: 'Preventing compromised, expired, or warm supplies protects the entire kitchen.',
      action: 'Reject compromised or warm delivery batches; record deviation in receiving log.'
    },
    hi: {
      title: 'आने वाली कच्ची सामग्री और खाद्य डिलीवरी की स्वीकृति से पहले जांच की जाती है',
      why: 'खराब या बासी सामग्री स्वीकार करने से तैयार भोजन विषाक्त हो सकता है।',
      action: 'गर्म या खराब पैकेजिंग वाले सामान को तुरंत वापस लौटाएं; रसीद पर नोट लिखें।'
    },
    mr: {
      title: 'येणाऱ्या कच्च्या मालाची आणि खाद्य डिलिव्हरीची स्वीकारण्यापूर्वी तपासणी केली जाते',
      why: 'खराब किंवा मुदत संपलेला माल स्वीकारल्यास अन्नात विषबाधा होऊ शकते.',
      action: 'अयोग्य तापमान किंवा खराब पॅकिंगचा माल त्वरित नाकारा.'
    }
  },
  'FS28-11': {
    en: {
      title: 'Raw meat, poultry, seafood, and ready-to-eat foods are strictly segregated in storage',
      why: 'Raw meat juices drip bacteria directly onto cooked and ready-to-eat foods.',
      action: 'Store raw meats on bottom shelves; place cooked foods on top shelves.'
    },
    hi: {
      title: 'कच्चे मांस, पोल्ट्री, सीफूड और तैयार भोजन को स्टोरेज में सख्ती से अलग रखा गया है',
      why: 'कच्चे मांस का खून और पानी पके हुए भोजन पर टपकने से बैक्टीरिया फैलता है।',
      action: 'कच्चे मांस को हमेशा सबसे निचली शेल्फ पर रखें और तैयार भोजन को ऊपर ढंक कर रखें।'
    },
    mr: {
      title: 'कच्चे मांस, पोल्ट्री, सीफूड आणि तयार अन्न साठवणुकीत काटेकोरपणे वेगळे ठेवले आहे',
      why: 'कच्च्या मांसाचे थेंब तयार अन्नावर पडल्यास गंभीर संसर्ग होतो.',
      action: 'कच्चे मांस नेहमी खालच्या रॅकवर आणि तयार अन्न वरच्या रॅकवर झाकून ठेवा.'
    }
  },
  'FS28-12': {
    en: {
      title: 'Food is stored off the floor (pallets/shelves) and protected in food-grade containers',
      why: 'Floor contact absorbs mop water, dirt, and exposes food to crawling insects.',
      action: 'Lift all food containers at least 15 cm (6 inches) off the floor on clean racks.'
    },
    hi: {
      title: 'भोजन फर्श से ऊपर (कम से कम 6 इंच) और फूड-ग्रेड डिब्बों में सुरक्षित रखा गया है',
      why: 'फर्श पर रखने से पोछे का गंदा पानी और कीड़े-मकोड़े भोजन में पहुंच सकते हैं।',
      action: 'सभी बोरियों और डिब्बों को जमीन से 15 सेमी ऊपर रैक या पैलेट पर रखें।'
    },
    mr: {
      title: 'अन्न जमिनीवरून वर (किमान ६ इंच) आणि फूड-ग्रेड डब्यांमध्ये सुरक्षित ठेवले आहे',
      why: 'जमिनीवर अन्न ठेवल्याने लादी पुसण्याचे पाणी व कीटक अन्नात शिरू शकतात.',
      action: 'सर्व अन्न डबे जमिनीपासून १५ सेमी वर रॅकवर किंवा पॅलेटवर ठेवा.'
    }
  },
  'FS28-13': {
    en: {
      title: 'FIFO (First In, First Out) and FEFO (First Expiry, First Out) rotation is followed with date tags',
      why: 'Prevents serving expired, stale, or decomposed ingredients to customers.',
      action: 'Rotate shelves so earliest-expiry items are at the front; discard expired items.'
    },
    hi: {
      title: 'तारीख टैग के साथ FIFO (पहले आया, पहले इस्तेमाल) और FEFO रोटेशन का पालन',
      why: 'यह सुनिश्चित करता है कि पुराना सामान पहले उपयोग हो और कोई बासी चीज न परोसी जाए।',
      action: 'पुरानी सामग्री को आगे लाएं; एक्सपायर हो चुकी सामग्री को तुरंत फेंकें।'
    },
    mr: {
      title: 'डेट टॅगसह FIFO (पहिले आले, पहिले वापरा) आणि FEFO रोटेशनचे पालन',
      why: 'जुना माल आधी वापरला जातो आणि मुदत संपलेले अन्न ग्राहकांना जात नाही.',
      action: 'कमी मुदत असलेला माल पुढे ठेवा; मुदत संपलेले अन्न ताबडतोब फेकून द्या.'
    }
  },
  'FS28-15': {
    en: {
      title: 'Raw vegetables, salad greens, and fruits are thoroughly washed and sanitized before prep',
      why: 'Raw produce carries soil, parasitic cysts, and pesticide chemical residues.',
      action: 'Wash in clean running water; sanitize with approved 50 ppm chlorine or veg wash.'
    },
    hi: {
      title: 'कच्ची सब्जियां, सलाद और फल काटने से पहले अच्छी तरह धोए और सैनिटाइज किए जाते हैं',
      why: 'कच्चे सलाद और फलों पर मिट्टी, कीटनाशक और परजीवी होते हैं।',
      action: 'साफ बहते पानी में धोएं और 50 ppm क्लोरीन या फूड-ग्रेड वेज वॉश से सैनिटाइज करें।'
    },
    mr: {
      title: 'कच्च्या भाज्या, कोशिंबीर आणि फळे वापरण्यापूर्वी नीट धुतली आणि सॅनिटाईज केली जातात',
      why: 'कच्च्या भाज्यांवर माती, कीटकनाशके आणि जंतू असू शकतात.',
      action: 'वाहत्या स्वच्छ पाण्यात धुवा आणि मान्य सॅनिटायझरने स्वच्छ करा.'
    }
  },
  'FS28-16': {
    en: {
      title: 'Color-coded cutting boards, knives, and prep stations prevent cross-contamination',
      why: 'Using the same board for raw chicken and salad spreads deadly Salmonella.',
      action: 'Immediately replace wrong board/knife: Red (Meat), Yellow (Poultry), Green (Veg).'
    },
    hi: {
      title: 'रंग-कोडित कटिंग बोर्ड, चाकू और प्रेप स्टेशन क्रॉस-संदूषण रोकते हैं',
      why: 'कच्चे चिकन वाले बोर्ड पर सलाद काटने से साल्मोनेला बैक्टीरिया फैलता है।',
      action: 'रंग कोड का पालन करें: लाल (मांस), पीला (चिकन), हरा (सब्जी)। तुरंत बदलें।'
    },
    mr: {
      title: 'रंग-कोडित चॉपिंग बोर्ड, सुऱ्या आणि प्रेप स्टेशन्स क्रॉस-संसर्ग रोखतात',
      why: 'कच्च्या मांसाच्या बोर्डवर कोशिंबीर कापल्याने अन्नात गंभीर जंतुसंसर्ग होतो.',
      action: 'रंग कोड वापरा: लाल (मटण), पिवळा (चिकन), हिरवा (भाज्या). त्वरित बदला.'
    }
  },
  'FS28-17': {
    en: {
      title: 'Food-contact equipment, blenders, meat slicers, and utensils are cleaned and sanitized',
      why: 'Dried food crust in blenders and slicers harbors active bacterial colonies.',
      action: 'Dismantle, wash in hot detergent water, sanitize, and air-dry equipment.'
    },
    hi: {
      title: 'फूड-कॉन्टैक्ट उपकरण, ब्लेंडर, स्लाइसर और बर्तन पूरी तरह साफ व सैनिटाइज हैं',
      why: 'मिक्सर और कटर में जमा पुराना खाना बैक्टीरिया की नर्सरी बन जाता है।',
      action: 'मशीनों को खोलें, गर्म साबुन पानी से धोएं, सैनिटाइज करें और सुखाएं।'
    },
    mr: {
      title: 'अन्नाच्या संपर्कात येणारी उपकरणे, ब्लेंडर, स्लायसर आणि भांडी स्वच्छ व सॅनिटाईज आहेत',
      why: 'मिक्सर व स्लायसरमध्ये शिल्लक राहिलेले अन्न बॅक्टेरिया वाढवते.',
      action: 'उपकरणे सुटी करा, गरम पाण्याने व साबणाने धुवून सॅनिटाईज करा.'
    }
  },
  'FS28-18': {
    en: {
      title: 'Prepared and partially prepped foods are covered and protected during kitchen service',
      why: 'Open containers expose cooked food to airborne dust, sneezes, and insects.',
      action: 'Cover all prep containers with tight lids or food-grade cling film.'
    },
    hi: {
      title: 'सर्विस के दौरान तैयार और कटी हुई सामग्री ढकी और सुरक्षित रखी जाती है',
      why: 'खुले बर्तनों में मक्खियां, धूल और छींकने की बूंदें गिर सकती हैं।',
      action: 'सभी डिब्बों को ढक्कन या फूड-ग्रेड पारदर्शी पन्नी (क्लिंग रैप) से ढकें।'
    },
    mr: {
      title: 'किचन सर्विस दरम्यान तयार आणि अर्धवट तयार अन्न झाकून व सुरक्षित ठेवले जाते',
      why: 'उघड्या अन्नावर धूळ, माश्या आणि हवेतील जंतू पडू शकतात.',
      action: 'सर्व भांडी घट्ट झाकणाने किंवा फूड-ग्रेड क्लिन्ग फिल्मने झाकून ठेवा.'
    }
  },
  'FS28-19': {
    en: {
      title: 'Refrigerator and cool-storage temperature is checked and verified (< 5°C)',
      why: 'Temperatures above 5°C trigger rapid microbial multiplication in dairy and meats.',
      action: 'Adjust thermostat; service condensing coils; relocate food if temp exceeds 8°C.'
    },
    hi: {
      title: 'फ्रिज और कोल्ड-स्टोरेज का तापमान चेक और सत्यापित किया गया है (< 5°C)',
      why: '5°C से अधिक तापमान पर दूध, पनीर और मांस में बैक्टीरिया तेजी से बढ़ता है।',
      action: 'थर्मोस्टेट ठीक करें; यदि तापमान 8°C से ज्यादा है तो खाना दूसरे फ्रिज में रखें।'
    },
    mr: {
      title: 'फ्रीज आणि कूल-स्टोरेजचे तापमान तपासले आणि प्रमाणित केले आहे (< 5°C)',
      why: '५ अंश से. पेक्षा जास्त तापमानात दुग्धजन्य पदार्थ व मांसात जिवाणू वेगाने वाढतात.',
      action: 'कूलिंग सेटिंग तपासा; तापमान ८°C पेक्षा जास्त असल्यास अन्न हलवा.'
    }
  },
  'FS28-20': {
    en: {
      title: 'Freezer and cold-storage temperature is checked and verified (< −18°C)',
      why: 'Inadequate freezing permits bacterial enzymatic breakdown and ice recrystallization.',
      action: 'Initiate defrost cycle if iced over; verify door gasket seal; call refrigeration tech.'
    },
    hi: {
      title: 'डीप फ्रीजर का तापमान चेक और सत्यापित किया गया है (< −18°C)',
      why: '−18°C से कम ठंड न होने पर फ्रोजन सामान पिघलकर खराब होने लगता है।',
      action: 'यदि बहुत बर्फ जमी है तो डीफ्रॉस्ट करें; रबर गैस्केट चेक करें।'
    },
    mr: {
      title: 'डीप फ्रीझरचे तापमान तपासले आणि प्रमाणित केले आहे (< −18°C)',
      why: 'योग्य थंडी नसल्यास गोठवलेले अन्न वितळून खराब होते.',
      action: 'फ्रीझर डीफ्रॉस्ट करा; दरवाजाचे रबर तपासा; दुरुस्ती तंत्रज्ञांना बोलवा.'
    }
  },
  'FS28-21': {
    en: {
      title: 'Cooking core temperature (≥ 75°C) or reheating temperature is verified with calibrated probe',
      why: 'Under-cooked poultry and reheated gravies allow live pathogens to survive.',
      action: 'Continue cooking until digital probe indicates core is ≥ 75°C for 15 seconds.'
    },
    hi: {
      title: 'कुकिंग कोर तापमान (≥ 75°C) या रीहीटिंग तापमान प्रोब थर्मामीटर से जांचा गया है',
      why: 'अधपके मांस या ठीक से गर्म न की गई ग्रेवी में जीवित बैक्टीरिया बच जाते हैं।',
      action: 'भोजन को तब तक पकाएं जब तक कि केंद्र का तापमान 75°C तक न पहुंच जाए।'
    },
    mr: {
      title: 'स्वयंपाक करताना गाभ्याचे तापमान (≥ 75°C) किंवा गरम करण्याचे तापमान तपासले आहे',
      why: 'अपूर्ण शिजवलेल्या मांसात आणि नीट गरम न केलेल्या ग्रेव्हीत जंतू जिवंत राहतात.',
      action: 'गाभ्याचे तापमान ७५ अंश से. होईपर्यंत अन्न व्यवस्थित शिजू द्या.'
    }
  },
  'FS28-22': {
    en: {
      title: 'Cooked high-risk food is rapidly cooled (60°C to 21°C within 2 hrs, then to 5°C within 2 hrs)',
      why: 'Slow cooling in large pots allows Bacillus cereus and Clostridium spores to germinate.',
      action: 'Divide into shallow pans, use ice-water bath, or blast chiller immediately.'
    },
    hi: {
      title: 'पके हुए भोजन को तेजी से ठंडा किया जाता है (2 घंटे में ≤ 21°C, अगले 2 घंटे में ≤ 5°C)',
      why: 'बड़े बर्तनों में धीरे-धीरे ठंडा होने से विषाक्त बीजाणु पैदा होते हैं।',
      action: 'खाने को उथले पैन में फैलाएं, बर्फ के पानी के टब में रखें और तेजी से ठंडा करें।'
    },
    mr: {
      title: 'शिजवलेले अन्न वेगाने थंड केले जाते (२ तासांत ≤ 21°C, पुढील २ तासांत ≤ 5°C)',
      why: 'अन्न हळूहळू थंड झाल्यास अन्नात विषारी जंतूंची वाढ होते.',
      action: 'अन्न उथळ भांड्यांमध्ये पसरा किंवा बर्फाच्या पाण्यात ठेवून लगेच थंड करा.'
    }
  },
  'FS28-26': {
    en: {
      title: 'Pest inspection: Zero active signs of pests (droppings, sightings, or gnaw marks)',
      why: 'Cockroaches, flies, and rodents carry typhus, salmonella, and dysentery.',
      action: 'Seal entry crevice; quarantine affected room; summon licensed pest-control agency.'
    },
    hi: {
      title: 'कीट निरीक्षण: कीटों का कोई सक्रिय संकेत नहीं (लीद, दिखना, या कुतरने के निशान)',
      why: 'तिलचट्टे, चूहे और मक्खियां साल्मोनेला और हैजा फैलाते हैं।',
      action: 'छेद तुरंत बंद करें; प्रभावित क्षेत्र को अलग करें; पेस्ट कंट्रोल को तुरंत बुलाएं।'
    },
    mr: {
      title: 'कीटक तपासणी: कीटकांची कोणतीही सक्रिय चिन्हे नाहीत (विष्ठा, दिसणे किंवा चावा)',
      why: 'झुरळे, उंदीर आणि माश्या कॉलरा आणि विषबाधा पसरवतात.',
      action: 'सर्व बिळे बुजवा; पेस्ट कंट्रोल एजन्सीला तातडीने पाचारण करा.'
    }
  },
  'FS28-27': {
    en: {
      title: 'Pest-control devices (fly-killers, bait stations) operational and vendor service log current',
      why: 'Non-functional insect electrocutors or missing bait stations allow pest population outbreaks.',
      action: 'Replace UV tubes; clear catch trays; verify vendor monthly service report.'
    },
    hi: {
      title: 'कीट-नियंत्रण उपकरण (फ्लाई-किलर, ट्रैप) चालू हैं और वेंडर सर्विस लॉग अपडेट है',
      why: 'यदि फ्लाई किलर बंद होगा तो मक्खियों की संख्या अचानक बढ़ जाएगी।',
      action: 'फ्लाई किलर की यूवी लाइट बदलें, ट्रे साफ करें और वेंडर की मासिक रिपोर्ट देखें।'
    },
    mr: {
      title: 'कीटक नियंत्रण उपकरणे (फ्लाय किलर, ट्रॅप्स) चालू आहेत आणि व्हेंडर सर्व्हिस लॉग अद्ययावत आहे',
      why: 'उपकरणे बंद असल्यास माश्या आणि किड्यांचे प्रमाण वाढते.',
      action: 'युव्ही ट्यूब तपासा, ट्रे रिकामी करा आणि सर्व्हिस लॉग अपडेट करा.'
    }
  },
  'FS28-28': {
    en: {
      title: 'Kitchen food waste is contained in covered pedal bins and external garbage area is clean',
      why: 'Uncovered garbage attracts flies, stray dogs, and creates foul smells.',
      action: 'Empty overflowing bins immediately; scrub and disinfect garbage collection dock.'
    },
    hi: {
      title: 'रसोई का कचरा ढक्कन वाले पेडल बिन में रखा है और बाहरी कचरा क्षेत्र साफ है',
      why: 'खुले कूड़ेदान मक्खियों और चूहों को आकर्षित करते हैं और बदबू फैलाते हैं।',
      action: 'भरे हुए डस्टबिन तुरंत खाली करें; कूड़ेदान के आसपास फिनाइल से सफाई कराएं।'
    },
    mr: {
      title: 'कचरा झाकण असलेल्या पेडल डस्टबिनमध्ये ठेवला आहे आणि बाहेरील कचरा क्षेत्र स्वच्छ आहे',
      why: 'उघड्या कचऱ्यामुळे माश्या आणि दुर्गंधी वाढते.',
      action: 'डस्टबिन ताबडतोब रिकामी करा; कचरा संकलन जागा जंतुनाशकाने स्वच्छ करा.'
    }
  },
  'FS28-29': {
    en: {
      title: 'Bar & Brewery: Ice machine interior sanitation and dedicated ice scoop hygiene',
      why: 'Ice is consumed raw in drinks; mold and slimy bio-film inside machines contaminate ice.',
      action: 'Drain ice bin; sanitize walls with food-grade sanitizing wash; store scoop in holster.'
    },
    hi: {
      title: 'बार और ब्रूअरी: आइस मशीन की आंतरिक सफाई और समर्पित आइस स्कूप की स्वच्छता',
      why: 'बर्फ सीधे पेय में डाली जाती है; मशीन के अंदर फंगस और गंदगी से ग्राहक बीमार पड़ सकते हैं।',
      action: 'आइस मशीन खाली करके साफ करें; आइस स्कूप को कभी बर्फ के अंदर न छोड़ें।'
    },
    mr: {
      title: 'बार आणि ब्रुअरी: बर्फ मशीनची अंतर्गत स्वच्छता आणि स्वतंत्र आइस स्कूपची स्वच्छता',
      why: 'बर्फ थेट पेयांमध्ये वापरला जातो; मशीनमधील बुरशीमुळे बर्फ दूषित होतो.',
      action: 'मशीन आतून स्वच्छ करा; बर्फ काढण्याचा चमचा बर्फात न ठेवता स्वतंत्र ठेवा.'
    }
  },
  'FS28-30': {
    en: {
      title: 'Bar & Brewery: Draft beer lines, beverage dispensing nozzles, and drip trays sanitation',
      why: 'Yeast residue and beer stone breed wild bacteria in dispensing nozzles.',
      action: 'Flush beer lines with alkaline cleaner weekly; soak nozzles in sanitizing solution nightly.'
    },
    hi: {
      title: 'बार और ब्रूअरी: ड्राफ्ट बीयर लाइन, बेवरेज नोजल और ड्रिप ट्रे की स्वच्छता',
      why: 'बीयर पाइप और नोजल में बची हुई बीयर फंगस और बैक्टीरिया पैदा करती है।',
      action: 'बीयर लाइनों को केमिकल से फ्लश करें; हर रात नोजल को सैनिटाइजर में डुबोकर साफ करें।'
    },
    mr: {
      title: 'बार आणि ब्रुअरी: ड्राफ्ट बिअर लाइन्स, नोझल्स आणि ड्रिप ट्रेची स्वच्छता',
      why: 'बिअरच्या नळ्यांमध्ये साचलेली घाण आणि यीस्टमुळे बॅक्टेरिया वाढतात.',
      action: 'बिअर लाइन्स स्वच्छ पाण्याने व केमिकलने फ्लश करा; नोझल स्वच्छ ठेवा.'
    }
  },
  'FS28-31': {
    en: {
      title: 'Cloud Kitchen & Delivery: Delivery packaging integrity, tamper-evident seals, and dispatch labeling',
      why: 'Tamper-proof seals prevent delivery executives or external tampering during delivery.',
      action: 'Affix holographic tamper-evident seal across container seams; write pack time.'
    },
    hi: {
      title: 'क्लाउड किचन: डिलीवरी पैकेजिंग अखंडता, टैम्पर-एविडेंट सील और डिस्पैच लेबलिंग',
      why: 'सील बंद पैकेजिंग रास्ते में राइडर या किसी भी बाहरी छेड़छाड़ से भोजन को सुरक्षित रखती है।',
      action: 'हर कंटेनर पर मजबूत सुरक्षा सील लगाएं और पैकिंग का सही समय दर्ज करें।'
    },
    mr: {
      title: 'क्लाउड किचन: डिलिव्हरी पॅकेजिंगची सुरक्षितता, टॅम्पर-प्रूफ सील आणि डिस्पॅच लेबलिंग',
      why: 'टॅम्पर-प्रूफ सीलमुळे डिलिव्हरी प्रवासात अन्नामध्ये कोणतीही छेडछाड होत नाही.',
      action: 'प्रत्येक पार्सलवर सुरक्षा सील लावा आणि डिस्पॅचची वेळ नोंदवा.'
    }
  },
  'FS28-32': {
    en: {
      title: 'Cloud Kitchen & Delivery: Staging & dispatch holding temperature control until courier pickup',
      why: 'Food left waiting on ambient dispatch counters enters the danger zone (5°C to 60°C).',
      action: 'Hold hot orders in heated warmer (≥ 60°C); keep cold preps in chiller until rider handoff.'
    },
    hi: {
      title: 'क्लाउड किचन: राइडर पिकअप तक पैकेज्ड फूड का तापमान नियंत्रण',
      why: 'काउंटर पर देर तक रखा खाना ठंडा होकर डेंजर ज़ोन में चला जाता है।',
      action: 'गर्म खाने को हॉट केस (≥ 60°C) में रखें; ठंडे खाने को राइडर आने तक फ्रिज में रखें।'
    },
    mr: {
      title: 'क्लाउड किचन: डिलिव्हरी बॉय येईपर्यंत पॅक केलेल्या अन्नाचे तापमान नियंत्रण',
      why: 'काउंटरवर उघडे राहिलेले अन्न धोकादायक तापमानात जाऊन खराब होऊ शकते.',
      action: 'गरम अन्न हॉट वॉर्मरमध्ये ठेवा आणि थंड पदार्थ फ्रीजमध्येच ठेवा.'
    }
  },
  'FS28-33': {
    en: {
      title: 'Catering & Outdoor Events: Insulated food transport & core temperature maintenance during transit',
      why: 'Traffic delays can let hot food drop below 60°C, causing spore outgrowth.',
      action: 'Use pre-heated Cambro insulated food boxes; record temps before load and upon arrival.'
    },
    hi: {
      title: 'केटरिंग सेवाएं: इंसुलेटेड खाद्य परिवहन और रास्ते में तापमान का रखरखाव',
      why: 'ट्रैफिक में देरी से खाना ठंडा होकर खराब हो सकता है।',
      action: 'इंसुलेटेड हॉट बॉक्स का उपयोग करें; गाड़ी में रखने और वेन्यू पर पहुंचने पर तापमान नापें।'
    },
    mr: {
      title: 'केटरिंग सेवा: इन्सुलेटेड अन्न वाहतूक आणि प्रवासात तापमानाची योग्य देखभाल',
      why: 'वाहतुकीच्या विलंबाने अन्न थंड होऊन त्यात जंतू निर्माण होऊ शकतात.',
      action: 'इन्सुलेटेड बॉक्सेस वापरा; निघताना आणि पोहोचल्यावर तापमान तपासा.'
    }
  },
  'FS28-34': {
    en: {
      title: 'Catering & Outdoor Events: Potable water supply & dedicated mobile handwashing station at event venue',
      why: 'Outdoor catering stalls often lack running water, causing cross-contamination epidemics.',
      action: 'Transport certified 20L potable water carboys; install hands-free gravity wash station.'
    },
    hi: {
      title: 'केटरिंग सेवाएं: पीने योग्य पानी की आपूर्ति और वेन्यू पर मोबाइल हैंडवाश स्टेशन',
      why: 'इवेंट वेन्यू पर पानी न होने से कर्मचारी बिना हाथ धोए खाना परोसने लगते हैं।',
      action: 'प्रमाणित पीने का पानी साथ ले जाएं; स्टॉल पर साबुन और पानी वाला हैंडवाश स्टेशन लगाएं।'
    },
    mr: {
      title: 'केटरिंग सेवा: पिण्यायोग्य पाण्याचा पुरवठा आणि कार्यक्रमाच्या ठिकाणी स्वतंत्र हात धुण्याचे स्टेशन',
      why: 'कार्यक्रमाच्या ठिकाणी पाणी नसल्यास अस्वच्छ हातांनी अन्न वाढले जाते.',
      action: 'पिण्यायोग्य पाण्याचे जार सोबत ठेवा; स्वतंत्र हात धुण्याची सोय करा.'
    }
  }
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  if (DICTIONARY[key] && DICTIONARY[key][lang]) {
    return DICTIONARY[key][lang];
  }
  return DICTIONARY[key]?.en || key;
}

export function getCheckTranslation(code: string, lang: Language = 'en'): SafeguardTranslation | null {
  if (SAFEGUARD_TRANSLATIONS[code]) {
    return SAFEGUARD_TRANSLATIONS[code][lang] || SAFEGUARD_TRANSLATIONS[code].en;
  }
  return null;
}

export function useLanguage() {
  const [lang, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(VERNACULAR_STORAGE_KEY) as Language | null;
      if (stored && (stored === 'en' || stored === 'hi' || stored === 'mr')) {
        setLangState(stored);
      }
    } catch {
      // ignore
    }

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        setLangState(customEvent.detail);
      } else {
        const stored = localStorage.getItem(VERNACULAR_STORAGE_KEY) as Language | null;
        if (stored) setLangState(stored);
      }
    };

    window.addEventListener('foodsafe:lang', handler);
    return () => window.removeEventListener('foodsafe:lang', handler);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(VERNACULAR_STORAGE_KEY, newLang);
      window.dispatchEvent(new CustomEvent('foodsafe:lang', { detail: newLang }));
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string): string => {
    return getTranslation(key, lang);
  }, [lang]);

  const getCheckText = useCallback((code: string): SafeguardTranslation | null => {
    return getCheckTranslation(code, lang);
  }, [lang]);

  return {
    lang,
    setLang,
    t,
    getCheckText,
    isLoaded: mounted
  };
}
