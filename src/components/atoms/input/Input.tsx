import type { InputProps } from "@/types/types";

const Input = ({ value, onChange, placeholder, style }: InputProps) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      className="input"
    />
  );
};
export default Input;
