import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ContactForm from "./ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
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
            <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our banking services? Our team is here to
              help. Fill out the form below and we'll get back to you as soon as
              possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:support@bankco.com"
                        className="text-blue-600 hover:underline"
                      >
                        support@bankco.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href="tel:+18001234567"
                        className="text-blue-600 hover:underline"
                      >
                        +1 (800) 123-4567
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">
                        123 Financial Street
                        <br />
                        New York, NY 10001
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
