
import PublicHeader from '@/components/public/PublicHeader';
import HeroSection from '@/components/public/HeroSection';
import HighlightsSection from '@/components/public/HighlightsSection';
import AdmissionInfoSection from '@/components/public/AdmissionInfoSection';
import EnquiryFormSection from '@/components/public/EnquiryFormSection';
import PublicNoticeboardPreview from '@/components/public/PublicNoticeboardPreview';
import PublicEventsPreview from '@/components/public/PublicEventsPreview';
import PublicGalleryPreview from '@/components/public/PublicGalleryPreview';
import ActiveFormsSection from '@/components/public/ActiveFormsSection';
import ContactUsSection from '@/components/public/ContactUsSection';
import PublicFooter from '@/components/public/PublicFooter';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-grow">
        <HeroSection />
        <HighlightsSection />
        <AdmissionInfoSection />
        <EnquiryFormSection />
        <ActiveFormsSection />
        <PublicNoticeboardPreview />
        <PublicEventsPreview />
        <PublicGalleryPreview />
        <ContactUsSection />
      </main>
      <PublicFooter />
    </div>
  );
}
