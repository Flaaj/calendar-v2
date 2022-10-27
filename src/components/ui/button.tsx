import React, { ComponentProps } from "react";

import clsx from "clsx";

interface IButton extends ComponentProps<"button"> {
    variant: "main" | "secondary" | "outlined" | "light-bg";
}

const Button: React.FC<IButton> = ({
    variant,
    className,
    type = "button",
    ...props
}) => {
    return (
        <button
            type={type}
            className={clsx(
                "py-1 px-2 md:py-2 md:px-4 rounded-lg transition font-thin",
                variant === "main" && //
                    "bg-black text-white hover:bg-opacity-90",
                variant === "secondary" && //
                    "",
                variant === "outlined" &&
                    "border-2 border-black hover:border-opacity-60 bg-none",
                variant === "light-bg" && //
                    "bg-black bg-opacity-40",
                className
            )}
            {...props}
        />
    );
};

export default Button;
