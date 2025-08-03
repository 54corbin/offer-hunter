import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { FiLock } from 'react-icons/fi';

interface PasscodeComponentProps {
  onUnlock: (passcode: string) => void;
  isError: boolean;
}

const PasscodeComponent: React.FC<PasscodeComponentProps> = ({ onUnlock, isError }) => {
  const [passcode, setPasscode] = useState<string[]>(Array(4).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handlePasscodeChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newPasscode = [...passcode];
      newPasscode[index] = value;
      setPasscode(newPasscode);

      if (value !== '' && index < 3) {
        inputsRef.current[index + 1]?.focus();
      }

      if (newPasscode.every(digit => digit !== '')) {
        onUnlock(newPasscode.join(''));
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && passcode[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const getShakeClass = () => {
    return isError ? 'animate-shake' : '';
  };

  const setInputRef = (el: HTMLInputElement | null, index: number) => {
    inputsRef.current[index] = el;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <Card className={`w-full max-w-sm p-8 bg-white/80 dark:bg-slate-800/80 border border-slate-200/20 shadow-2xl ${getShakeClass()}`}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
            <FiLock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Enter Passcode</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            This extension is locked for your security.
          </p>
        </div>
        <div className="mt-8">
          <div className="flex justify-center gap-4">
            {passcode.map((digit, index) => (
              <input
                key={index}
                ref={el => setInputRef(el, index)}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePasscodeChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="h-16 w-12 rounded-lg border border-slate-300 bg-slate-50 text-center text-3xl font-semibold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-700 dark:text-white dark:border-slate-600"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>
        {isError && (
            <p className="mt-4 text-center text-sm text-red-500">
                Incorrect passcode. Please try again.
            </p>
        )}
        <div className="mt-8">
          <Button onClick={() => onUnlock(passcode.join(''))} className="w-full">
            Unlock
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PasscodeComponent;
