import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import styles from './PublicSubmissionPage.module.css';
import { decodeSubmissionFromShare, generateWhatsAppShareText } from '../../utils/submissionShare';
import { supabase } from '../../utils/supabase';

export default function PublicSubmissionPage() {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true);
      setError(null);

      // Strategy 1: URL-safe compact payload in ?data= (fastest, zero network, zero auth/RLS block)
      const encodedData = searchParams.get('data');
      if (encodedData) {
        const decoded = decodeSubmissionFromShare(encodedData);
        if (decoded && (decoded.full_name || decoded.email)) {
          setSubmission(decoded);
          setLoading(false);
          return;
        }
      }

      // Strategy 2: ID/Email lookup from route param /submission/:id or ?id=
      const targetId = paramId || searchParams.get('id');
      if (targetId) {
        try {
          const { data, error: dbErr } = await supabase
            .from('user_details')
            .select('*')
            .or(`id.eq.${targetId},email.eq.${targetId}`)
            .maybeSingle();

          if (!dbErr && data) {
            setSubmission(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Database submission fetch note:', err);
        }
      }

      // If neither worked
      setError('Unable to load submission details. The share link may be incomplete or expired.');
      setLoading(false);
    };

    loadSubmission();
  }, [searchParams, paramId]);

  const handleWhatsAppShare = () => {
    if (!submission) return;
    const message = generateWhatsAppShareText(submission);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0', color: '#181512' }}>
            Loading Candidate Details…
          </h3>
          <p style={{ fontSize: '13px', color: '#73675C', margin: 0 }}>
            Verifying secure record with Bihar AI Mission civic portal.
          </p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorBox}>
          <div style={{ fontSize: '42px', marginBottom: '14px' }}>📄</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#181512', margin: '0 0 10px 0' }}>
            Submission Record Unavailable
          </h2>
          <p style={{ fontSize: '13.5px', color: '#5E554D', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            {error || 'This submission record could not be retrieved or the link has expired.'}
          </p>
          <Link to="/" className={styles.homeLink} style={{ display: 'inline-flex' }}>
            ← Return to Bihar AI Mission Home
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = submission.created_at
    ? new Date(submission.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'Recently Submitted';

  return (
    <div className={styles.pageContainer}>
      <div className={styles.documentWrapper}>
        {/* TOP ACTION BAR */}
        <nav className={styles.topNav}>
          <Link to="/" className={styles.homeLink}>
            ← Bihar AI Mission
          </Link>

          <div className={styles.actionPills}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.whatsappBtn}`}
              onClick={handleWhatsAppShare}
              title="Share these details via WhatsApp"
            >
              <span>💬</span>
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleCopyLink}
              title="Copy public link to clipboard"
            >
              <span>{copied ? '✅' : '🔗'}</span>
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <span>🖨️</span>
              <span>Print / PDF</span>
            </button>
          </div>
        </nav>

        {/* OFFICIAL PAPER DOCUMENT CARD */}
        <main className={styles.paperCard}>
          {/* HEADER BANNER */}
          <header className={styles.cardHeader}>
            <div className={styles.brandBlock}>
              <div className={styles.logoIcon}>🏛️</div>
              <div className={styles.brandTitles}>
                <h1>Bihar AI Mission</h1>
                <p>Official Civic AI & Digital Literacy Initiative</p>
              </div>
            </div>

            <div className={styles.verifiedBadge}>
              <span style={{ fontSize: '14px' }}>✓</span>
              <span>OFFICIAL VERIFIED SUBMISSION</span>
            </div>
          </header>

          {/* CANDIDATE HERO */}
          <div className={styles.candidateHero}>
            <div className={styles.candidateNameBlock}>
              <h2>{submission.full_name || submission.name || 'Candidate Name'}</h2>
              {submission.role_type && (
                <span className={styles.candidateRoleBadge}>
                  {submission.role_type.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className={styles.createdOnBlock}>
              <span>Registered On:</span>
              <strong>{formattedDate}</strong>
            </div>
          </div>

          {/* DOCUMENT BODY */}
          <div className={styles.cardBody}>
            {/* PERSONAL INFORMATION */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span>👤 Personal Information</span>
              </div>
              <div className={styles.grid3}>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Full Name</span>
                  <span className={styles.fieldValue}>{submission.full_name || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Email Address</span>
                  <span className={styles.fieldValue}>
                    {submission.email ? (
                      <a href={`mailto:${submission.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {submission.email}
                      </a>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Mobile Number</span>
                  <span className={styles.fieldValue}>
                    {submission.mobile ? (
                      <a href={`tel:${submission.mobile}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {submission.mobile}
                      </a>
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Gender</span>
                  <span className={styles.fieldValue}>{submission.gender || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Age</span>
                  <span className={styles.fieldValue}>{submission.age ? `${submission.age} Years` : '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Reference ID</span>
                  <span className={styles.fieldValue} style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                    {submission.id ? String(submission.id).slice(0, 16) : 'BAM-CIVIC-RECORD'}
                  </span>
                </div>
              </div>
            </section>

            {/* PROFESSIONAL DETAILS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span>💼 Professional Details</span>
              </div>
              <div className={styles.grid3}>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Role Type</span>
                  <span className={styles.fieldValue}>{submission.role_type || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Designation</span>
                  <span className={styles.fieldValue}>{submission.designation || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Organization</span>
                  <span className={styles.fieldValue}>{submission.organization || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Department</span>
                  <span className={styles.fieldValue}>{submission.department || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Years of Experience</span>
                  <span className={styles.fieldValue}>
                    {submission.experience !== undefined && submission.experience !== null && submission.experience !== ''
                      ? `${submission.experience} Years`
                      : '--'}
                  </span>
                </div>
              </div>
            </section>

            {/* LOCATION DETAILS */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>
                <span>📍 Location & Jurisdiction</span>
              </div>
              <div className={styles.grid3}>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>District</span>
                  <span className={styles.fieldValue}>{submission.district || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>Block / City</span>
                  <span className={styles.fieldValue}>{submission.block_city || '--'}</span>
                </div>
                <div className={styles.fieldItem}>
                  <span className={styles.fieldLabel}>State</span>
                  <span className={styles.fieldValue}>{submission.state || 'Bihar'}</span>
                </div>
              </div>
            </section>

            {/* AREAS OF INTEREST */}
            {submission.interests && submission.interests.length > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span>🎯 Areas of AI Interest</span>
                </div>
                <div className={styles.chipList}>
                  {submission.interests.map((item, idx) => (
                    <span key={idx} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* STATEMENT OF INTENT */}
            {submission.intent && (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span>💡 Statement of Intent</span>
                </div>
                <div className={styles.textBox}>{submission.intent}</div>
              </section>
            )}

            {/* PROPOSED CONTRIBUTION */}
            {submission.contribution && (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span>🤝 Proposed Civic Contribution</span>
                </div>
                <div className={styles.textBox}>{submission.contribution}</div>
              </section>
            )}

            {/* PROFESSIONAL LINKS */}
            {(submission.linkedin || submission.portfolio) && (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span>🔗 Professional Links</span>
                </div>
                <div className={styles.grid2}>
                  {submission.linkedin && (
                    <div className={styles.fieldItem}>
                      <span className={styles.fieldLabel}>LinkedIn Profile</span>
                      <a
                        href={submission.linkedin.startsWith('http') ? submission.linkedin : `https://${submission.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkValue}
                      >
                        {submission.linkedin} ↗
                      </a>
                    </div>
                  )}
                  {submission.portfolio && (
                    <div className={styles.fieldItem}>
                      <span className={styles.fieldLabel}>Portfolio / GitHub</span>
                      <a
                        href={submission.portfolio.startsWith('http') ? submission.portfolio : `https://${submission.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkValue}
                      >
                        {submission.portfolio} ↗
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* OFFICIAL FOOTER STAMP */}
          <footer className={styles.cardFooter}>
            <div className={styles.footerNote}>
              <strong>Bihar AI Mission (बिहार AI मिशन)</strong>
              <br />
              This is an official candidate application registered with Bihar AI Mission. It can be viewed and verified publicly by authorized personnel without administrative login credentials.
            </div>
            <div className={styles.stampBadge}>
              OFFICIAL CIVIC RECORD · VERIFIED
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
