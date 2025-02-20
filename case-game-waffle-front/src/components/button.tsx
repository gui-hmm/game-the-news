interface ButtonProps {
    label: string;
    onClick: () => void;
  }
  
  const Button = ({ label, onClick }: ButtonProps) => {
    return (
      <button className="bg-yellow text-black px-4 py-2 rounded hover:bg-brown transition" onClick={onClick}>
        {label}
      </button>
    );
  };
  
  export default Button;
  