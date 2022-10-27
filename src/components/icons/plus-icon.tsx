interface IPlusIcon {
    className?: string;
}

const PlusIcon: React.FC<IPlusIcon> = ({ className = "w-6 h-6" }) => (
    <svg
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
        />
    </svg>
);

export default PlusIcon;
