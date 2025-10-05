import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Shield, Award, CheckCircle, Globe } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Here you would integrate with your actual backend
    alert('Message sent successfully! We will get back to you soon.');
    setFormData({ firstName: '', lastName: '', subject: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contact & Support
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team of cryptocurrency investment professionals. 
            We're here to help you navigate the world of digital assets.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="partnership">Partnership Proposal</SelectItem>
                      <SelectItem value="press">Press & Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="mt-1"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Send Message
                </Button>

                <p className="text-xs text-muted-foreground">
                  We value your privacy. This form is secure, and we will never share your information 
                  with third parties. For account-specific issues, please avoid sending sensitive details.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Company Info & Trust Badges */}
          <div className="space-y-8">
            {/* Company Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>QuantumFortress Investments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Headquarters</p>
                    <p className="text-muted-foreground">7 Memorial Dr, Throop, PA 18512</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-muted-foreground">+1 (774) 202-9410</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Available Monday - Friday, 9:00 AM - 6:00 PM EST
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust & Credibility */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Trusted In The Industry
                  <Award className="h-5 w-5 text-primary" />
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  Displaying exemplary industry leaders. Our platform is committed to achieving these high standards.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Security */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Security Audited</p>
                      <p className="text-xs text-muted-foreground">CertiK & Secured with Ledger Vault</p>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Regulatory Compliance</p>
                      <p className="text-xs text-muted-foreground">Registered MSB (USA) • Travel Rule Compliant</p>
                    </div>
                  </div>

                  {/* Partnerships */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Industry Recognition</p>
                      <p className="text-xs text-muted-foreground">Binance Cloud • Circle USD Coin</p>
                    </div>
                  </div>

                  {/* Media */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Featured In</p>
                      <p className="text-xs text-muted-foreground">Cointelegraph • The Block • CoinDesk</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-center">
                    <span className="font-medium">Trusted by 50,000+ investors</span> worldwide for secure 
                    cryptocurrency investment solutions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;