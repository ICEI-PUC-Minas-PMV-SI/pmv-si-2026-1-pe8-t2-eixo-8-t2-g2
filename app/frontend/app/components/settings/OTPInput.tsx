import { Input, Space, type InputRef } from 'antd';
import { useRef, useState } from 'react';

type OTPInputProps = {
  length: number;
  onChange?: (otp: string) => void;
  onSubmit?: (otp: string) => void;
};

export function OTPInput({ length, onChange, onSubmit }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(InputRef | null)[]>([]);

  const isSplit = length > 4 && length % 2 === 0;
  const half = length / 2;

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange?.(newValues.join(''));

    // foco automático
    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // submit automático
    if (newValues.every((v) => v !== '')) {
      onSubmit?.(newValues.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData('text');
    const digits = pasted.replace(/\D/g, '').slice(0, length);

    const newValues = digits.split('');
    while (newValues.length < length) newValues.push('');

    setValues(newValues);
    onChange?.(newValues.join(''));

    inputsRef.current[Math.min(digits.length - 1, length - 1)]?.focus();
  };

  const renderInputs = (start: number, end: number) =>
    values.slice(start, end).map((val, i) => {
      const index = start + i;
      return (
        <Input
          onPaste={handlePaste}
          key={index}
          value={val}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          style={{
            width: 40,
            height: 40,
            textAlign: 'center',
            fontSize: 18,
          }}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
        />
      );
    });

  return (
    <Space>
      {isSplit ? (
        <>
          <Space>{renderInputs(0, half)}</Space>
          <span style={{ fontSize: 18 }}>-</span>
          <Space>{renderInputs(half, length)}</Space>
        </>
      ) : (
        renderInputs(0, length)
      )}
    </Space>
  );
}
