import { getPackages, getServices, getFaq } from '@/lib/queries';
import { fetchWind } from '@/lib/openmeteo';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import About from '@/components/About';
import Lessons from '@/components/Lessons';
import Trust from '@/components/Trust';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import Spot from '@/components/Spot';
import Reviews from '@/components/Reviews';
import Stay from '@/components/Stay';
import Kitchen from '@/components/Kitchen';
import Faq from '@/components/Faq';
import Instagram from '@/components/Instagram';
import Booking from '@/components/Booking';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

type Locale = 'tr' | 'en' | 'bg' | 'ro';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;

  const [wind, packages, services, faq] = await Promise.all([
    fetchWind(),
    getPackages(loc),
    getServices(loc),
    getFaq(loc),
  ]);

  return (
    <>
      <Nav />
      <main>
        <Hero wind={wind} />
        <Stats />
        <About />
        <Lessons packages={packages} />
        <Trust />
        <Services services={services} />
        <Gallery />
        <Spot />
        <Reviews />
        <Stay />
        <Kitchen />
        <Faq faq={faq} />
        <Instagram />
        <Booking />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
