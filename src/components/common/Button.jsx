export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = { primary: 'bg-[#d8ef69] text-[#17211f] hover:bg-[#c9e457]', secondary: 'bg-white text-[#17211f] border border-[#dfe6e2] hover:border-[#b8c7c0]', ghost: 'text-[#66736e] hover:bg-[#eef3f0]' }
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>
}