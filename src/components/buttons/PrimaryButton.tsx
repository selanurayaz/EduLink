import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={`w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;