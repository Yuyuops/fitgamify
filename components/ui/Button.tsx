
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-2 rounded-lg font-bold text-dojo-text transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dojo-card";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-dojo-glow-violet to-dojo-glow-blue shadow-neon-blue hover:shadow-neon-violet",
    secondary: "bg-dojo-border hover:bg-opacity-80"
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
