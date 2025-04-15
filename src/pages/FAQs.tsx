import { motion } from "framer-motion";
import { Plus, Minus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/use-safe-navigation";

// FAQ category type
type FAQCategory = "general" | "account" | "features" | "privacy" | "support" | "payment" | "all";

// FAQ item interface
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory[];
}

const FAQs = () => {
  const { safeNavigate } = useSafeNavigation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("all");

  // Toggle FAQ item
  const toggleFAQ = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  // FAQ data
  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What is Emotions app?",
      answer: "Emotions is a digital platform focused on emotional wellness tracking, journaling, and connecting with mental health resources. Our app helps you monitor and understand your emotional health patterns, providing insights and tools to improve your overall well-being.",
      category: ["general"]
    },
    {
      id: 2,
      question: "Is Emotions a replacement for professional therapy?",
      answer: "No, Emotions is not a substitute for professional medical advice, diagnosis, or treatment. While our app can complement therapy by helping you track your emotional patterns and providing wellness resources, we always recommend seeking help from qualified mental health professionals for serious concerns.",
      category: ["general", "features"]
    },
    {
      id: 3,
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click the 'Sign Up' button at the top right of our homepage. You'll need to provide your email address, create a password, and fill in some basic profile information. Once completed, you'll receive a verification email to activate your account.",
      category: ["account"]
    },
    {
      id: 4,
      question: "What features does the mood tracker offer?",
      answer: "Our mood tracker allows you to record your emotional state multiple times a day using an intuitive interface. You can select from various mood options, add notes about what influenced your mood, track patterns over time through visual graphs, and receive insights about your emotional patterns.",
      category: ["features"]
    },
    {
      id: 5,
      question: "How does the journaling feature work?",
      answer: "The journaling feature provides a private space to document your thoughts and feelings. You can create daily entries, use guided prompts designed by mental health professionals, include mood tags, and even attach photos to your entries. All journal entries are securely stored and only accessible to you.",
      category: ["features"]
    },
    {
      id: 6,
      question: "Can I connect with therapists through the app?",
      answer: "Yes, our app includes a feature to connect with trained emotional wellness ambassadors and therapists. You can browse profiles, check qualifications and specialties, book appointments, and have virtual sessions directly through the platform. This feature helps make mental health support more accessible.",
      category: ["features", "support"]
    },
    {
      id: 7,
      question: "How is my personal data protected?",
      answer: "We take your privacy seriously. All personal data is encrypted both in transit and at rest. We implement robust security measures including secure authentication, regular security audits, and strict access controls. We never share your personal information with third parties without your explicit consent. For more details, please review our Privacy Policy and Data Protection Policy.",
      category: ["privacy"]
    },
    {
      id: 8,
      question: "Can I delete my account and all my data?",
      answer: "Yes, you have complete control over your data. You can delete your account at any time through the Settings page. When you delete your account, all your personal information, journal entries, and mood tracking data will be permanently removed from our systems after a 30-day grace period (in case you change your mind).",
      category: ["account", "privacy"]
    },
    {
      id: 9,
      question: "Is Emotions app free to use?",
      answer: "Emotions offers both free and premium plans. The free plan gives you access to basic mood tracking and journaling features. Our premium subscription unlocks advanced features like detailed mood analysis, unlimited journal entries with media attachments, priority access to wellness ambassadors, and exclusive guided exercises.",
      category: ["payment", "general"]
    },
    {
      id: 10,
      question: "How much does the premium subscription cost?",
      answer: "Our premium subscription is available at $9.99/month or $89.99/year (saving you over 25%). We also offer special discounts for students and healthcare workers. All subscriptions come with a 14-day free trial so you can experience all the premium features before committing.",
      category: ["payment"]
    },
    {
      id: 11,
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Yes, we offer a 30-day money-back guarantee for annual subscriptions. If you're not completely satisfied with our premium features, contact our support team within 30 days of purchase for a full refund. Monthly subscriptions can be canceled anytime but are not eligible for partial refunds.",
      category: ["payment", "support"]
    },
    {
      id: 12,
      question: "How do I book a session with an emotional wellness ambassador?",
      answer: "To book a session, navigate to the 'Ambassadors' section in the app, browse available professionals, and view their profiles including specialties and availability. Select your preferred ambassador, choose an available time slot, specify the type of session (video, audio, or chat), and confirm your booking. You'll receive a confirmation email with session details.",
      category: ["features", "support"]
    },
    {
      id: 13,
      question: "What types of emotional wellness resources are available?",
      answer: "Our app offers a diverse library of resources including guided meditations, breathing exercises, educational articles written by mental health professionals, self-help worksheets, mood improvement techniques, and community support groups. These resources are regularly updated and can be filtered by topic or emotional state.",
      category: ["features"]
    },
    {
      id: 14,
      question: "Is my journal content private?",
      answer: "Absolutely. Your journal entries are completely private and only accessible to you. We use end-to-end encryption to ensure that no one, including our staff, can access your journal content without your permission. Your private thoughts remain private.",
      category: ["privacy", "features"]
    },
    {
      id: 15,
      question: "How do I reset my password?",
      answer: "If you forget your password, click the 'Forgot Password' link on the login page. Enter the email address associated with your account, and we'll send you a password reset link. The link expires after 24 hours for security reasons. Follow the instructions in the email to create a new password.",
      category: ["account", "support"]
    },
    {
      id: 16,
      question: "Can I use Emotions on multiple devices?",
      answer: "Yes, Emotions is available across multiple platforms. You can access your account via our mobile apps (iOS and Android) or through our web application. Your data syncs automatically across all your devices, so you can switch seamlessly between them.",
      category: ["general", "features"]
    },
    {
      id: 17,
      question: "How do I join support groups?",
      answer: "To join a support group, navigate to the 'Help Groups' section in the app. Browse available groups filtered by topic (anxiety, depression, stress management, etc.). Click on a group to view details including meeting schedules and facilitator information. Click 'Join Group' to become a member and gain access to group discussions and virtual meetings.",
      category: ["features", "support"]
    },
    {
      id: 18,
      question: "What should I do in a mental health emergency?",
      answer: "Emotions app is not designed for emergency situations. If you or someone you know is experiencing a mental health emergency or having thoughts of self-harm, please contact emergency services (911 in the US), call the National Suicide Prevention Lifeline at 1-800-273-8255, or go to your nearest emergency room immediately.",
      category: ["support", "general"]
    },
    {
      id: 19,
      question: "Can I export my mood and journal data?",
      answer: "Yes, you can export your mood tracking data and journal entries at any time. Go to Settings > Data & Privacy > Export Data. You can choose to export in several formats (PDF, CSV, or JSON) and select the date range for the export. This feature is useful for sharing information with your healthcare provider or keeping personal backups.",
      category: ["features", "privacy"]
    },
    {
      id: 20,
      question: "How do I provide feedback or report a bug?",
      answer: "We value your feedback! To report a bug or suggest improvements, go to Settings > Help & Support > Send Feedback. Alternatively, you can email us directly at support@emotionsapp.org. Please provide as much detail as possible about any issues you encounter to help us resolve them quickly.",
      category: ["support"]
    }
  ];

  // Filter FAQs based on search query and active category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || faq.category.includes(activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple-light via-white to-brand-blue-light py-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-[#007BFF] rounded-full text-white text-sm font-medium mb-6 mx-auto"
          >
            <span className="text-white">Help Center</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#001A41] mb-4 font-jakarta"
          >
            Frequently Asked Questions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto mb-10"
          >
            Find answers to common questions about the Emotions app, our features, privacy practices, and more.
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-2xl mx-auto mb-12"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 rounded-lg border-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </motion.div>
        </div>
        
        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {(["all", "general", "account", "features", "privacy", "support", "payment"] as FAQCategory[]).map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={`rounded-full px-4 py-2 capitalize ${activeCategory === category ? "bg-[#007BFF]" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </motion.div>
        
        {/* FAQ Items */}
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredFAQs.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold text-gray-500 mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
            </motion.div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div 
                key={faq.id} 
                className="mb-4"
                variants={itemVariants}
              >
                <div 
                  className={`border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
                    activeIndex === index ? "border-blue-300 bg-white" : "border-gray-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <button
                    className="flex justify-between items-center w-full p-5 text-left"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="font-semibold text-lg text-[#001A41]">{faq.question}</h3>
                    <div className="flex-shrink-0 ml-4">
                      {activeIndex === index ? (
                        <Minus className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Plus className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-5 pt-0 text-gray-600 border-t border-gray-100">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {faq.category.map((cat) => (
                          <span 
                            key={cat} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCategory(cat);
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        
        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-3xl mx-auto mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-8 text-white shadow-md"
        >
          <h2 className="text-2xl font-bold mb-4 font-jakarta">Still have questions?</h2>
          <p className="mb-6 text-white/90">
            If you couldn't find the answer to your question, our support team is here to help.
          </p>
          <Button 
            variant="secondary" 
            className="bg-white text-blue-600 hover:bg-white/90"
            onClick={() => safeNavigate("/contact")}
          >
            Contact Support
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQs; 