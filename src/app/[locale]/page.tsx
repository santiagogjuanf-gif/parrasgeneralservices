import HeroSection from '@/components/home/HeroSection'
import TrustBadges from '@/components/home/TrustBadges'
import HowWeWork from '@/components/home/HowWeWork'
import ServicesPreview from '@/components/home/ServicesPreview'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import CTABanner from '@/components/home/CTABanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <HowWeWork />
      <ServicesPreview />
      <WhyChooseUs />
      <CTABanner />
    </>
  )
}
