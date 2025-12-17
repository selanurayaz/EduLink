import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({ label, icon, className, ...props }) => {
    return (
        <div className="flex flex-col gap-1.5">
            {/* Etiket rengi artık açık gri (text-gray-200) */}
            <label className="text-sm font-medium text-gray-200 ml-1">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    // İkon rengi de açık gri
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors">
                        {icon}
                    </div>
                )}
                {/* Input stili: Koyu şeffaf zemin, beyaz yazı, mavi odaklanma kenarlığı */}
                <input
                    className={`w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all 
          ${icon ? 'pl-10' : 'px-4'} ${className}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default TextInput;