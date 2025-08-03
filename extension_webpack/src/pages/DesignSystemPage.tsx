import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Header from '../components/ui/Header';

const DesignSystemPage: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <Header title="Design System" />

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Buttons</h2>
        <div className="flex space-x-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Inputs</h2>
        <div className="space-y-4">
          <Input placeholder="Standard Input" />
          <Input placeholder="Error Input" error />
        </div>
      </Card>
    </div>
  );
};

export default DesignSystemPage;
