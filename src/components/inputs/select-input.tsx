import "./select-input.css";

import React from "react";

import { useField } from "formik";
import ReactSelect from "react-select";

import { useAutoAnimate } from "../../utils/auto-animate";

interface ISelectInput extends React.ComponentProps<"input"> {
    name: string;
    label?: string;
    options: {
        label: string;
        value: string | number;
    }[];
}

const SelectInput: React.FC<ISelectInput> = ({
    name,
    label,
    options = [],
    className,
}) => {
    const [input, meta, helpers] = useField<string | number>(name);

    const error = meta.touched && (meta.error ?? false);

    return (
        <label htmlFor={name} ref={useAutoAnimate()} className={className}>
            {label && <p className="my-1 font-thin">{label}</p>}

            <ReactSelect
                classNamePrefix="select"
                className="select"
                name={name}
                options={options}
                onChange={(option) => helpers.setValue(option!.value)}
                value={options.find((option) => option?.value === input.value)}
                placeholder="Wybierz..."
                styles={{
                    option: (_, state) => ({
                        padding: "0.5rem 1rem",
                        backgroundColor: state.isSelected
                            ? "black"
                            : state.isFocused
                            ? "#242424"
                            : "transparent",
                    }),
                    control: (styles, state) => ({
                        ...styles,
                        borderColor: state.isFocused
                            ? "white !important"
                            : styles.outlineColor,
                        boxShadow: state.isFocused
                            ? "0 0 0 1px white !important"
                            : styles.boxShadow,
                    }),
                }}
            />

            {error && <p className="text-red-400 font-thin">{error}</p>}
        </label>
    );
};

export default SelectInput;
