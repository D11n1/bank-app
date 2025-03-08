import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Smartphone, Wallet, LineChart } from "lucide-react";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  onGetStarted?: () => void;
  isLoggedIn?: boolean;
  features?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Banking Made Simple",
  subtitle = "Secure, fast, and convenient banking solutions for your everyday needs",
  onGetStarted = () => {},
  isLoggedIn = false,
  features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Banking",
      description: "Bank anywhere, anytime with our secure mobile app",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Personal Loans",
      description: "Competitive rates for all your lending needs",
    },
    {
      icon: <LineChart className="w-8 h-8" />,
      title: "Smart Investments",
      description: "Grow your wealth with our investment solutions",
    },
  ],
}) => {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="w-full h-full"
          animate={{
            backgroundPosition: ["0px 0px", "100px 100px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 2px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">{subtitle}</p>
          <div className="flex flex-wrap gap-4">
            {!isLoggedIn && (
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 transform transition-transform hover:scale-105"
                onClick={onGetStarted}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform transition-all duration-300 hover:scale-105 hover:bg-white/20"
            >
              <div className="text-white mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-blue-100">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
