/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: {
                    100: "#767676",
                    900: "#242424",
                },
            },
        },
    },
    plugins: [],
};
