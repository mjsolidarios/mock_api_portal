"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function DiscoverMotion() {
  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(
        [
          ".shell-header",
          ".discover-eyebrow",
          ".discover-headline",
          ".dishero-lede",
          ".discover-hero-actions",
          ".discover-features-panel",
          ".discover-featured-copy",
          ".discover-shelf-card"
        ],
        { clearProps: "all", opacity: 1 }
      );
      return;
    }

    gsap.set(".store-discover", { autoAlpha: 1 });

    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .from(".shell-header", { y: -18, duration: 0.55 })
      .from(".discover-hero-media img", { scale: 1.08, duration: 1.25 }, 0)
      .from(".discover-eyebrow", { y: 14, duration: 0.48 }, 0.16)
      .from(".discover-headline", { y: 24, duration: 0.72 }, 0.24)
      .from(".dishero-lede", { y: 16, duration: 0.54 }, 0.38)
      .from(".discover-hero-actions > *", { y: 14, stagger: 0.08, duration: 0.48 }, 0.5)
      .from(".discover-features-panel", { y: 28, duration: 0.62 }, 0.58)
      .from(".discover-feature", { y: 0, stagger: 0.06, duration: 0.44 }, 0.72);

    gsap.to(".discover-hero-media", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".store-discover",
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      }
    });

    gsap.to(".discover-hero-media img", {
      scale: 1.12,
      ease: "none",
      scrollTrigger: {
        trigger: ".discover-hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.from(".discover-featured-copy > *", {
      x: -26,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".discover-featured",
        start: "top 85%",
        once: true
      }
    });

    gsap.from(".discover-shelf-card", {
      y: 46,
      rotateX: 7,
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".discover-shelf",
        start: "top 88%",
        once: true
      },
      onComplete: () => {
        gsap.set(".discover-shelf-card", { clearProps: "transform" });
      }
    });

    gsap.to(".discover-shelf-card", {
      y: (index) => index * -10,
      ease: "none",
      scrollTrigger: {
        trigger: ".discover-featured",
        start: "top 76%",
        end: "bottom top",
        scrub: 0.6
      }
    });

    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return null;
}
