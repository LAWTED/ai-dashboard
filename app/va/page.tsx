"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Define proper types for content and list items
type DetailItem = string;

interface ContentListItem {
  subtitle: string;
  details: DetailItem[];
}

type SlideContent = string | ContentListItem[];

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: SlideContent;
}

// Define slide content
const slides: Slide[] = [
  {
    id: "intro",
    title: "Values Affirmation",
    subtitle: "A new way to enhance user well-being",
    content: "An open-source, plug-and-play intervention inspired by Geoffrey Cohen's work."
  },
  {
    id: "overview",
    title: "Introducing Values Affirmation",
    content: "An elegant psychological intervention designed to reduce stereotype threat, boost self-integrity, and improve user engagement."
  },
  {
    id: "features",
    title: "Thoughtfully Designed",
    content: [
      {
        subtitle: "Adaptable Framework",
        details: [
          "Reflect on core values through intuitive prompts",
          "Dynamic responses affirm identity and agency"
        ]
      },
      {
        subtitle: "Seamless Integration",
        details: [
          "Compatible with all major chatbot platforms",
          "Clean APIs for effortless implementation"
        ]
      },
      {
        subtitle: "Personalized Experience",
        details: [
          "Context-aware prompts for every situation",
          "Privacy-focused with optional anonymization"
        ]
      },
      {
        subtitle: "Research-Driven Design",
        details: [
          "Based on Cohen's groundbreaking studies",
          "Open-source for continuous improvement"
        ]
      }
    ]
  },
  {
    id: "use-cases",
    title: "Endless Possibilities",
    content: [
      {
        subtitle: "Education",
        details: ["Create anxiety-free learning environments"]
      },
      {
        subtitle: "Workplace",
        details: ["Deliver unbiased, supportive feedback"]
      },
      {
        subtitle: "Mental Health",
        details: ["Build resilience through self-affirmation"]
      }
    ]
  },
  {
    id: "academic",
    title: "Remarkable Outcomes",
    content: [
      {
        subtitle: "Enhanced Performance",
        details: [
          "Proven to reduce achievement gaps",
          "Scales effortlessly across digital platforms"
        ]
      },
      {
        subtitle: "Increased Resilience",
        details: [
          "Buffers stress during challenging tasks",
          "Reduces disengagement with subtle 'nudges'"
        ]
      },
      {
        subtitle: "Greater Equity",
        details: [
          "Mitigates algorithmic bias through self-affirmation"
        ]
      }
    ]
  },
  {
    id: "healthcare",
    title: "Revolutionary Healthcare Applications",
    content: [
      {
        subtitle: "Clinician Well-being",
        details: [
          "Reaffirms purpose in high-pressure environments",
          "Reduces emotional exhaustion significantly"
        ]
      },
      {
        subtitle: "Patient Engagement",
        details: [
          "Connects treatment to personal values",
          "Improves medication adherence by 20-30%"
        ]
      },
      {
        subtitle: "Mental Resilience",
        details: [
          "Reduces rumination and depressive symptoms",
          "Lowers perceived pain through value affirmation"
        ]
      }
    ]
  },
  {
    id: "research",
    title: "Expanding Frontiers",
    content: [
      {
        subtitle: "Clinical Trials",
        details: ["Compare efficacy across delivery methods"]
      },
      {
        subtitle: "Long-term Impact",
        details: ["Measure sustained outcomes over time"]
      }
    ]
  },
  {
    id: "open-source",
    title: "Designed for Everyone",
    content: [
      {
        subtitle: "Transparent Development",
        details: ["Community-reviewed for cultural sensitivity"]
      },
      {
        subtitle: "Universal Access",
        details: ["Deploy in any environment, regardless of resources"]
      }
    ]
  },
  {
    id: "demo",
    title: "Elegant Interaction",
    content: "\"Before your shift, take a moment to reflect on a value that guides your work.\" → [User responds] → \"Your commitment to [value] creates a meaningful impact.\""
  },
  {
    id: "conferences",
    title: "Target Conferences",
    content: [
      {
        subtitle: "CSCW 2025 (Norway)",
        details: [
          "Due July 9",
          "ACM SIGCHI Conference on Computer-Supported Cooperative Work & Social Computing"
        ]
      },
      {
        subtitle: "UbiComp / ISWC 2025 (Finland)",
        details: [
          "Due July 23",
          "ACM International Joint Conference on Pervasive and Ubiquitous Computing",
          "ACM International Symposium on Wearable Computing"
        ]
      },
      {
        subtitle: "UIST 2025 (Korea)",
        details: [
          "Due August 8",
          "ACM Symposium on User Interface Software and Technology"
        ]
      },
      {
        subtitle: "CHI 2026 (Spain)",
        details: [
          "Due September",
          "ACM Conference on Human Factors in Computing Systems"
        ]
      }
    ]
  }
];

export default function VAModule() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const nextSlide = () => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setDirection('next');
      setCurrentSlide(currentSlide + 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setDirection('prev');
      setCurrentSlide(currentSlide - 1);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const goToSlide = (index: number) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setDirection(index > currentSlide ? 'next' : 'prev');
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isTransitioning]);

  // Render list content if it's an array
  const renderContent = (content: SlideContent) => {
    if (Array.isArray(content)) {
      return content.map((item, idx) => (
        <div key={idx} className="mb-10 slide-in-element" style={{ animationDelay: `${idx * 0.15 + 0.3}s` }}>
          <h3 className="text-2xl font-medium mb-4 text-gray-800">{item.subtitle}</h3>
          <ul className="space-y-4">
            {item.details.map((detail: string, detailIdx: number) => (
              <li key={detailIdx} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <span className="text-xl text-gray-700 font-light leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ));
    }
    return <p className="text-2xl text-gray-700 font-light leading-relaxed slide-in-element">{content}</p>;
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white py-6 px-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-light tracking-tight">
          VA Module
        </Link>
        <div className="flex items-center space-x-6">
          <Link
            href="/va/demo"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300"
          >
            Try Demo
          </Link>
          <Link
            href="/va/docs"
            className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium transition-colors duration-300"
          >
            Documentation
          </Link>
          <span className="text-sm font-light opacity-70">Open Source</span>
        </div>
      </header>

      {/* Main slide content */}
      <main className="flex-grow flex flex-col justify-center px-12 md:px-32 py-16 max-w-7xl mx-auto w-full">
        <div
          className={`transform transition-all duration-700 ease-in-out
            ${isTransitioning ?
              (direction === 'next' ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12') :
              'opacity-100 translate-x-0'}`}
        >
          <div className="slide-in-element" style={{ animationDelay: "0s" }}>
            <h1 className="text-6xl font-semibold text-gray-900 tracking-tight mb-2">{slide.title}</h1>
            {slide.subtitle && <h2 className="text-3xl font-light text-gray-600 mb-10">{slide.subtitle}</h2>}
            {!slide.subtitle && <div className="mb-10"></div>}
          </div>

          <div className="slide-content">
            {renderContent(slide.content)}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <footer className="bg-white bg-opacity-90 backdrop-blur-lg border-t border-gray-100 py-6 px-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={prevSlide}
            className={`flex items-center text-gray-400 hover:text-gray-800 transition-colors duration-300 ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="mr-1 w-4 h-4" />
            <span className="text-sm">Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className={`flex items-center text-gray-400 hover:text-gray-800 transition-colors duration-300 ${currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={currentSlide === slides.length - 1}
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="ml-1 w-4 h-4" />
          </button>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in-element {
          animation: slideIn 0.7s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}