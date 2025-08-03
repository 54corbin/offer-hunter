import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface PasscodeComponentProps {
  onUnlock: (passcode: string) => void;
}

const PasscodeComponent: React.FC<PasscodeComponentProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState("");

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUnlock(passcode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Enter Passcode</h2>
            <p className="mt-2 text-sm text-gray-600">
              This extension is locked. Please enter your passcode to continue.
            </p>
          </div>
          <div className="mt-6">
            <Input
              type="password"
              maxLength={4}
              value={passcode}
              onChange={handlePasscodeChange}
              className="text-center text-2xl"
              autoFocus
            />
          </div>
          <div className="mt-6">
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PasscodeComponent;
