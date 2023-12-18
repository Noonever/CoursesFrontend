import React, { useState } from "react";

// Define the props using an interface
interface CheckboxProps {
    value?: boolean;
    onClick?: (value: boolean) => void; // Callback function that is optional
    style?: React.CSSProperties; // React's type for inline styles, which is optional
}

export default function Checkbox(props: CheckboxProps) {
    const [value, setValue] = useState(props.value);

    const handleClick = () => {
        const newValue = !value;
        setValue(newValue);
        if (props.onClick) {
            props.onClick(newValue); // Pass the new value instead of the old one
        }
    }

    return (
        <div className={"checkbox" + (value ? " checked" : "")} onClick={handleClick} style={props.style}>
            {value && (
                <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                    <path fill="white" d="m95.118,21.399l-8.517-8.517c-1.179-1.179-3.078-1.179-4.257,0l-43.545,45.972-24.960-24.972c-1.191-1.191-3.123-1.191-4.314,0l-8.628,8.634c-1.191,1.188-1.191,3.12 0,4.314l35.499,36.324c.687,.69 1.62,.927 2.517,.81 .927,.138 1.893-.096 2.604-.81l53.601-57.495c1.176-1.176 1.176-3.084 0-4.26z" stroke="white" />
                </svg>
            )}
        </div>
    );
}