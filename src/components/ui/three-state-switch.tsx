
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SwitchState = 'left' | 'neutral' | 'right';

interface ThreeStateSwitchProps {
  id?: string;
  value: SwitchState;
  onValueChange: (value: SwitchState) => void;
  className?: string;
}

export function ThreeStateSwitch({ id, value, onValueChange, className }: ThreeStateSwitchProps) {
  const handleStateChange = () => {
    if (value === 'left') {
      onValueChange('neutral');
    } else if (value === 'neutral') {
      onValueChange('right');
    } else {
      onValueChange('left');
    }
  };

  const getThumbPosition = () => {
    switch (value) {
      case 'left':
        return 'translate-x-[0.25rem]';
      case 'neutral':
        return 'translate-x-[2.25rem]';
      case 'right':
        return 'translate-x-[4.25rem]';
    }
  };
  
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={value !== 'neutral'}
      onClick={handleStateChange}
      className={cn(
        "relative inline-flex h-8 w-[6rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        value !== 'neutral' ? "bg-primary" : "bg-input",
        className
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inline-block h-6 w-6 transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
          getThumbPosition()
        )}
      />
    </button>
  );
}
