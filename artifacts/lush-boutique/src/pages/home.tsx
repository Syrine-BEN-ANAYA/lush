import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Instagram,
  ChevronRight,
  Heart,
  Languages,
  MessageCircle,
} from "lucide-react";
import heroImgStatic from "@/assets/hero.png";
import storyImgStatic from "@/assets/story.png";
import makeupImgStatic from "@/assets/makeup.png";
import skincareImgStatic from "@/assets/skincare.png";
import fragranceImgStatic from "@/assets/fragrance.png";
import { t, type Lang } from "@/lib/translations";

type ApiContent = {
  text: Record<string, { en: string | null; ar: string | null }>;
  images: Record<string, string>;
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [apiContent, setApiContent] = useState<ApiContent>({
    text: {},
    images: {},
  });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const T = t[lang];
  const isAr = lang === "ar";

  // Override a translation key with API value if available
  function tx(key: string, fallback: string): string {
    const parts = key.split(".");
    const section = parts[0] as keyof typeof T;
    const field = parts[1];
    const apiVal = apiContent.text[key];
    if (apiVal) {
      const v = lang === "en" ? apiVal.en : apiVal.ar;
      if (v) return v;
    }
    return fallback;
  }

  // Image sources — prefer API data URL over static asset
  const heroImg = apiContent.images["hero"] || heroImgStatic;
  const storyImg = apiContent.images["story"] || storyImgStatic;
  const makeupImg = apiContent.images["makeup"] || makeupImgStatic;
  const skincareImg = apiContent.images["skincare"] || skincareImgStatic;
  const fragranceImg = apiContent.images["fragrance"] || fragranceImgStatic;

  useEffect(() => {
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setApiContent(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isAr]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [lang]);

  return (
    <div
      className={`min-h-screen bg-background text-foreground overflow-x-hidden ${isAr ? "font-arabic" : ""}`}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div
          className={`font-serif text-2xl tracking-wide text-primary ${isAr ? "font-normal" : ""}`}
        >
          Lush <span className="text-foreground font-light">Boutique</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-muted-foreground">
          <a href="#story" className="hover:text-primary transition-colors">
            {T.nav.story}
          </a>
          <a
            href="#collection"
            className="hover:text-primary transition-colors"
          >
            {T.nav.collection}
          </a>
          <a href="#visit" className="hover:text-primary transition-colors">
            {T.nav.visit}
          </a>
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 text-xs border border-border rounded-full px-4 py-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300"
          >
            <Languages size={13} />
            {lang === "en" ? "العربية" : "English"}
          </button>
          <a
            href="https://www.instagram.com/lush_botiques"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary border border-primary px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Instagram size={14} />
            <span className="hidden sm:inline">{T.nav.follow}</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Lush Boutique"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pink-100/60 via-background/50 to-background"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/30 rounded-full px-5 py-2 text-primary text-xs uppercase tracking-widest mb-8 reveal-on-scroll">
            <MapPin size={12} />
            {T.hero.location}
          </div>
          <h1
            className="text-5xl md:text-7xl font-serif mb-6 leading-tight text-foreground reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            {tx("hero.title1", T.hero.title1)}
            <br />
            <span className="text-primary italic">
              {tx("hero.title2", T.hero.title2)}
            </span>
          </h1>
          <p
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-light reveal-on-scroll"
            style={{ transitionDelay: "200ms" }}
          >
            {tx("hero.subtitle", T.hero.subtitle)}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 reveal-on-scroll"
            style={{ transitionDelay: "300ms" }}
          >
            <a
              href="#collection"
              className="bg-primary text-white px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-primary/80 transition-all duration-300 flex items-center gap-2 justify-center"
            >
              {T.hero.cta}{" "}
              <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
            </a>
            <a
              href="#visit"
              className="border border-primary text-primary px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 text-center"
            >
              {T.hero.findUs}
            </a>
          </div>
        </div>
        <div
          className={`absolute bottom-10 ${isAr ? "left-6 md:left-12" : "right-6 md:right-12"} z-10 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-2xl px-5 py-4 shadow-lg shadow-primary/10 reveal-on-scroll flex items-center gap-3`}
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-primary text-primary" />
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {T.hero.rating}
            </p>
            <p className="text-xs text-muted-foreground">{T.hero.loved}</p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section
        id="story"
        className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="relative reveal-on-scroll">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl relative">
              <img
                src={storyImg}
                alt="Our story"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div
              className={`absolute -bottom-6 ${isAr ? "-left-6" : "-right-6"} bg-primary text-white rounded-2xl px-6 py-5 shadow-lg shadow-primary/30`}
            >
              <span className="text-3xl font-serif block">10+</span>
              <span className="text-xs uppercase tracking-widest opacity-90">
                {T.story.brands}
              </span>
            </div>
          </div>
          <div
            className="reveal-on-scroll"
            style={{ transitionDelay: "100ms" }}
          >
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">
              {T.story.tag}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight whitespace-pre-line">
              {tx("story.title", T.story.title)}
            </h2>
            <div className="space-y-5 text-muted-foreground font-light text-base">
              <p>{tx("story.p1", T.story.p1)}</p>
              <p>{tx("story.p2", T.story.p2)}</p>
            </div>
            <div className="mt-10 flex gap-8">
              <div>
                <p className="text-3xl font-serif text-primary">5.0</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {T.story.stars}
                </p>
              </div>
              <div className="w-px bg-border"></div>
              <div>
                <p className="text-3xl font-serif text-primary">
                  {T.story.daily}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {T.story.until}
                </p>
              </div>
              <div className="w-px bg-border"></div>
              <div>
                <p className="text-3xl font-serif text-primary">Bahla</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  Oman
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section
        id="collection"
        className="py-24 md:py-32 bg-secondary/40 relative"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">
              {T.collection.tag}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif">
              {tx("collection.title", T.collection.title)}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto font-light">
              {tx("collection.subtitle", T.collection.subtitle)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: T.collection.fragrance,
                img: fragranceImg,
                desc: T.collection.fragranceDesc,
                tag: T.collection.newArrivals,
              },
              {
                title: T.collection.skincare,
                img: skincareImg,
                desc: T.collection.skincareDesc,
                tag: T.collection.bestSellers,
              },
              {
                title: T.collection.makeup,
                img: makeupImg,
                desc: T.collection.makeupDesc,
                tag: T.collection.trending,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group cursor-pointer reveal-on-scroll bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/15 transition-all duration-500 border border-transparent hover:border-primary/20"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="aspect-square overflow-hidden relative">
                  <span
                    className={`absolute top-4 ${isAr ? "right-4" : "left-4"} z-10 bg-primary text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider`}
                  >
                    {item.tag}
                  </span>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-on-scroll">
          <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">
            {T.why.tag}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif">{T.why.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {T.why.items.map((item, i) => (
            <div
              key={i}
              className="bg-secondary/40 rounded-3xl p-8 reveal-on-scroll hover:bg-white hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 border border-transparent hover:border-primary/20"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="font-serif text-primary text-sm italic">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-xl font-serif mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-primary/5 border border-primary/20 rounded-3xl p-10 md:p-16 text-center reveal-on-scroll">
          <Heart size={24} className="text-primary mx-auto mb-6 fill-primary" />
          <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground max-w-2xl mx-auto leading-relaxed">
            {tx("why.testimonial", T.why.testimonial)}
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground uppercase tracking-widest">
            {tx("why.customer", T.why.customer)}
          </p>
        </div>
      </section>

      {/* Visit Us / Contact */}
      <section id="visit" className="py-24 md:py-32 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">
              {T.visit.tag}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif">{T.visit.title}</h2>
            <p className="text-muted-foreground mt-4 font-light">
              {tx("visit.subtitle", T.visit.subtitle)}
            </p>
          </div>
          {/* Map embed */}
          <div
            className="rounded-3xl overflow-hidden shadow-sm border border-primary/10 reveal-on-scroll mb-12"
            style={{ height: "360px" }}
          >
            <iframe
              title="Lush Boutique Location"
              src="https://maps.google.com/maps?q=Bahla+Oman&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 reveal-on-scroll">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1">
                    {T.visit.locationTitle}
                  </h4>
                  <p className="text-muted-foreground font-light text-sm">
                    {T.visit.locationAddress}
                  </p>
                  <a
                    href="https://maps.google.com/?q=Bahla+Oman"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline mt-2 inline-block"
                  >
                    {T.visit.directions}
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1">
                    {T.visit.hoursTitle}
                  </h4>
                  <p className="text-muted-foreground font-light text-sm">
                    {T.visit.hoursLine1}
                  </p>
                  <p className="text-muted-foreground font-light text-sm">
                    {T.visit.hoursLine2}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-primary/10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1">
                    {T.visit.contactTitle}
                  </h4>
                  <a
                    href="tel:+96898987442"
                    className="text-primary font-light text-sm hover:underline"
                  >
                    +968 9898 7442
                  </a>
                </div>
              </div>
            </div>
            <div
              className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-primary/10 reveal-on-scroll"
              style={{ transitionDelay: "100ms" }}
            >
              <h3 className="text-2xl font-serif mb-2">{T.visit.formTitle}</h3>
              <p className="text-muted-foreground text-sm font-light mb-8">
                {T.visit.formSubtitle}
              </p>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {T.visit.name}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder={T.visit.namePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {T.visit.phone}
                  </label>
                  <input
                    type="tel"
                    className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder={T.visit.phonePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    {T.visit.message}
                  </label>
                  <textarea
                    className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-primary transition-colors h-28 resize-none text-sm"
                    placeholder={T.visit.messagePlaceholder}
                  ></textarea>
                </div>
                <button className="w-full bg-primary text-white uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-primary/80 transition-colors duration-300 flex items-center justify-center gap-2">
                  {T.visit.send}{" "}
                  <ChevronRight
                    size={16}
                    className={isAr ? "rotate-180" : ""}
                  />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/96898987442"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-105 transition-all duration-300 group"
        aria-label="Chat on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-white flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="text-sm font-medium">WhatsApp</span>
      </a>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-serif text-2xl tracking-wide text-primary">
            Lush <span className="text-foreground font-light">Boutique</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a
              href="https://www.instagram.com/lush_botiques"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Instagram size={14} /> {T.footer.instagram}
            </a>
            <a
              href="https://wa.me/96898987442"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {T.footer.whatsapp}
            </a>
          </div>
          <div className="text-sm text-muted-foreground font-light">
            © {new Date().getFullYear()} {T.footer.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}
