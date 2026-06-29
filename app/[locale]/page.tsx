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

export default async function HomePage() {
  const wind = await fetchWind();

  return (
    <>
      <Nav />
      <main>
        <Hero wind={wind} />
        <Stats />
        <About />
        <Lessons />
        <Trust />
        <Services />
        <Gallery />
        <Spot />
        <Reviews />
        <Stay />
        <Kitchen />
        <Faq />
        <Instagram />
        <Booking />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
