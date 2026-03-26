export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            // Add Plus Jakarta Sans as the default font
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            // Add border-3 utility
            borderWidth: {
                '3': '3px',
            },
        },
    },
    plugins: [],
}