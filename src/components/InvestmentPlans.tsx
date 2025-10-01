import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Plan {
  amount: number;
  duration: string;
  projectedProfit: number;
  profitPercentage: number;
  features: string[];
}

const plans: Plan[] = [
  {
    amount: 500,
    duration: '1 Month',
    projectedProfit: 75,
    profitPercentage: 15,
    features: ['Basic portfolio tracking', 'Email support', 'Monthly reports'],
  },
  {
    amount: 1000,
    duration: '1 Month',
    projectedProfit: 180,
    profitPercentage: 18,
    features: ['Advanced analytics', 'Priority support', 'Weekly reports', 'Risk management tools'],
  },
  {
    amount: 2000,
    duration: '1 Month',
    projectedProfit: 400,
    profitPercentage: 20,
    features: ['Premium analytics', '24/7 dedicated support', 'Daily reports', 'Advanced risk tools', 'Custom strategies'],
  },
];

const InvestmentPlans = () => {
  const handleSelectPlan = (amount: number) => {
    console.log(`Selected plan: $${amount}`);
    // TODO: Implement plan selection logic
  };

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Plans Grid Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Investment Plans
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your investment goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => (
          <Card 
            key={plan.amount} 
            className={`relative ${index === 1 ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {index === 1 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-3xl">${plan.amount}</CardTitle>
              <CardDescription>{plan.duration}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 crypto-card rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Projected Profit Gain</div>
                <div className="text-3xl font-bold text-primary">
                  +${plan.projectedProfit}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  ({plan.profitPercentage}% return)
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={index === 1 ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(plan.amount)}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Comparison Table Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Plan Comparison
        </h2>
        <p className="text-xl text-muted-foreground">
          Compare all features side by side
        </p>
      </div>

      <div className="crypto-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Plan</TableHead>
              <TableHead>Investment</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Projected Profit</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.amount}>
                <TableCell className="font-semibold">
                  {plan.amount === 500 && 'Starter'}
                  {plan.amount === 1000 && 'Professional'}
                  {plan.amount === 2000 && 'Premium'}
                </TableCell>
                <TableCell>${plan.amount}</TableCell>
                <TableCell>{plan.duration}</TableCell>
                <TableCell>
                  <span className="text-primary font-bold">+${plan.projectedProfit}</span>
                </TableCell>
                <TableCell>
                  <span className="text-primary font-semibold">{plan.profitPercentage}%</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectPlan(plan.amount)}
                  >
                    Activate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvestmentPlans;
