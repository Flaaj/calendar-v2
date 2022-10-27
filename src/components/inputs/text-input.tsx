import React from "react";

import { useField } from "formik";

import { useAutoAnimate } from "../../utils/auto-animate";

interface ITextInput extends React.ComponentProps<"input"> {
    name: string;
    label?: string;
}

const TextInput: React.FC<ITextInput> = ({
    name,
    label,
    className,
    ...props
}) => {
    const [input, meta] = useField<string>(name);

    const error = meta.touched && (meta.error ?? false);

    return (
        <label htmlFor={name} ref={useAutoAnimate()} className={className}>
            {label && <p className="my-1 font-thin">{label}</p>}

            <input
                id={name}
                {...props}
                {...input}
                className="w-full px-4 py-2 rounded-md h-10 font-thin"
            />

            {error && <p className="text-red-400 font-thin">{error}</p>}
        </label>
    );
};

export default TextInput;
