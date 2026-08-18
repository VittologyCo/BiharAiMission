import { useLanguage } from '../../hooks/useLanguage';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="a-band" id="about">
      <div className="a-inner">
        <div>
          <h2>{t.aTitle}</h2>
          <p dangerouslySetInnerHTML={{ __html: t.aP1 }} />
          <p dangerouslySetInnerHTML={{ __html: t.aP2 }} />
        </div>
        <div className="a-facts">
          <div className="af">
            <div className="af-ico">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h4>{t.f1Title}</h4>
              <p>{t.f1Desc}</p>
            </div>
          </div>
          <div className="af">
            <div className="af-ico">
              <svg viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7z" />
                <path d="M6 12v5c3.33 2 4.67 2 6 2s2.67 0 6-2v-5" />
              </svg>
            </div>
            <div>
              <h4>{t.f2Title}</h4>
              <p>{t.f2Desc}</p>
            </div>
          </div>
          <div className="af">
            <div className="af-ico">
              <svg viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h4>{t.f3Title}</h4>
              <p>{t.f3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
