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
      title: 'Are all counters, floors, and prep areas clean and clutter-free right now?',
      why: 'Clean food preparation zones, counters, and floors prevent physical and microbial cross-contamination.',
      action: 'Halt preparation on affected counters; thoroughly sweep, wash, sanitize, and verify surfaces.'
    },
    hi: {
      title: 'क्या सभी काउंटर, फर्श और तैयारी क्षेत्र अभी साफ और व्यवस्थित हैं?',
      why: 'साफ तैयारी क्षेत्र और फर्श तैयार भोजन में बैक्टीरिया और गंदगी के प्रसार को रोकते हैं।',
      action: 'प्रभावित काउंटरों पर तैयारी रोकें; अच्छी तरह धोएं, सैनिटाइज करें और फिर से जांचें।'
    },
    mr: {
      title: 'सर्व काउंटर, मजला आणि कामाचे ओटे आता स्वच्छ व नीटनेटके आहेत का?',
      why: 'स्वच्छ कामाचे ओटे आणि मजला तयार अन्नामध्ये जंतू आणि कचरा पसरण्यापासून रोखतात.',
      action: 'बाधित काउंटरवर काम थांबवा; व्यवस्थित धुवा, सॅनिटाईज करा आणि खात्री करा.'
    }
  },
  'FS28-03': {
    en: {
      title: 'Are the kitchen drains flowing freely with no foul smell?',
      why: 'Blocked or dirty drains cause standing water, foul odors, and cockroach breeding.',
      action: 'Clear strainer baskets immediately; flush and degrease drains.'
    },
    hi: {
      title: 'क्या किचन की नालियां बिना दुर्गंध के सुचारू रूप से बह रही हैं?',
      why: 'जाम या गंदी नालियां दुर्गंध, गंदा पानी और तिलचट्टों के पनपने का कारण बनती हैं।',
      action: 'तुरंत जाली साफ करें; नालियों में डीग्रीजर डालकर तेज पानी से फ्लश करें।'
    },
    mr: {
      title: 'स्वयंपाकघरातील नाल्या दुर्गंधीशिवाय सुरळीत वाहत आहेत का?',
      why: 'तुंबलेल्या नाल्या दुर्गंधी, घाण पाणी आणि झुरळांच्या वाढीस कारणीभूत ठरतात.',
      action: 'जाळी त्वरित स्वच्छ करा; नाल्या गरम पाणी व डिग्रेसरने स्वच्छ करा.'
    }
  },
  'FS28-04': {
    en: {
      title: 'Are windows, doors, and fly-screens closed to keep pests out?',
      why: 'Intact physical barriers keep pests, rodents, and flies from entering food zones.',
      action: 'Close doors immediately; log repair request for damaged screens or sweeps.'
    },
    hi: {
      title: 'क्या खिड़कियां, दरवाजे और जालीदार स्क्रीन कीटों को रोकने के लिए बंद हैं?',
      why: 'मजबूत जालियां और बंद दरवाजे चूहों और मक्खियों को रसोई में घुसने नहीं देते।',
      action: 'दरवाजे तुरंत बंद करें; क्षतिग्रस्त जाली को तुरंत बदलने का कार्य-आदेश दें।'
    },
    mr: {
      title: 'कीटक आत येऊ नयेत म्हणून खिडक्या, दरवाजे आणि जाळ्या बंद आहेत का?',
      why: 'अखंड जाळ्या आणि बंद दरवाजे उंदीर, माश्या यांना अन्न क्षेत्रात येण्यापासून रोखतात.',
      action: 'दरवाजे त्वरित बंद करा; फाटलेल्या जाळ्या दुरुस्त करण्यासाठी नोंद करा.'
    }
  },
  'FS28-05': {
    en: {
      title: 'Did all staff wash their hands with soap before starting work?',
      why: 'Unwashed hands are the primary transmission vector of pathogens to food.',
      action: 'Instruct handler to stop, wash hands with soap for 20 seconds, and discard touched RTE food.'
    },
    hi: {
      title: 'क्या सभी कर्मचारियों ने काम शुरू करने से पहले साबुन से हाथ धोए?',
      why: 'गंदे हाथ भोजन में रोगाणुओं (बैक्टीरिया) के प्रसार का सबसे मुख्य कारण हैं।',
      action: 'कर्मचारी को तुरंत रोकें, 20 सेकंड तक साबुन से हाथ धुलवाएं और असुरक्षित भोजन हटाएं।'
    },
    mr: {
      title: 'सर्व कर्मचाऱ्यांनी काम सुरू करण्यापूर्वी साबणाने हात धुतले का?',
      why: 'अस्वच्छ हात अन्नामध्ये रोगजंतू पसरण्याचे मुख्य कारण आहेत.',
      action: 'कर्मचाऱ्याला त्वरित थांबवा, साबणाने २० सेकंद हात धुण्यास सांगा.'
    }
  },
  'FS28-06': {
    en: {
      title: 'Are all hand-wash sinks fully stocked with soap and drying towels/tissue?',
      why: 'Staff skip handwashing if sinks lack running water or soap.',
      action: 'Restock liquid soap and paper tissue immediately; unblock sink access.'
    },
    hi: {
      title: 'क्या सभी हैंड-वॉश सिंक में साबुन और सुखाने के तौलिये/टिशू उपलब्ध हैं?',
      why: 'यदि बेसिन में साबुन या पानी नहीं होगा तो कर्मचारी हाथ धोने में लापरवाही करेंगे।',
      action: 'लिक्विड सोप और साफ टिशू तुरंत भरें; बेसिन का रास्ता साफ रखें।'
    },
    mr: {
      title: 'सर्व हात धुण्याच्या सिंकमध्ये साबण आणि पुसण्यासाठी टॉवेल/टिशू उपलब्ध आहेत का?',
      why: 'बेसिनमध्ये पाणी किंवा साबण नसल्यास कर्मचारी हात धुणे टाळतात.',
      action: 'लिक्विड सोप आणि टिशू त्वरित ठेवा; वॉशबेसिन मोकळे करा.'
    }
  },
  'FS28-07': {
    en: {
      title: 'Is everyone on shift wearing a clean uniform, apron, and hairnet?',
      why: 'Street clothes and uncovered hair shed bacteria and foreign matter into dishes.',
      action: 'Provide clean apron/head net immediately; require staff to remove jewelry.'
    },
    hi: {
      title: 'क्या शिफ्ट में सभी ने साफ वर्दी, एप्रन और हेयरनेट पहना हुआ है?',
      why: 'बाल और गंदे कपड़े खाने में गिरकर भोजन को दूषित कर सकते हैं।',
      action: 'स्टाफ को तुरंत साफ हेयर नेट और एप्रन पहनाएं; अंगूठियां और घड़ियां उतरवाएं।'
    },
    mr: {
      title: 'शिफ्टमधील प्रत्येकाने स्वच्छ गणवेश, ॲप्रन आणि हेअरनेट घातले आहे का?',
      why: 'केस आणि कपड्यांची घाण अन्नात पडून ते दूषित होऊ शकते.',
      action: 'कर्मचाऱ्यास त्वरित स्वच्छ हेअर नेट आणि ॲप्रन द्या; दागिने काढण्यास सांगा.'
    }
  },
  'FS28-08': {
    en: {
      title: 'Are supervisor FoSTaC and staff training certificates (optional) up to date and available?',
      why: 'Staff food safety training is desirable and recommended to maintain hygiene.',
      action: 'Enrol supervisors and staff in desirable FoSTaC food safety training programs.'
    },
    hi: {
      title: 'क्या सुपरवाइजर FoSTaC और स्टाफ ट्रेनिंग सर्टिफिकेट (वैकल्पिक) उपलब्ध हैं?',
      why: 'स्टाफ ट्रेनिंग इच्छनीय और अनुशंसित है ताकि सुरक्षित भोजन नियम बने रहें।',
      action: 'इच्छानुसार सुपरवाइजर को FoSTaC प्रशिक्षण में नामांकित करें।'
    },
    mr: {
      title: 'सुपरवायझर FoSTaC आणि स्टाफ ट्रेनिंग सर्टिफिकेट (पर्यायी) उपलब्ध आहेत का?',
      why: 'कर्मचाऱ्यांचे प्रशिक्षण इच्छित आणि शिफारस केलेले आहे.',
      action: 'कर्मचाऱ्यांना FoSTaC प्रशिक्षण वर्गासाठी नोंदवा आणि नियम समजावून सांगा.'
    }
  },
  'FS28-09': {
    en: {
      title: 'Are staff medical fitness certificates and 6-monthly stool test records current?',
      why: 'Carriers of typhoid or hepatitis can silently infect hundreds of diners.',
      action: 'Exclude symptomatic staff; book medical check-up camp via providers.'
    },
    hi: {
      title: 'क्या स्टाफ के मेडिकल फिटनेस सर्टिफिकेट और 6-मासिक स्टूल टेस्ट रिकॉर्ड वैध हैं?',
      why: 'टाइफाइड या पीलिया से पीड़ित कर्मचारी ग्राहकों में गंभीर बीमारी फैला सकते हैं।',
      action: 'अस्वस्थ कर्मचारियों को किचन से हटाएं; अधिकृत लैब से मेडिकल कैंप बुक करें।'
    },
    mr: {
      title: 'कर्मचाऱ्यांचे वैद्यकीय प्रमाणपत्र आणि ६ महिन्यांचे स्टूल टेस्ट रेकॉर्ड वैध आहेत का?',
      why: 'टायफॉइड किंवा काविळीचे रुग्ण कर्मचारी ग्राहकांमध्ये आजार पसरवू शकतात.',
      action: 'आजारी कर्मचाऱ्यास तात्काळ बाजूला करा; लॅबकडून मेडिकल कॅम्प आयोजित करा.'
    }
  },
  'FS28-10': {
    en: {
      title: 'Were today’s raw materials checked for freshness and pests before accepting?',
      why: 'Preventing compromised, expired, or warm supplies protects the entire kitchen.',
      action: 'Reject compromised or warm delivery batches; record deviation in receiving log.'
    },
    hi: {
      title: 'क्या आज की कच्ची सामग्री को स्वीकारने से पहले ताजगी और कीटों की जांच की गई?',
      why: 'खराब या बासी सामग्री स्वीकार करने से तैयार भोजन विषाक्त हो सकता है।',
      action: 'गर्म या खराब पैकेजिंग वाले सामान को तुरंत वापस लौटाएं; रसीद पर नोट लिखें।'
    },
    mr: {
      title: 'आजच्या कच्च्या मालाची स्वीकारण्यापूर्वी ताजेपणा आणि कीटकांची तपासणी केली का?',
      why: 'खराब किंवा मुदत संपलेला माल स्वीकारल्यास अन्नात विषबाधा होऊ शकते.',
      action: 'अयोग्य तापमान किंवा खराब पॅकिंगचा माल त्वरित नाकारा.'
    }
  },
  'FS28-11': {
    en: {
      title: 'Is raw meat stored on the bottom shelves, completely away from vegetables and cooked food?',
      why: 'Raw meat juices drip bacteria directly onto cooked and ready-to-eat foods.',
      action: 'Store raw meats on bottom shelves; place cooked foods on top shelves.'
    },
    hi: {
      title: 'क्या कच्चा मांस सब्जियों और पके भोजन से दूर सबसे नीचे की शेल्फ पर रखा है?',
      why: 'कच्चे मांस का खून और पानी पके हुए भोजन पर टपकने से बैक्टीरिया फैलता है।',
      action: 'कच्चे मांस को हमेशा सबसे निचली शेल्फ पर रखें और तैयार भोजन को ऊपर ढंक कर रखें।'
    },
    mr: {
      title: 'कच्चे मांस भाज्या आणि शिजवलेल्या अन्नापासून दूर सर्वात खालच्या रॅकवर ठेवले आहे का?',
      why: 'कच्च्या मांसाचे थेंब तयार अन्नावर पडल्यास गंभीर संसर्ग होतो.',
      action: 'कच्चे मांस नेहमी खालच्या रॅकवर आणि तयार अन्न वरच्या रॅकवर झाकून ठेवा.'
    }
  },
  'FS28-12': {
    en: {
      title: 'Is all food stored in closed containers at least 6 inches off the floor?',
      why: 'Floor contact absorbs mop water, dirt, and exposes food to crawling insects.',
      action: 'Lift all food containers at least 15 cm (6 inches) off the floor on clean racks.'
    },
    hi: {
      title: 'क्या सारा खाना बंद डिब्बों में फर्श से कम से कम 6 इंच ऊपर रखा है?',
      why: 'फर्श पर रखने से पोछे का गंदा पानी और कीड़े-मकोड़े भोजन में पहुंच सकते हैं।',
      action: 'सभी बोरियों और डिब्बों को जमीन से 15 सेमी ऊपर रैक या पैलेट पर रखें।'
    },
    mr: {
      title: 'सर्व अन्न बंद डब्यांमध्ये जमिनीवरून किमान ६ इंच वर ठेवले आहे का?',
      why: 'जमिनीवर अन्न ठेवल्याने लादी पुसण्याचे पाणी व कीटक अन्नात शिरू शकतात.',
      action: 'सर्व अन्न डबे जमिनीपासून १५ सेमी वर रॅकवर किंवा पॅलेटवर ठेवा.'
    }
  },
  'FS28-13': {
    en: {
      title: 'Is all food labeled with a date, and is older stock pulled to the front to be used first?',
      why: 'Prevents serving expired, stale, or decomposed ingredients to customers.',
      action: 'Rotate shelves so earliest-expiry items are at the front; discard expired items.'
    },
    hi: {
      title: 'क्या सभी खाद्य पदार्थों पर तारीख लिखी है और पुराने स्टॉक को पहले इस्तेमाल किया जा रहा है?',
      why: 'यह सुनिश्चित करता है कि पुराना सामान पहले उपयोग हो और कोई बासी चीज न परोसी जाए।',
      action: 'पुरानी सामग्री को आगे लाएं; एक्सपायर हो चुकी सामग्री को तुरंत फेंकें।'
    },
    mr: {
      title: 'सर्व अन्नावर तारीख लिहिली आहे का आणि जुना साठा आधी वापरण्यासाठी पुढे काढला आहे का?',
      why: 'जुना माल आधी वापरला जातो आणि मुदत संपलेले अन्न ग्राहकांना जात नाही.',
      action: 'कमी मुदत असलेला माल पुढे ठेवा; मुदत संपलेले अन्न ताबडतोब फेकून द्या.'
    }
  },
  'FS28-15': {
    en: {
      title: 'Are fruits and vegetables thoroughly washed before chopping?',
      why: 'Raw produce carries soil, parasitic cysts, and pesticide chemical residues.',
      action: 'Wash in clean running water; sanitize with approved 50 ppm chlorine or veg wash.'
    },
    hi: {
      title: 'क्या फल और सब्जियों को काटने से पहले अच्छी तरह धोया गया है?',
      why: 'कच्चे सलाद और फलों पर मिट्टी, कीटनाशक और परजीवी होते हैं।',
      action: 'साफ बहते पानी में धोएं और 50 ppm क्लोरीन या फूड-ग्रेड वेज वॉश से सैनिटाइज करें।'
    },
    mr: {
      title: 'फळे आणि भाज्या कापण्यापूर्वी नीट धुतल्या आहेत का?',
      why: 'कच्च्या भाज्यांवर माती, कीटकनाशके आणि जंतू असू शकतात.',
      action: 'वाहत्या स्वच्छ पाण्यात धुवा आणि मान्य सॅनिटायझरने स्वच्छ करा.'
    }
  },
  'FS28-16': {
    en: {
      title: 'Are staff strictly using different colored cutting boards for raw meat vs. veg?',
      why: 'Using the same board for raw chicken and salad spreads deadly Salmonella.',
      action: 'Immediately replace wrong board/knife: Red (Meat), Yellow (Poultry), Green (Veg).'
    },
    hi: {
      title: 'क्या स्टाफ कच्चे मांस और सब्जियों के लिए अलग-अलग रंग के कटिंग बोर्ड इस्तेमाल कर रहा है?',
      why: 'कच्चे चिकन वाले बोर्ड पर सलाद काटने से साल्मोनेला बैक्टीरिया फैलता है।',
      action: 'रंग कोड का पालन करें: लाल (मांस), पीला (चिकन), हरा (सब्जी)। तुरंत बदलें।'
    },
    mr: {
      title: 'कर्मचारी कच्चे मांस आणि भाज्यांसाठी वेगवेगळ्या रंगांचे चॉपिंग बोर्ड वापरत आहेत का?',
      why: 'कच्च्या मांसाच्या बोर्डवर कोशिंबीर कापल्याने अन्नात गंभीर जंतुसंसर्ग होतो.',
      action: 'रंग कोड वापरा: लाल (मटण), पिवळा (चिकन), हिरवा (भाज्या). त्वरित बदला.'
    }
  },
  'FS28-17': {
    en: {
      title: 'Are shared tools like blenders and meat slicers washed immediately after use?',
      why: 'Dried food crust in blenders and slicers harbors active bacterial colonies.',
      action: 'Dismantle, wash in hot detergent water, sanitize, and air-dry equipment.'
    },
    hi: {
      title: 'क्या ब्लेंडर और स्लाइसर जैसे साझा उपकरणों को इस्तेमाल के तुरंत बाद धोया जाता है?',
      why: 'मिक्सर और कटर में जमा पुराना खाना बैक्टीरिया की नर्सरी बन जाता है।',
      action: 'मशीनों को खोलें, गर्म साबुन पानी से धोएं, सैनिटाइज करें और सुखाएं।'
    },
    mr: {
      title: 'ब्लेंडर आणि स्लायसरसारखी उपकरणे वापरल्यानंतर लगेच धुतली जातात का?',
      why: 'मिक्सर व स्लायसरमध्ये शिल्लक राहिलेले अन्न बॅक्टेरिया वाढवते.',
      action: 'उपकरणे सुटी करा, गरम पाण्याने व साबणाने धुवून सॅनिटाईज करा.'
    }
  },
  'FS28-18': {
    en: {
      title: 'Is all prepped food covered with lids or wrap while waiting for service?',
      why: 'Open containers expose cooked food to airborne dust, sneezes, and insects.',
      action: 'Cover all prep containers with tight lids or food-grade cling film.'
    },
    hi: {
      title: 'क्या सर्विस के इंतजार में तैयार सारा भोजन ढक्कन या रैप से ढका हुआ है?',
      why: 'खुले बर्तनों में मक्खियां, धूल और छींकने की बूंदें गिर सकती हैं।',
      action: 'सभी डिब्बों को ढक्कन या फूड-ग्रेड पारदर्शी पन्नी (क्लिंग रैप) से ढकें।'
    },
    mr: {
      title: 'सर्विसची वाट पाहत असलेले सर्व अन्न झाकणाने किंवा रॅपने झाकलेले आहे का?',
      why: 'उघड्या अन्नावर धूळ, माश्या आणि हवेतील जंतू पडू शकतात.',
      action: 'सर्व भांडी घट्ट झाकणाने किंवा फूड-ग्रेड क्लिन्ग फिल्मने झाकून ठेवा.'
    }
  },
  'FS28-19': {
    en: {
      title: 'Are all fridges reading below 5°C?',
      why: 'Temperatures above 5°C trigger rapid microbial multiplication in dairy and meats.',
      action: 'Adjust thermostat; service condensing coils; relocate food if temp exceeds 8°C.'
    },
    hi: {
      title: 'क्या सभी फ्रिज का तापमान 5°C से नीचे है?',
      why: '5°C से अधिक तापमान पर दूध, पनीर और मांस में बैक्टीरिया तेजी से बढ़ता है।',
      action: 'थर्मोस्टेट ठीक करें; यदि तापमान 8°C से ज्यादा है तो खाना दूसरे फ्रिज में रखें।'
    },
    mr: {
      title: 'सर्व फ्रीजचे तापमान ५ अंश से. पेक्षा कमी आहे का?',
      why: '५ अंश से. पेक्षा जास्त तापमानात दुग्धजन्य पदार्थ व मांसात जिवाणू वेगाने वाढतात.',
      action: 'कूलिंग सेटिंग तपासा; तापमान ८°C पेक्षा जास्त असल्यास अन्न हलवा.'
    }
  },
  'FS28-20': {
    en: {
      title: 'Are all freezers reading below -18°C?',
      why: 'Inadequate freezing permits bacterial enzymatic breakdown and ice recrystallization.',
      action: 'Initiate defrost cycle if iced over; verify door gasket seal; call refrigeration tech.'
    },
    hi: {
      title: 'क्या सभी डीप फ्रीजर का तापमान -18°C से नीचे है?',
      why: '−18°C से कम ठंड न होने पर फ्रोजन सामान पिघलकर खराब होने लगता है।',
      action: 'यदि बहुत बर्फ जमी है तो डीफ्रॉस्ट करें; रबर गैस्केट चेक करें।'
    },
    mr: {
      title: 'सर्व फ्रीझरचे तापमान -१८ अंश से. पेक्षा कमी आहे का?',
      why: 'योग्य थंडी नसल्यास गोठवलेले अन्न वितळून खराब होते.',
      action: 'फ्रीझर डीफ्रॉस्ट करा; दरवाजाचे रबर तपासा; दुरुस्ती तंत्रज्ञांना बोलवा.'
    }
  },
  'FS28-21': {
    en: {
      title: 'Is hot food reaching at least 75°C in the center?',
      why: 'Under-cooked poultry and reheated gravies allow live pathogens to survive.',
      action: 'Continue cooking until digital probe indicates core is ≥ 75°C for 15 seconds.'
    },
    hi: {
      title: 'क्या गर्म भोजन केंद्र (कोर) में कम से कम 75°C तक पहुंच रहा है?',
      why: 'अधपके मांस या ठीक से गर्म न की गई ग्रेवी में जीवित बैक्टीरिया बच जाते हैं।',
      action: 'भोजन को तब तक पकाएं जब तक कि केंद्र का तापमान 75°C तक न पहुंच जाए।'
    },
    mr: {
      title: 'गरम अन्नाचे गाभ्यातील तापमान किमान ७५ अंश से. पर्यंत पोहोचत आहे का?',
      why: 'अपूर्ण शिजवलेल्या मांसात आणि नीट गरम न केलेल्या ग्रेव्हीत जंतू जिवंत राहतात.',
      action: 'गाभ्याचे तापमान ७५ अंश से. होईपर्यंत अन्न व्यवस्थित शिजू द्या.'
    }
  },
  'FS28-22': {
    en: {
      title: 'Are hot foods split into shallow pans or chilled in an ice bath before refrigeration?',
      why: 'Slow cooling in large pots allows Bacillus cereus and Clostridium spores to germinate.',
      action: 'Divide into shallow pans, use ice-water bath, or blast chiller immediately.'
    },
    hi: {
      title: 'क्या गर्म खाने को फ्रिज में रखने से पहले उथले पैन में फैलाया या बर्फ के पानी में ठंडा किया गया?',
      why: 'बड़े बर्तनों में धीरे-धीरे ठंडा होने से विषाक्त बीजाणु पैदा होते हैं।',
      action: 'खाने को उथले पैन में फैलाएं, बर्फ के पानी के टब में रखें और तेजी से ठंडा करें।'
    },
    mr: {
      title: 'गरम अन्न फ्रीजमध्ये ठेवण्यापूर्वी उथळ भांड्यांमध्ये पसरले किंवा बर्फाच्या पाण्यात थंड केले का?',
      why: 'अन्न हळूहळू थंड झाल्यास अन्नात विषारी जंतूंची वाढ होते.',
      action: 'अन्न उथळ भांड्यांमध्ये पसरा किंवा बर्फाच्या पाण्यात ठेवून लगेच थंड करा.'
    }
  },
  'FS28-26': {
    en: {
      title: 'Are there zero signs of rats, cockroaches, or droppings in the kitchen today?',
      why: 'Cockroaches, flies, and rodents carry typhus, salmonella, and dysentery.',
      action: 'Seal entry crevice; quarantine affected room; summon licensed pest-control agency.'
    },
    hi: {
      title: 'क्या आज रसोई में चूहों, तिलचट्टों या लीद का कोई भी संकेत नहीं है?',
      why: 'तिलचट्टे, चूहे और मक्खियां साल्मोनेला और हैजा फैलाते हैं।',
      action: 'छेद तुरंत बंद करें; प्रभावित क्षेत्र को अलग करें; पेस्ट कंट्रोल को तुरंत बुलाएं।'
    },
    mr: {
      title: 'आज स्वयंपाकघरात उंदीर, झुरळे किंवा विष्ठेचे शून्य चिन्ह आहे का?',
      why: 'झुरळे, उंदीर आणि माश्या कॉलरा आणि विषबाधा पसरवतात.',
      action: 'सर्व बिळे बुजवा; पेस्ट कंट्रोल एजन्सीला तातडीने पाचारण करा.'
    }
  },
  'FS28-27': {
    en: {
      title: 'Are the fly-catchers turned on and pest-bait stations undisturbed?',
      why: 'Non-functional insect electrocutors or missing bait stations allow pest population outbreaks.',
      action: 'Replace UV tubes; clear catch trays; verify vendor monthly service report.'
    },
    hi: {
      title: 'क्या फ्लाई-कैचर चालू हैं और कीट-चारा स्टेशन बिना किसी रुकावट के ठीक हैं?',
      why: 'यदि फ्लाई किलर बंद होगा तो मक्खियों की संख्या अचानक बढ़ जाएगी।',
      action: 'फ्लाई किलर की यूवी लाइट बदलें, ट्रे साफ करें और वेंडर की मासिक रिपोर्ट देखें।'
    },
    mr: {
      title: 'फ्लाय-कॅचर चालू आहेत आणि कीटक-ट्रॅप व्यवस्थित आहेत का?',
      why: 'उपकरणे बंद असल्यास माश्या आणि किड्यांचे प्रमाण वाढते.',
      action: 'युव्ही ट्यूब तपासा, ट्रे रिकामी करा आणि सर्व्हिस लॉग अपडेट करा.'
    }
  },
  'FS28-28': {
    en: {
      title: 'Are all kitchen dustbins covered with a lid, and is the outside garbage area clean?',
      why: 'Uncovered garbage attracts flies, stray dogs, and creates foul smells.',
      action: 'Empty overflowing bins immediately; scrub and disinfect garbage collection dock.'
    },
    hi: {
      title: 'क्या सभी डस्टबिन ढक्कन से ढके हैं और बाहरी कचरा क्षेत्र साफ है?',
      why: 'खुले कूड़ेदान मक्खियों और चूहों को आकर्षित करते हैं और बदबू फैलाते हैं।',
      action: 'भरे हुए डस्टबिन तुरंत खाली करें; कूड़ेदान के आसपास फिनाइल से सफाई कराएं।'
    },
    mr: {
      title: 'सर्व डस्टबिन झाकणाने झाकलेले आहेत का आणि बाहेरील कचरा क्षेत्र स्वच्छ आहे का?',
      why: 'उघड्या कचऱ्यामुळे माश्या आणि दुर्गंधी वाढते.',
      action: 'डस्टबिन ताबडतोब रिकामी करा; कचरा संकलन जागा जंतुनाशकाने स्वच्छ करा.'
    }
  },
  'FS28-29': {
    en: {
      title: 'Bar: Is the inside of the ice machine clean, and is the ice scoop stored outside the ice?',
      why: 'Ice is consumed raw in drinks; mold and slimy bio-film inside machines contaminate ice.',
      action: 'Drain ice bin; sanitize walls with food-grade sanitizing wash; store scoop in holster.'
    },
    hi: {
      title: 'बार: क्या आइस मशीन अंदर से साफ है और आइस स्कूप बर्फ से बाहर रखा है?',
      why: 'बर्फ सीधे पेय में डाली जाती है; मशीन के अंदर फंगस और गंदगी से ग्राहक बीमार पड़ सकते हैं।',
      action: 'आइस मशीन खाली करके साफ करें; आइस स्कूप को कभी बर्फ के अंदर न छोड़ें।'
    },
    mr: {
      title: 'बार: बर्फ मशीन आतून स्वच्छ आहे का आणि बर्फ काढण्याचा चमचा बर्फाच्या बाहेर ठेवला आहे का?',
      why: 'बर्फ थेट पेयांमध्ये वापरला जातो; मशीनमधील बुरशीमुळे बर्फ दूषित होतो.',
      action: 'मशीन आतून स्वच्छ करा; बर्फ काढण्याचा चमचा बर्फात न ठेवता स्वतंत्र ठेवा.'
    }
  },
  'FS28-30': {
    en: {
      title: 'Bar: Are beer lines, drink nozzles, and drip trays wiped down and sanitized?',
      why: 'Yeast residue and beer stone breed wild bacteria in dispensing nozzles.',
      action: 'Flush beer lines with alkaline cleaner weekly; soak nozzles in sanitizing solution nightly.'
    },
    hi: {
      title: 'बार: क्या बीयर लाइनें, ड्रिंक नोजल और ड्रिप ट्रे पोंछकर सैनिटाइज की गई हैं?',
      why: 'बीयर पाइप और नोजल में बची हुई बीयर फंगस और बैक्टीरिया पैदा करती है।',
      action: 'बीयर लाइनों को केमिकल से फ्लश करें; हर रात नोजल को सैनिटाइजर में डुबोकर साफ करें।'
    },
    mr: {
      title: 'बार: बिअर लाइन्स, नोझल्स आणि ड्रिप ट्रे पुसून सॅनिटाईज केली आहेत का?',
      why: 'बिअरच्या नळ्यांमध्ये साचलेली घाण आणि यीस्टमुळे बॅक्टेरिया वाढतात.',
      action: 'बिअर लाइन्स स्वच्छ पाण्याने व केमिकलने फ्लश करा; नोझल स्वच्छ ठेवा.'
    }
  },
  'FS28-31': {
    en: {
      title: 'Cloud Kitchen: Are all outgoing delivery bags sealed shut so food cannot be tampered with?',
      why: 'Tamper-proof seals prevent delivery executives or external tampering during delivery.',
      action: 'Affix holographic tamper-evident seal across container seams; write pack time.'
    },
    hi: {
      title: 'क्लाउड किचन: क्या बाहर जाने वाले सभी डिलीवरी बैग सीलबंद हैं ताकि कोई छेड़छाड़ न हो सके?',
      why: 'सील बंद पैकेजिंग रास्ते में राइडर या किसी भी बाहरी छेड़छाड़ से भोजन को सुरक्षित रखती है।',
      action: 'हर कंटेनर पर मजबूत सुरक्षा सील लगाएं और पैकिंग का सही समय दर्ज करें।'
    },
    mr: {
      title: 'क्लाउड किचन: बाहेर जाणाऱ्या सर्व डिलिव्हरी बॅग्ज सीलबंद आहेत का जेणेकरून छेडछाड होणार नाही?',
      why: 'टॅम्पर-प्रूफ सीलमुळे डिलिव्हरी प्रवासात अन्नामध्ये कोणतीही छेडछाड होत नाही.',
      action: 'प्रत्येक पार्सलवर सुरक्षा सील लावा आणि डिस्पॅचची वेळ नोंदवा.'
    }
  },
  'FS28-32': {
    en: {
      title: 'Cloud Kitchen: Is food waiting for riders kept in hot/cold bags instead of sitting on the counter?',
      why: 'Food left waiting on ambient dispatch counters enters the danger zone (5°C to 60°C).',
      action: 'Hold hot orders in heated warmer (≥ 60°C); keep cold preps in chiller until rider handoff.'
    },
    hi: {
      title: 'क्लाउड किचन: क्या राइडर्स का इंतजार कर रहा खाना काउंटर पर रखने के बजाय हॉट/कोल्ड बैग में है?',
      why: 'काउंटर पर देर तक रखा खाना ठंडा होकर डेंजर ज़ोन में चला जाता है।',
      action: 'गर्म खाने को हॉट केस (≥ 60°C) में रखें; ठंडे खाने को राइडर आने तक फ्रिज में रखें।'
    },
    mr: {
      title: 'क्लाउड किचन: रायडर्सची वाट पाहणारे अन्न काउंटरवर ठेवण्याऐवजी हॉट/कोल्ड बॅगमध्ये ठेवले आहे का?',
      why: 'काउंटरवर उघडे राहिलेले अन्न धोकादायक तापमानात जाऊन खराब होऊ शकते.',
      action: 'गरम अन्न हॉट वॉर्मरमध्ये ठेवा आणि थंड पदार्थ फ्रीजमध्येच ठेवा.'
    }
  },
  'FS28-33': {
    en: {
      title: 'Catering: Is food traveling to the venue packed securely in insulated hot/cold boxes?',
      why: 'Traffic delays can let hot food drop below 60°C, causing spore outgrowth.',
      action: 'Use pre-heated Cambro insulated food boxes; record temps before load and upon arrival.'
    },
    hi: {
      title: 'केटरिंग: क्या वेन्यू तक ले जाया जा रहा खाना सुरक्षित इंसुलेटेड हॉट/कोल्ड बॉक्स में पैक है?',
      why: 'ट्रैफिक में देरी से खाना ठंडा होकर खराब हो सकता है।',
      action: 'इंसुलेटेड हॉट बॉक्स का उपयोग करें; गाड़ी में रखने और वेन्यू पर पहुंचने पर तापमान नापें।'
    },
    mr: {
      title: 'केटरिंग: कार्यक्रमाच्या ठिकाणी जाणारे अन्न इन्सुलेटेड हॉट/कोल्ड बॉक्समध्ये सुरक्षित पॅक केले आहे का?',
      why: 'वाहतुकीच्या विलंबाने अन्न थंड होऊन त्यात जंतू निर्माण होऊ शकतात.',
      action: 'इन्सुलेटेड बॉक्सेस वापरा; निघताना आणि पोहोचल्यावर तापमान तपासा.'
    }
  },
  'FS28-34': {
    en: {
      title: 'Catering: Is there a working hand-wash station and safe drinking water set up at the event?',
      why: 'Outdoor catering stalls often lack running water, causing cross-contamination epidemics.',
      action: 'Transport certified 20L potable water carboys; install hands-free gravity wash station.'
    },
    hi: {
      title: 'केटरिंग: क्या कार्यक्रम स्थल पर चालू हैंड-वॉश स्टेशन और सुरक्षित पीने का पानी उपलब्ध है?',
      why: 'इवेंट वेन्यू पर पानी न होने से कर्मचारी बिना हाथ धोए खाना परोसने लगते हैं।',
      action: 'प्रमाणित पीने का पानी साथ ले जाएं; स्टॉल पर साबुन और पानी वाला हैंडवाश स्टेशन लगाएं।'
    },
    mr: {
      title: 'केटरिंग: कार्यक्रमाच्या ठिकाणी चालू हात धुण्याचे स्टेशन आणि सुरक्षित पिण्याचे पाणी आहे का?',
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

