import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Search, 
  Trophy, 
  DollarSign, 
  Users, 
  Shield, 
  Calendar,
  TrendingUp,
  MessageSquare,
  Settings,
  Award
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'what-is-dayrade',
    question: 'What is Dayrade®?',
    answer: 'Dayrade® is a competitive trading tournament platform often described as an "eSport for day traders." It merges the thrill of live competition with the fast-paced nature of financial markets, offering multiple divisions, cash prizes, sponsored trading accounts, and an engaging environment for both newcomers and experienced traders.',
    category: 'Getting Started',
    tags: ['overview', 'platform', 'esports', 'trading']
  },
  {
    id: 'how-to-register',
    question: 'How do I register for a tournament?',
    answer: 'To register: 1) Visit dayrade.com and click "Purchase Tickets" 2) Select your desired tournament ticket 3) Complete the KYC process with SumSub 4) Purchase your ticket 5) Register for a Zimtra SIM trading account 6) Access the Dayrade® dashboard once confirmed. You\'ll receive email instructions for each step.',
    category: 'Getting Started',
    tags: ['registration', 'tickets', 'kyc', 'zimtra']
  },
  {
    id: 'kyc-process',
    question: 'What is the KYC process and why is it required?',
    answer: 'KYC (Know Your Customer) is mandatory for all participants. You\'ll receive an email from SumSub to: 1) Scan a QR code with your smartphone 2) Submit a clear photo of yourself and valid government ID 3) Complete a liveness check (rotate your head in a full circle). KYC ensures compliance with financial regulations and platform security.',
    category: 'Getting Started',
    tags: ['kyc', 'verification', 'sumsub', 'compliance']
  },

  // Tournament Divisions
  {
    id: 'elevator-division',
    question: 'What is the Elevator Division?',
    answer: 'The Elevator Division is a monthly simulation trading tournament perfect for beginners. It runs from the 1st through the end of each month with a $65 entry fee. The top 10% of participants earn a free ticket (valued at $69) to compete in the Crusader Tournament for real prizes.',
    category: 'Tournament Divisions',
    tags: ['elevator', 'beginner', 'simulation', 'monthly']
  },
  {
    id: 'crusader-division',
    question: 'What is the Crusader Division?',
    answer: 'The Crusader Division is a 3-day simulation trading tournament for intermediate traders. With a $65 entry fee, the top 10 winners receive $1,000 Zimtra trading accounts (no cash equivalent). It\'s ideal for experienced traders looking to compete for sponsored accounts.',
    category: 'Tournament Divisions',
    tags: ['crusader', 'intermediate', 'simulation', '3-day', 'zimtra']
  },
  {
    id: 'raider-division',
    question: 'What is the Raider Division?',
    answer: 'The Raider Division is a 5-day real-money professional trading tournament with a $1,500 entry fee. Prizes include: $50,000 cash + $250,000 Zimtra account for most profitable trader, $10,000 cash + $50,000 account for largest volume, and $10,000 cash + $50,000 account for single most profitable trade.',
    category: 'Tournament Divisions',
    tags: ['raider', 'professional', 'real-money', '5-day', 'cash-prizes']
  },

  // Trading Rules
  {
    id: 'trading-hours',
    question: 'What are the trading hours for tournaments?',
    answer: 'All tournaments follow US market hours: 9:30 AM - 4:00 PM EST. Trading is only allowed during these hours, and all positions must be closed by market close on the final day.',
    category: 'Trading Rules',
    tags: ['hours', 'market', 'schedule', 'est']
  },
  {
    id: 'raider-rules',
    question: 'What are the specific rules for Raider Division trading?',
    answer: 'Raider Division rules: Leverage 1:20, Maximum Loss $10,000, Maximum Daily Loss $5,000. You trade with real money in live accounts. All standard order types are allowed (market, limit, stop, etc.).',
    category: 'Trading Rules',
    tags: ['raider', 'leverage', 'limits', 'real-money']
  },
  {
    id: 'winning-criteria',
    question: 'How are winners determined?',
    answer: 'Winners are determined by pure P&L (Profit & Loss) performance. The trader with the highest net profit at the end of the tournament wins. In case of ties, the trader with the lower maximum drawdown wins.',
    category: 'Trading Rules',
    tags: ['winning', 'pnl', 'profit', 'drawdown']
  },

  // Prizes and Payouts
  {
    id: 'prize-payout',
    question: 'How and when are prizes paid out?',
    answer: 'Winners are announced after the final trading day\'s closing bell. A Zimtra or Dayrade® team member will contact winners to arrange prize transfers. Prizes are typically processed within 10 business days after confirmation of account details and required documentation.',
    category: 'Prizes and Payouts',
    tags: ['payout', 'winners', 'timeline', 'contact']
  },
  {
    id: 'tax-responsibility',
    question: 'Who is responsible for taxes on winnings?',
    answer: 'All taxes and fees related to prize winnings are the winner\'s responsibility. Dayrade® will provide necessary documentation for tax reporting purposes, but winners must handle their own tax obligations according to their local jurisdiction.',
    category: 'Prizes and Payouts',
    tags: ['taxes', 'responsibility', 'documentation', 'jurisdiction']
  },
  {
    id: 'zimtra-accounts',
    question: 'What are Zimtra trading accounts and how do they work?',
    answer: 'Zimtra trading accounts are sponsored accounts provided by our official partner. Winners keep all profits generated in these accounts. Zimtra offers 5,000+ active traders, no PDT restrictions, amplified buying power (10x+), and is regulated by the Cayman Islands Monetary Authority.',
    category: 'Prizes and Payouts',
    tags: ['zimtra', 'sponsored', 'accounts', 'profits', 'partner']
  },

  // Rewards Program
  {
    id: 'rewards-program',
    question: 'How does the Dayrade® Rewards Program work?',
    answer: 'Our tiered program rewards community engagement: Tier 1 (Community Engagement) - Free Crusader ticket for Discord/social participation. Tier 2 (Active Participation) - Affiliate link earning $20 per ticket sold. Tier 3 (Ambassador) - $1,000 funded Zimtra account for referring 10 people.',
    category: 'Rewards Program',
    tags: ['rewards', 'tiers', 'affiliate', 'referral', 'community']
  },
  {
    id: 'affiliate-earnings',
    question: 'How much can I earn through the affiliate program?',
    answer: 'You earn $20 for each ticket sold through your affiliate link. If you refer 10 ticket purchasers, you earn a $1,000 live trading account from Zimtra. There\'s no limit to how many people you can refer.',
    category: 'Rewards Program',
    tags: ['affiliate', 'earnings', 'referral', 'commission', 'unlimited']
  },

  // Technical Support
  {
    id: 'technical-issues',
    question: 'What if I experience technical issues during a tournament?',
    answer: 'Participants are responsible for their own equipment and internet connection. However, Dayrade® will address platform-wide outages or server failures. Contact support@dayrade.com immediately if you experience platform-related issues during a tournament.',
    category: 'Technical Support',
    tags: ['technical', 'issues', 'equipment', 'support', 'outages']
  },
  {
    id: 'platform-requirements',
    question: 'What are the technical requirements to participate?',
    answer: 'You need a stable internet connection, a modern web browser (Chrome, Firefox, Safari, Edge), and access to the Zimtra trading platform. Mobile devices are supported but desktop/laptop is recommended for optimal trading experience.',
    category: 'Technical Support',
    tags: ['requirements', 'browser', 'internet', 'zimtra', 'mobile']
  },

  // Account and Security
  {
    id: 'account-security',
    question: 'How is my account and trading data secured?',
    answer: 'Dayrade® uses industry-standard security measures including encrypted data transmission, secure authentication, and compliance with financial regulations. Your trading data is protected and only used for tournament purposes and platform improvement.',
    category: 'Account and Security',
    tags: ['security', 'encryption', 'data', 'compliance', 'protection']
  },
  {
    id: 'multiple-accounts',
    question: 'Can I have multiple Dayrade® accounts?',
    answer: 'No, you may only have one Dayrade® account per person. Multiple accounts are prohibited and may result in disqualification from tournaments and forfeiture of prizes.',
    category: 'Account and Security',
    tags: ['accounts', 'multiple', 'prohibited', 'disqualification', 'one-per-person']
  },

  // Rules and Conduct
  {
    id: 'prohibited-activities',
    question: 'What activities are prohibited during tournaments?',
    answer: 'Prohibited activities include: market manipulation, collusion with other participants, using bots or automated scripts, exploiting platform glitches, offensive conduct in chat, and any form of cheating. Violations result in warnings or immediate disqualification.',
    category: 'Rules and Conduct',
    tags: ['prohibited', 'manipulation', 'bots', 'cheating', 'disqualification']
  },
  {
    id: 'appeals-process',
    question: 'Can I appeal a disqualification decision?',
    answer: 'Yes, appeals are possible within 24 hours of receiving disqualification notice. Submit your appeal to support@dayrade.com with detailed explanation and any supporting evidence. All appeals are reviewed by the tournament committee.',
    category: 'Rules and Conduct',
    tags: ['appeals', 'disqualification', '24-hours', 'committee', 'evidence']
  },

  // Broadcasting and Media
  {
    id: 'streaming-rights',
    question: 'Can I stream my tournament participation?',
    answer: 'Yes, players can stream their gameplay with a mandatory 5-minute delay to ensure fair competition. Dayrade® also has rights to use player likeness for promotional purposes as outlined in the Terms of Service.',
    category: 'Broadcasting and Media',
    tags: ['streaming', 'delay', 'gameplay', 'promotion', 'likeness']
  },

  // Legal and Compliance
  {
    id: 'eligibility',
    question: 'Who is eligible to participate in Dayrade® tournaments?',
    answer: 'Participants must be 18+ (or age of majority if higher in their jurisdiction). Tournaments are available globally unless local laws prohibit participation. Employees and contractors of Dayrade® are ineligible to participate.',
    category: 'Legal and Compliance',
    tags: ['eligibility', '18+', 'global', 'employees', 'jurisdiction']
  },
  {
    id: 'governing-law',
    question: 'What laws govern Dayrade® tournaments?',
    answer: 'Tournaments are governed by Cayman Islands law. Any disputes are resolved in Cayman Islands courts. Participants must comply with all relevant laws and regulations in their local jurisdiction.',
    category: 'Legal and Compliance',
    tags: ['law', 'cayman-islands', 'disputes', 'jurisdiction', 'compliance']
  }
];

const categories = [
  { name: 'All', icon: HelpCircle, count: faqData.length },
  { name: 'Getting Started', icon: Users, count: faqData.filter(f => f.category === 'Getting Started').length },
  { name: 'Tournament Divisions', icon: Trophy, count: faqData.filter(f => f.category === 'Tournament Divisions').length },
  { name: 'Trading Rules', icon: TrendingUp, count: faqData.filter(f => f.category === 'Trading Rules').length },
  { name: 'Prizes and Payouts', icon: DollarSign, count: faqData.filter(f => f.category === 'Prizes and Payouts').length },
  { name: 'Rewards Program', icon: Award, count: faqData.filter(f => f.category === 'Rewards Program').length },
  { name: 'Technical Support', icon: Settings, count: faqData.filter(f => f.category === 'Technical Support').length },
  { name: 'Account and Security', icon: Shield, count: faqData.filter(f => f.category === 'Account and Security').length },
  { name: 'Rules and Conduct', icon: MessageSquare, count: faqData.filter(f => f.category === 'Rules and Conduct').length },
  { name: 'Broadcasting and Media', icon: Calendar, count: faqData.filter(f => f.category === 'Broadcasting and Media').length },
  { name: 'Legal and Compliance', icon: Shield, count: faqData.filter(f => f.category === 'Legal and Compliance').length }
];

const FAQ: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category for display
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <DashboardLayout
      sidebarExpanded={sidebarExpanded}
      onSidebarExpandedChange={setSidebarExpanded}
      isAuthenticated={true}
    >
      <main className="flex flex-col h-full">
        <div className="sr-only">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Dayrade tournaments and platform</p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredFAQs.length} results
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Categories */}
          <div className="w-64 border-r border-border bg-muted/20 p-4 overflow-y-auto">
            <h3 className="font-semibold text-sm text-foreground mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isActive = selectedCategory === category.name;
                
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className="text-xs"
                    >
                      {category.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No FAQs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedCategory === 'All' ? (
                  // Show grouped by category when "All" is selected
                  Object.entries(groupedFAQs).map(([categoryName, faqs]) => (
                    <motion.div
                      key={categoryName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center space-x-2">
                            {(() => {
                              const category = categories.find(c => c.name === categoryName);
                              const IconComponent = category?.icon || HelpCircle;
                              return <IconComponent className="w-5 h-5 text-primary" />;
                            })()}
                            <span>{categoryName}</span>
                            <Badge variant="secondary" className="ml-2">
                              {faqs.length} questions
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq) => (
                              <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger className="text-left hover:no-underline">
                                  <div className="flex items-start space-x-3">
                                    <HelpCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                    <span className="font-medium">{faq.question}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-7">
                                  <div className="space-y-3">
                                    <p className="text-muted-foreground leading-relaxed">
                                      {faq.answer}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {faq.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  // Show single category
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2">
                          {(() => {
                            const category = categories.find(c => c.name === selectedCategory);
                            const IconComponent = category?.icon || HelpCircle;
                            return <IconComponent className="w-5 h-5 text-primary" />;
                          })()}
                          <span>{selectedCategory}</span>
                          <Badge variant="secondary" className="ml-2">
                            {filteredFAQs.length} questions
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {filteredFAQs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                              <AccordionTrigger className="text-left hover:no-underline">
                                <div className="flex items-start space-x-3">
                                  <HelpCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                  <span className="font-medium">{faq.question}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-7">
                                <div className="space-y-3">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {faq.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Contact Support Card */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Still have questions?
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Can't find what you're looking for? Our support team is here to help.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a 
                          href="mailto:support@dayrade.com"
                          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </a>
                        <a 
                          href="https://discord.gg/dayrade"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                        >
                          Join Discord Community
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default FAQ;