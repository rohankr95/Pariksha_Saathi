export type QuizOption = { label: string; categories: string[] };
export type QuizQuestion = { question: string; options: QuizOption[] };

// Categories map loosely to common CareerRoadmap titles/streams so results
// can be matched against whatever roadmaps the admin has published.
export const CAREER_QUIZ: QuizQuestion[] = [
  {
    question: "आपको सबसे ज़्यादा किस विषय में मज़ा आता है?",
    options: [
      { label: "गणित और भौतिक विज्ञान", categories: ["इंजीनियरिंग", "Computer Science"] },
      { label: "जीव विज्ञान", categories: ["मेडिकल", "Nursing"] },
      { label: "इतिहास और राजनीति विज्ञान", categories: ["सिविल सेवा", "कानून"] },
      { label: "व्यापार और लेखा", categories: ["कॉमर्स", "बैंकिंग"] },
    ],
  },
  {
    question: "खाली समय में आप क्या करना पसंद करते हैं?",
    options: [
      { label: "मशीनें या गैजेट ठीक करना", categories: ["इंजीनियरिंग", "पॉलिटेक्निक"] },
      { label: "लोगों की मदद करना / सेवा", categories: ["मेडिकल", "शिक्षण"] },
      { label: "बहस या वाद-विवाद", categories: ["कानून", "सिविल सेवा"] },
      { label: "चित्रकारी या डिज़ाइन", categories: ["कला एवं डिज़ाइन"] },
    ],
  },
  {
    question: "आप किस प्रकार का काम पसंद करेंगे?",
    options: [
      { label: "अनुशासित, वर्दी में", categories: ["रक्षा सेवा", "सिविल सेवा"] },
      { label: "प्रयोगशाला / अनुसंधान", categories: ["मेडिकल", "इंजीनियरिंग"] },
      { label: "कक्षा में पढ़ाना", categories: ["शिक्षण"] },
      { label: "कंप्यूटर पर कोडिंग", categories: ["Computer Science", "इंजीनियरिंग"] },
    ],
  },
  {
    question: "परीक्षा में कौन सा विषय सबसे आसान लगता है?",
    options: [
      { label: "गणित", categories: ["इंजीनियरिंग", "बैंकिंग"] },
      { label: "जीव विज्ञान", categories: ["मेडिकल", "कृषि"] },
      { label: "अर्थशास्त्र / वाणिज्य", categories: ["कॉमर्स"] },
      { label: "भाषा और सामाजिक विज्ञान", categories: ["सिविल सेवा", "कला एवं डिज़ाइन"] },
    ],
  },
  {
    question: "आप कैसा भविष्य चाहते हैं?",
    options: [
      { label: "सरकारी स्थायी नौकरी", categories: ["सिविल सेवा", "बैंकिंग", "रक्षा सेवा"] },
      { label: "उच्च वेतन वाली तकनीकी नौकरी", categories: ["इंजीनियरिंग", "Computer Science"] },
      { label: "समाज सेवा से जुड़ा काम", categories: ["मेडिकल", "शिक्षण", "Nursing"] },
      { label: "अपना व्यवसाय", categories: ["कॉमर्स", "कृषि"] },
    ],
  },
  {
    question: "टीम वर्क या अकेले काम?",
    options: [
      { label: "बड़ी टीम के साथ", categories: ["इंजीनियरिंग", "सिविल सेवा"] },
      { label: "एक-एक व्यक्ति की मदद करना", categories: ["मेडिकल", "Nursing", "शिक्षण"] },
      { label: "स्वतंत्र रूप से", categories: ["कला एवं डिज़ाइन", "कॉमर्स"] },
      { label: "कोई फर्क नहीं पड़ता", categories: ["कानून", "बैंकिंग"] },
    ],
  },
  {
    question: "कौन सा दृश्य आपको सबसे अच्छा लगता है?",
    options: [
      { label: "अस्पताल / क्लीनिक", categories: ["मेडिकल", "Nursing"] },
      { label: "निर्माण स्थल / फैक्ट्री", categories: ["इंजीनियरिंग", "पॉलिटेक्निक"] },
      { label: "कोर्ट रूम", categories: ["कानून"] },
      { label: "खेत / कृषि भूमि", categories: ["कृषि"] },
    ],
  },
  {
    question: "आप किस प्रकार की परीक्षा देना पसंद करेंगे?",
    options: [
      { label: "JEE / NEET जैसी", categories: ["इंजीनियरिंग", "मेडिकल"] },
      { label: "UPSC / राज्य PSC", categories: ["सिविल सेवा"] },
      { label: "बैंकिंग / SSC / रेलवे", categories: ["बैंकिंग"] },
      { label: "NDA / CDS", categories: ["रक्षा सेवा"] },
    ],
  },
  {
    question: "आपको किस तरह की जिम्मेदारी पसंद है?",
    options: [
      { label: "जीवन बचाना", categories: ["मेडिकल", "Nursing"] },
      { label: "नई चीजें बनाना/डिज़ाइन करना", categories: ["इंजीनियरिंग", "कला एवं डिज़ाइन"] },
      { label: "अगली पीढ़ी को शिक्षित करना", categories: ["शिक्षण"] },
      { label: "न्याय दिलाना", categories: ["कानून"] },
    ],
  },
  {
    question: "आपके परिवार/शिक्षक आपको किस क्षेत्र में सफल मानते हैं?",
    options: [
      { label: "विज्ञान और तकनीक", categories: ["इंजीनियरिंग", "Computer Science"] },
      { label: "सेवा और करुणा", categories: ["मेडिकल", "शिक्षण"] },
      { label: "नेतृत्व और प्रशासन", categories: ["सिविल सेवा", "रक्षा सेवा"] },
      { label: "व्यापार बुद्धि", categories: ["कॉमर्स", "बैंकिंग"] },
    ],
  },
];
