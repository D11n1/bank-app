import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "How do I open a new account?",
    answer:
      "To open a new account, simply register on our platform. Once registered, you can request a new account from your dashboard. Our admin team will review your request and approve it promptly.",
  },
  {
    question: "What types of accounts do you offer?",
    answer:
      "We offer several account types including Checking, Savings, and Business accounts. Each account type comes with different features and benefits tailored to your specific needs.",
  },
  {
    question: "How do I deposit money into my account?",
    answer:
      "You can deposit money by submitting a deposit request from your dashboard. Our admin team will review and approve your deposit. We also support direct transfers from other accounts.",
  },
  {
    question: "What are the fees associated with my account?",
    answer:
      "Our basic accounts have no monthly maintenance fees. However, certain transactions like wire transfers may incur nominal fees. Please refer to our fee schedule for detailed information.",
  },
  {
    question: "How secure is my money with BankCo?",
    answer:
      "We employ bank-grade security measures including 256-bit encryption, multi-factor authentication, and continuous monitoring to ensure your funds and personal information remain secure.",
  },
  {
    question: "Can I access my account from my mobile device?",
    answer:
      "Yes, our platform is fully responsive and can be accessed from any device including smartphones and tablets. We're also working on dedicated mobile apps for iOS and Android.",
  },
  {
    question: "How do I transfer money between accounts?",
    answer:
      "You can transfer money between your accounts or to other BankCo customers through the Transfer section in your dashboard. Simply enter the recipient's account number and the amount.",
  },
  {
    question: "What is the KYC verification process?",
    answer:
      "KYC (Know Your Customer) verification helps us confirm your identity for security purposes. You'll need to provide personal information and upload a government-issued ID document for verification.",
  },
  {
    question: "How do I report suspicious activity on my account?",
    answer:
      "If you notice any suspicious activity, please contact our support team immediately at support@bankco.com or call our 24/7 hotline at +1 (800) 123-4567.",
  },
  {
    question: "Can I buy cryptocurrency through BankCo?",
    answer:
      "Yes, we offer cryptocurrency purchase services through our platform. You can buy various cryptocurrencies using funds from your BankCo account in the Crypto section of your dashboard.",
  },
];

export default function FAQPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            ← Back
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to the most common questions about our banking
              services.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-lg shadow-sm border p-2"
                >
                  <AccordionTrigger className="text-left font-medium text-lg px-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">
                Still have questions?
              </h2>
              <p className="mb-4">Our support team is here to help you.</p>
              <Button onClick={() => navigate("/contact")}>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
