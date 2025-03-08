import React from "react";
import { Card } from "./ui/card";
import { Shield, Lock, Award, CheckCircle } from "lucide-react";

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SecurityFeaturesProps {
  features?: SecurityFeature[];
}

const defaultFeatures: SecurityFeature[] = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "Bank-Grade Security",
    description:
      "256-bit encryption protecting all your transactions and personal data",
  },
  {
    icon: <Lock className="w-8 h-8 text-blue-600" />,
    title: "Secure Authentication",
    description: "Multi-factor authentication and biometric login options",
  },
  {
    icon: <Award className="w-8 h-8 text-blue-600" />,
    title: "Certified Protection",
    description: "FDIC insured and compliant with all banking regulations",
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
    title: "24/7 Monitoring",
    description: "Continuous surveillance and fraud detection systems",
  },
];

const SecurityFeatures = ({
  features = defaultFeatures,
}: SecurityFeaturesProps) => {
  return (
    <section className="w-full min-h-[400px] bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bank-Grade Security
          </h2>
          <p className="text-lg text-gray-600">
            Your security is our top priority. We employ the latest technology
            to keep your money safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityFeatures;
