export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                canvas: '#0f0f0f',
                panel: '#1a1a1a',
                ink: '#f7f7f8',
                muted: '#a1a1aa',
                accent: '#22c55e',
            },
            boxShadow: {
                lift: '0 20px 45px -30px rgba(34, 197, 94, 0.55)',
            },
        },
    },
    plugins: [],
};
