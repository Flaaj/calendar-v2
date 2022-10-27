import React from "react";

import { useField } from "formik";

import { useAutoAnimate } from "../../utils/auto-animate";

interface ITextarea extends React.ComponentProps<"textarea"> {
    name: string;
    label?: string;
}

const Textarea: React.FC<ITextarea> = ({
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

            <textarea
                id={name}
                rows={8}
                {...props}
                {...input}
                className="w-full resize-none px-4 py-3 rounded-md font-thin"
            />

            {error && <p className="text-red-400 font-thin">{error}</p>}
        </label>
    );
};

export default Textarea;
