import { useLanguage } from '../../hooks/useLanguage';

const policiesEn = [
  {
    title: 'Governance Principles for Bihar',
    dotColor: 'var(--azure)',
    items: [
      'Accountability — every AI system needs a human officer responsible for all outcomes',
      'Transparency — AI-assisted decisions must be explainable to citizens on request',
      'Inclusivity — AI tools must work in Hindi and local languages, not just English',
      'Oversight — no automated denial of public services; humans must stay in the loop',
    ],
  },
  {
    title: 'Ethical AI Guidelines We Advocate',
    dotColor: 'var(--saffron)',
    items: [
      'Bias audits mandatory before any AI tool is deployed that affects citizens',
      'Citizen data must not train external commercial AI models without consent',
      'All AI tools tested in Hindi and Bhojpuri before statewide rollout',
      "Alignment with India's DPDP Act 2023 and IndiaAI Safe & Trusted AI pillar",
    ],
  },
  {
    title: 'Data Privacy Standards',
    dotColor: 'var(--teal)',
    items: [
      'All citizen data under DPDP Act 2023 compliance framework',
      'Data minimisation — collect only what is necessary for the stated purpose',
      'Preference for data hosted on Indian state or national cloud infrastructure',
      'Annual review of all AI tools recommended on this platform',
    ],
  },
  {
    title: 'Responsible AI Resource Kit',
    dotColor: '#0d9488',
    items: [
      'AI Impact Assessment checklist for departments evaluating new tools',
      'AI Vendor Evaluation Guide for government procurement officers',
      'Citizen guide — what to do if AI affects your rights',
      'Open-source preferred policy for all tools we recommend on this platform',
    ],
  },
];

const policiesHi = [
  {
    title: 'बिहार के लिए शासन सिद्धांत',
    dotColor: 'var(--azure)',
    items: [
      'जवाबदेही — प्रत्येक AI प्रणाली को सभी परिणामों के लिए जिम्मेदार एक मानव अधिकारी की आवश्यकता होती है',
      'पारदर्शिता — अनुरोध पर नागरिकों को AI-सहायता प्राप्त निर्णयों की व्याख्या की जानी चाहिए',
      'समावेशिता — AI टूल्स को न केवल अंग्रेजी में, बल्कि हिंदी और स्थानीय भाषाओं में काम करना चाहिए',
      'निगरानी — सार्वजनिक सेवाओं का कोई स्वचालित इनकार नहीं; मनुष्यों को प्रक्रिया में रहना चाहिए',
    ],
  },
  {
    title: 'नैतिक AI दिशानिर्देश जिनकी हम वकालत करते हैं',
    dotColor: 'var(--saffron)',
    items: [
      'नागरिकों को प्रभावित करने वाले किसी भी AI टूल को तैनात करने से पहले पूर्वाग्रह ऑडिट अनिवार्य है',
      'नागरिक डेटा को सहमति के बिना बाहरी वाणिज्यिक AI मॉडल को प्रशिक्षित नहीं करना चाहिए',
      'राज्यव्यापी रोलआउट से पहले हिंदी और भोजपुरी में सभी AI टूल्स का परीक्षण किया गया',
      "भारत के DPDP अधिनियम 2023 और इंडिया AI सुरक्षित और विश्वसनीय AI स्तंभ के साथ संरेखण",
    ],
  },
  {
    title: 'डेटा गोपनीयता मानक',
    dotColor: 'var(--teal)',
    items: [
      'DPDP अधिनियम 2023 अनुपालन ढांचे के तहत सभी नागरिक डेटा',
      'डेटा न्यूनीकरण — केवल वही एकत्र करें जो घोषित उद्देश्य के लिए आवश्यक है',
      'भारतीय राज्य या राष्ट्रीय क्लाउड इंफ्रास्ट्रक्चर पर होस्ट किए गए डेटा को प्राथमिकता',
      'इस प्लेटफॉर्म पर अनुशंसित सभी AI टूल्स की वार्षिक समीक्षा',
    ],
  },
  {
    title: 'जिम्मेदार AI संसाधन किट',
    dotColor: '#0d9488',
    items: [
      'नए टूल्स का मूल्यांकन करने वाले विभागों के लिए AI प्रभाव आकलन चेकलिस्ट',
      'सरकारी खरीद अधिकारियों के लिए AI विक्रेता मूल्यांकन गाइड',
      'नागरिक मार्गदर्शिका — यदि AI आपके अधिकारों को प्रभावित करता है तो क्या करें',
      'इस प्लेटफॉर्म पर हमारे द्वारा अनुशंसित सभी टूल्स के लिए ओपन-सोर्स पसंदीदा नीति',
    ],
  },
];

export default function Policy() {
  const { lang, t } = useLanguage();
  const policyList = lang === 'hi' ? policiesHi : policiesEn;

  return (
    <div className="sec" id="policy">
      <div className="sec-eye"><div className="e-bar"></div>{t.policyEye}</div>
      <h2 className="sh">{t.policyTitle}</h2>
      <p className="ssub">{t.policySub}</p>
      <div className="g2">
        {policyList.map((pol, i) => (
          <div className="pb" key={i}>
            <h3>{pol.title}</h3>
            {pol.items.map((item, j) => (
              <div className="p-item" key={j}>
                <div className="p-dot" style={{ background: pol.dotColor }}></div>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
