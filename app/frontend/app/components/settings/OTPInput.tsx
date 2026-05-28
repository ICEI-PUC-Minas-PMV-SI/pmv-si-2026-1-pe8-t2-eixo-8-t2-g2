import { Input, Space, type InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';

type OTPInputProps = {
  length: number;
  onChange?: (otp: string) => void;
  onSubmit?: (otp: string) => void;

  /**
   * default: numeric
   */
  mode?: 'numeric' | 'alphanumeric';
};

export function OTPInput({
  length,
  onChange,
  onSubmit,
  mode = 'numeric',
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(
    Array(length).fill(''),
  );

  const inputsRef = useRef<(InputRef | null)[]>([]);

  const isSplit = length > 4 && length % 2 === 0;
  const half = length / 2;

  useEffect(() => {
    setValues(Array(length).fill(''));
  }, [length]);

  const normalize = (value: string) => {
    const upper = value.toUpperCase();

    if (mode === 'numeric') {
      return upper.replace(/\D/g, '');
    }

    return upper.replace(/[^A-Z0-9]/g, '');
  };

  const emit = (newValues: string[]) => {
    const joined = newValues.join('');

    onChange?.(joined);

    if (newValues.every((v) => v !== '')) {
      onSubmit?.(joined);
    }
  };

  const handleChange = (
    value: string,
    index: number,
  ) => {
    const normalized = normalize(value);

    if (normalized.length > 1) return;

    const newValues = [...values];

    newValues[index] = normalized;

    setValues(newValues);

    emit(newValues);

    // próximo input
    if (normalized && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
  ) => {
    if (
      e.key === 'Backspace' &&
      !values[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent,
  ) => {
    e.preventDefault();

    const pasted = normalize(
      e.clipboardData.getData('text'),
    ).slice(0, length);

    const chars = pasted.split('');

    while (chars.length < length) {
      chars.push('');
    }

    setValues(chars);

    emit(chars);

    const focusIndex = Math.min(
      pasted.length,
      length - 1,
    );

    inputsRef.current[focusIndex]?.focus();
  };

  const renderInputs = (
    start: number,
    end: number,
  ) =>
    values.slice(start, end).map((val, i) => {
      const index = start + i;

      return (
        <Input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          value={val}
          maxLength={1}
          onPaste={handlePaste}
          onChange={(e) =>
            handleChange(e.target.value, index)
          }
          onKeyDown={(e) =>
            handleKeyDown(e, index)
          }
          autoComplete="one-time-code"
          inputMode={
            mode === 'numeric'
              ? 'numeric'
              : 'text'
          }
          style={{
            width: 40,
            height: 40,
            textAlign: 'center',
            fontSize: 18,
            textTransform: 'uppercase',
          }}
        />
      );
    });

  return (
    <Space>
      {isSplit ? (
        <>
          <Space>{renderInputs(0, half)}</Space>

          <span style={{ fontSize: 18 }}>
            -
          </span>

          <Space>
            {renderInputs(half, length)}
          </Space>
        </>
      ) : (
        renderInputs(0, length)
      )}
    </Space>
  );
}