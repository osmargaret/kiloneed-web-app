import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface HeaderActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

export function HeaderActionButton({
  label,
  onClick,
  icon,
  className = "",
  title,
}: HeaderActionButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className={`inline-flex items-center justify-center gap-0.5 h-5 px-2 rounded-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-[9.5px] font-semibold tracking-tight select-none shrink-0 cursor-pointer focus:outline-none transition-colors ${className}`}
    >
      <span className="inline-flex items-center justify-center">
        {icon ?? <Plus className="h-2 w-2 stroke-[2.5]" />}
      </span>
      <span className="leading-none">{label}</span>
    </motion.button>
  );
}

export default HeaderActionButton;
